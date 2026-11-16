import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Animated,
  Easing,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ozet'); // 'ozet', 'finans', 'portfoy'
  const [finansSubTab, setFinansSubTab] = useState('genel'); // 'genel', 'islemler', 'bankalar', 'krediler', 'alacaklilar'
  const [portfoySubTab, setPortfoySubTab] = useState('mulkler'); // 'mulkler', 'talepler'

  // Modal State'leri
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState(''); // 'kredi', 'banka', 'alacakli', 'mulk', 'talep', 'islem'
  const [duzenleId, setDuzenleId] = useState(null);

  // Gelir/Gider, Mülk ve Talep Özel State'leri
  const [islemTuru, setIslemTuru] = useState('gelir'); // 'gelir' veya 'gider'
  const [mulkKategori, setMulkKategori] = useState('Satılık'); // 'Satılık' veya 'Kiralık'
  const [talepKategori, setTalepKategori] = useState('Satılık'); // 'Satılık' veya 'Kiralık'
  const [seciliBankaId, setSeciliBankaId] = useState('');

  // Form State'leri
  const [input1, setInput1] = useState('');
  const [input2, setInput2] = useState('');
  const [input3, setInput3] = useState('');
  const [input4, setInput4] = useState('');
  const [input5, setInput5] = useState('');

  // Veri Listeleri
  const [kredilerListesi, setKredilerListesi] = useState([]);
  const [bankalarListesi, setBankalarListesi] = useState([]);
  const [alacaklilarListesi, setAlacaklilarListesi] = useState([]);
  const [islemlerListesi, setIslemlerListesi] = useState([]);
  const [mulklerListesi, setMulklerListesi] = useState([]);
  const [taleplerListesi, setTaleplerListesi] = useState([]);

  const progressAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Garanti Binlik Ayraç Formatlayıcı (8.000.000)
  const noktaKoy = (val) => {
    if (val === null || val === undefined || val === '') return '';
    const temiz = val.toString().replace(/\D/g, '');
    if (!temiz) return '';
    return temiz.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const paraGoster = (sayi) => {
    const num = Number(sayi) || 0;
    const isNegative = num < 0;
    const formatli = noktaKoy(Math.abs(Math.round(num))) || '0';
    return (isNegative ? '-₺' : '₺') + formatli;
  };

  const sayiCoz = (str) => {
    if (!str) return 0;
    return Number(str.toString().replace(/\D/g, '')) || 0;
  };

  useEffect(() => {
    veriYukle();
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 1500,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      useNativeDriver: false,
    }).start(() => {
      setTimeout(() => setIsLoading(false), 150);
    });
  }, []);

  const veriYukle = async () => {
    try {
      const k = await AsyncStorage.getItem('@patron_krediler_v3');
      const b = await AsyncStorage.getItem('@patron_bankalar_v3');
      const a = await AsyncStorage.getItem('@patron_alacaklilar_v3');
      const i = await AsyncStorage.getItem('@patron_islemler_v3');
      const m = await AsyncStorage.getItem('@patron_mulkler_v3');
      const t = await AsyncStorage.getItem('@patron_talepler_v3');

      if (k !== null) setKredilerListesi(JSON.parse(k));
      if (b !== null) setBankalarListesi(JSON.parse(b));
      if (a !== null) setAlacaklilarListesi(JSON.parse(a));
      if (i !== null) setIslemlerListesi(JSON.parse(i));
      if (m !== null) setMulklerListesi(JSON.parse(m));
      if (t !== null) setTaleplerListesi(JSON.parse(t));
    } catch (e) {
      console.log(e);
    }
  };

  const veriKaydet = async (key, data) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.log(e);
    }
  };

  // CANLI FİNANSAL HESAPLAMALAR
  const toplamNakit = bankalarListesi.reduce((acc, item) => acc + (Number(item.bakiye) || 0), 0);
  const toplamKmh = bankalarListesi.reduce((acc, item) => acc + (Number(item.kmh) || 0), 0);
  const kullanilabilirNakitGucu = toplamNakit + toplamKmh;
  const toplamAlacak = alacaklilarListesi.reduce((acc, item) => acc + (Number(item.tutar) || 0), 0);
  const toplamKrediBorcu = kredilerListesi.reduce((acc, item) => acc + (Number(item.tutar) || 0), 0);

  const netMevcutDurum = toplamNakit;
  const potansiyelDurum = toplamNakit + toplamAlacak;

  // Hesap kârda mı ekside mi? (Görsel tema için renk seçimi)
  const isKarda = netMevcutDurum >= 0;
  const grafikAnaRenk = isKarda ? '#00ff7f' : '#ff4d4d'; // Yeşil veya Kırmızı/Vişne Çürüğü
  const grafikZeminGlow = isKarda ? 'rgba(0, 255, 127, 0.15)' : 'rgba(255, 77, 77, 0.15)';

  const islemModaliniAc = (tur = 'gelir') => {
    if (bankalarListesi.length === 0) {
      Alert.alert(
        'Banka Hesabı Gerekli',
        'Gelir veya gider işleyebilmek için önce "Bankalar" sekmesinden en az bir banka hesabı eklemelisiniz.'
      );
      return;
    }
    formuSifirla();
    setModalType('islem');
    setIslemTuru(tur);
    setSeciliBankaId(bankalarListesi[0].id);
    setModalVisible(true);
  };

  const kaydetVeyaGuncelle = () => {
    if (!input1.trim()) {
      Alert.alert('Eksik Bilgi', 'Lütfen temel alanı doldurunuz.');
      return;
    }

    if (modalType === 'islem') {
      const tutarSayi = sayiCoz(input2);
      if (tutarSayi <= 0) {
        Alert.alert('Hatalı Tutar', 'Lütfen geçerli bir tutar giriniz.');
        return;
      }
      const hedefBanka = bankalarListesi.find((b) => b.id === seciliBankaId);
      if (!hedefBanka) {
        Alert.alert('Banka Seçilmedi', 'Lütfen işlemin yapılacağı bankayı seçiniz.');
        return;
      }

      const guncelBankalar = bankalarListesi.map((b) => {
        if (b.id === seciliBankaId) {
          const yeniBakiye =
            islemTuru === 'gelir'
              ? (Number(b.bakiye) || 0) + tutarSayi
              : (Number(b.bakiye) || 0) - tutarSayi;
          return { ...b, bakiye: yeniBakiye };
        }
        return b;
      });
      setBankalarListesi(guncelBankalar);
      veriKaydet('@patron_bankalar_v3', guncelBankalar);

      const bugun = new Date();
      const tarihMetni = `${bugun.getDate()}.${bugun.getMonth() + 1}.${bugun.getFullYear()}`;
      const yeniIslem = {
        id: Date.now().toString(),
        tur: islemTuru,
        aciklama: input1,
        tutar: tutarSayi,
        bankaId: hedefBanka.id,
        bankaAdi: hedefBanka.isim,
        tarih: tarihMetni,
      };
      const yeniIslemListesi = [yeniIslem, ...islemlerListesi];
      setIslemlerListesi(yeniIslemListesi);
      veriKaydet('@patron_islemler_v3', yeniIslemListesi);

      formuSifirla();
      return;
    }

    if (duzenleId) {
      if (modalType === 'kredi') {
        const yeni = kredilerListesi.map((x) =>
          x.id === duzenleId
            ? {
                ...x,
                baslik: input1,
                tutar: sayiCoz(input2),
                toplamTaksit: input3 || '12',
                mevcutTaksit: input4 || '1',
                odemeTarihi: input5 || 'Belirtilmedi',
              }
            : x
        );
        setKredilerListesi(yeni);
        veriKaydet('@patron_krediler_v3', yeni);
      } else if (modalType === 'banka') {
        const yeni = bankalarListesi.map((x) =>
          x.id === duzenleId
            ? { ...x, isim: input1, bakiye: sayiCoz(input2), kmh: sayiCoz(input3) }
            : x
        );
        setBankalarListesi(yeni);
        veriKaydet('@patron_bankalar_v3', yeni);
      } else if (modalType === 'alacakli') {
        const yeni = alacaklilarListesi.map((x) =>
          x.id === duzenleId ? { ...x, isim: input1, tutar: sayiCoz(input2) } : x
        );
        setAlacaklilarListesi(yeni);
        veriKaydet('@patron_alacaklilar_v3', yeni);
      } else if (modalType === 'mulk') {
        const yeni = mulklerListesi.map((x) =>
          x.id === duzenleId
            ? {
                ...x,
                baslik: input1,
                tip: input2 || 'Konut',
                islemTipi: mulkKategori,
                fiyat: sayiCoz(input3),
                detay: input4 || 'Özel mülk',
              }
            : x
        );
        setMulklerListesi(yeni);
        veriKaydet('@patron_mulkler_v3', yeni);
      } else if (modalType === 'talep') {
        const yeni = taleplerListesi.map((x) =>
          x.id === duzenleId
            ? {
                ...x,
                musteri: input1,
                bolge: input2 || 'Genel',
                islemTipi: talepKategori,
                butce: sayiCoz(input3),
                detay: `${input2 || 'Merkez'} - ${talepKategori} Talep`,
              }
            : x
        );
        setTaleplerListesi(yeni);
        veriKaydet('@patron_talepler_v3', yeni);
      }
    } else {
      const id = Date.now().toString();
      if (modalType === 'kredi') {
        const yeni = [
          ...kredilerListesi,
          {
            id,
            baslik: input1,
            tutar: sayiCoz(input2),
            toplamTaksit: input3 || '12',
            mevcutTaksit: input4 || '1',
            odemeTarihi: input5 || 'Her Ayın 15i',
          },
        ];
        setKredilerListesi(yeni);
        veriKaydet('@patron_krediler_v3', yeni);
      } else if (modalType === 'banka') {
        const yeni = [
          ...bankalarListesi,
          { id, isim: input1, bakiye: sayiCoz(input2), kmh: sayiCoz(input3) },
        ];
        setBankalarListesi(yeni);
        veriKaydet('@patron_bankalar_v3', yeni);
      } else if (modalType === 'alacakli') {
        const yeni = [...alacaklilarListesi, { id, isim: input1, tutar: sayiCoz(input2) }];
        setAlacaklilarListesi(yeni);
        veriKaydet('@patron_alacaklilar_v3', yeni);
      } else if (modalType === 'mulk') {
        const yeni = [
          ...mulklerListesi,
          {
            id,
            baslik: input1,
            tip: input2 || 'Konut',
            islemTipi: mulkKategori,
            fiyat: sayiCoz(input3),
            detay: input4 || 'Özel portföy',
          },
        ];
        setMulklerListesi(yeni);
        veriKaydet('@patron_mulkler_v3', yeni);
      } else if (modalType === 'talep') {
        const yeni = [
          ...taleplerListesi,
          {
            id,
            musteri: input1,
            bolge: input2 || 'Genel',
            islemTipi: talepKategori,
            tip: 'Konut',
            butce: sayiCoz(input3),
            detay: `${input2 || 'Merkez'} - ${talepKategori} Alıcı Talebi`,
          },
        ];
        setTaleplerListesi(yeni);
        veriKaydet('@patron_talepler_v3', yeni);
      }
    }

    formuSifirla();
  };

  const formuSifirla = () => {
    setInput1('');
    setInput2('');
    setInput3('');
    setInput4('');
    setInput5('');
    setMulkKategori('Satılık');
    setTalepKategori('Satılık');
    setDuzenleId(null);
    setModalVisible(false);
  };

  const duzenleAc = (type, item) => {
    setModalType(type);
    setDuzenleId(item.id);
    if (type === 'kredi') {
      setInput1(item.baslik);
      setInput2(noktaKoy(item.tutar));
      setInput3(item.toplamTaksit);
      setInput4(item.mevcutTaksit);
      setInput5(item.odemeTarihi);
    } else if (type === 'banka') {
      setInput1(item.isim);
      setInput2(noktaKoy(item.bakiye));
      setInput3(noktaKoy(item.kmh));
    } else if (type === 'alacakli') {
      setInput1(item.isim);
      setInput2(noktaKoy(item.tutar));
    } else if (type === 'mulk') {
      setInput1(item.baslik);
      setInput2(item.tip);
      setMulkKategori(item.islemTipi || 'Satılık');
      setInput3(noktaKoy(item.fiyat));
      setInput4(item.detay);
    } else if (type === 'talep') {
      setInput1(item.musteri);
      setInput2(item.bolge);
      setTalepKategori(item.islemTipi || 'Satılık');
      setInput3(noktaKoy(item.butce));
    }
    setModalVisible(true);
  };

  const sil = (type, id) => {
    if (type === 'kredi') {
      const yeni = kredilerListesi.filter((x) => x.id !== id);
      setKredilerListesi(yeni);
      veriKaydet('@patron_krediler_v3', yeni);
    } else if (type === 'banka') {
      const yeni = bankalarListesi.filter((x) => x.id !== id);
      setBankalarListesi(yeni);
      veriKaydet('@patron_bankalar_v3', yeni);
    } else if (type === 'alacakli') {
      const yeni = alacaklilarListesi.filter((x) => x.id !== id);
      setAlacaklilarListesi(yeni);
      veriKaydet('@patron_alacaklilar_v3', yeni);
    } else if (type === 'islem') {
      const silinecek = islemlerListesi.find((x) => x.id === id);
      if (silinecek) {
        const guncelBankalar = bankalarListesi.map((b) => {
          if (b.id === silinecek.bankaId) {
            const duzeltilmis =
              silinecek.tur === 'gelir'
                ? (Number(b.bakiye) || 0) - silinecek.tutar
                : (Number(b.bakiye) || 0) + silinecek.tutar;
            return { ...b, bakiye: duzeltilmis };
          }
          return b;
        });
        setBankalarListesi(guncelBankalar);
        veriKaydet('@patron_bankalar_v3', guncelBankalar);
      }
      const yeni = islemlerListesi.filter((x) => x.id !== id);
      setIslemlerListesi(yeni);
      veriKaydet('@patron_islemler_v3', yeni);
    } else if (type === 'mulk') {
      const yeni = mulklerListesi.filter((x) => x.id !== id);
      setMulklerListesi(yeni);
      veriKaydet('@patron_mulkler_v3', yeni);
    } else if (type === 'talep') {
      const yeni = taleplerListesi.filter((x) => x.id !== id);
      setTaleplerListesi(yeni);
      veriKaydet('@patron_talepler_v3', yeni);
    }
  };

  const maksimumDeger = Math.max(Math.abs(potansiyelDurum), Math.abs(netMevcutDurum), 10000);
  const mevcutYuzde = Math.min(Math.max((netMevcutDurum / maksimumDeger) * 35 + 45, 10), 80);
  const potansiyelYuzde = Math.min(Math.max((potansiyelDurum / maksimumDeger) * 35 + 45, 5), 75);

  const kisalt = (sayi) => {
    if (Math.abs(sayi) >= 1000000) return (sayi / 1000000).toFixed(1) + 'M';
    if (Math.abs(sayi) >= 1000) return Math.round(sayi / 1000) + 'k';
    return sayi.toString();
  };

  if (isLoading) {
    return (
      <View style={styles.splashContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />
        <Animated.View style={{ opacity: fadeAnim, alignItems: 'center' }}>
          <Text style={styles.splashSub}>TOCO TİCARET OFİSİ</Text>
          <Text style={styles.splashLogo}>PATRON</Text>
          <View style={styles.progressTrack}>
            <Animated.View
              style={[
                styles.progressFill,
                { width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) },
              ]}
            />
          </View>
          <Text style={styles.loadingInfoText}>Sistem verileri yükleniyor...</Text>
        </Animated.View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />

      <View style={styles.header}>
        <View style={styles.headerLeftGroup}>
          <Text style={styles.subHeaderText}>TOCO Ticaret Ofisi</Text>
          <View style={styles.patronBox}>
            <Text style={styles.patronBoxText}>PATRON</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.notificationBadge} onPress={() => setActiveTab('portfoy')}>
          <Text style={styles.notificationText}>
            🔔 {taleplerListesi.length > 0 && mulklerListesi.length > 0 ? '1' : '0'} Eşleşme
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'ozet' && (
          <View>
            {taleplerListesi.length > 0 && mulklerListesi.length > 0 ? (
              <View style={styles.alertCard}>
                <Text style={styles.alertTitle}>🎯 YENİ PORTFÖY &amp; TALEP EŞLEŞMESİ</Text>
                <Text style={styles.alertDesc}>
                  • {taleplerListesi[0].musteri} ({taleplerListesi[0].bolge} - Bütçe:{' '}
                  {paraGoster(taleplerListesi[0].butce)}) talebi ile portföyünüz eşleşti!
                </Text>
              </View>
            ) : (
              <View style={styles.emptyCardNotice}>
                <Text style={styles.emptyNoticeText}>
                  Aktif eşleşme yok. Mülk ve talep ekledikçe eşleşmeler burada görünür.
                </Text>
              </View>
            )}

            {kredilerListesi.length > 0 ? (
              <View style={styles.warningCard}>
                <Text style={styles.warningTitle}>🔔 YAKLAŞAN KREDİ ÖDEMESİ</Text>
                <Text style={styles.warningDesc}>
                  • {kredilerListesi[0].baslik}: {paraGoster(kredilerListesi[0].tutar)} (
                  {kredilerListesi[0].mevcutTaksit}/{kredilerListesi[0].toplamTaksit} Taksit -{' '}
                  {kredilerListesi[0].odemeTarihi})
                </Text>
              </View>
            ) : null}

            <View style={styles.row}>
              <View style={styles.infoBox}>
                <Text style={styles.boxLabel}>Mevcut Nakit</Text>
                <Text style={styles.boxValueGreen}>{paraGoster(toplamNakit)}</Text>
                <Text style={styles.boxSub}>KMH Dahil: {paraGoster(kullanilabilirNakitGucu)}</Text>
              </View>
              <View style={styles.infoBox}>
                <Text style={styles.boxLabel}>Toplam Alacak</Text>
                <Text style={styles.boxValueYellow}>{paraGoster(toplamAlacak)}</Text>
                <Text style={styles.boxSub}>{alacaklilarListesi.length} alacak kaydı</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Hızlı Kasa İşlemi</Text>
            <View style={styles.row}>
              <TouchableOpacity
                style={[styles.quickActionHalfBtn, { backgroundColor: '#0f381c', borderColor: '#2ecc71' }]}
                onPress={() => islemModaliniAc('gelir')}
              >
                <Text style={{ color: '#2ecc71', fontWeight: 'bold', fontSize: 13 }}>+ Gelir İşle (Komisyon)</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.quickActionHalfBtn, { backgroundColor: '#3b1212', borderColor: '#ff4d4d' }]}
                onPress={() => islemModaliniAc('gider')}
              >
                <Text style={{ color: '#ff4d4d', fontWeight: 'bold', fontSize: 13 }}>- Gider İşle (Masraf)</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>Yönetim Menüleri</Text>
            <TouchableOpacity style={styles.primaryButton} onPress={() => setActiveTab('finans')}>
              <Text style={styles.primaryButtonText}>💳 Finans, Bankalar, Kredi &amp; Hareketler</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={() => setActiveTab('portfoy')}>
              <Text style={styles.secondaryButtonText}>🏢 Gayrimenkul Portföy &amp; Talep Listesi</Text>
            </TouchableOpacity>
            <View style={styles.statusBox}>
              <Text style={styles.statusText}>● Yerel Veri &amp; Canlı Eşleşme Motoru Aktif</Text>
            </View>
          </View>
        )}

        {activeTab === 'finans' && (
          <View>
            <View style={styles.rowBetween}>
              <Text style={styles.sectionTitle}>Finans &amp; Kasa</Text>
              <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity
                  style={[styles.miniButton, { backgroundColor: '#1b4d2b', marginRight: 6 }]}
                  onPress={() => islemModaliniAc('gelir')}
                >
                  <Text style={styles.miniButtonText}>+ Gelir / Gider</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.miniButton}
                  onPress={() => {
                    formuSifirla();
                    if (finansSubTab === 'bankalar') setModalType('banka');
                    else if (finansSubTab === 'alacaklilar') setModalType('alacakli');
                    else setModalType('kredi');
                    setModalVisible(true);
                  }}
                >
                  <Text style={styles.miniButtonText}>
                    {finansSubTab === 'bankalar'
                      ? '+ Banka'
                      : finansSubTab === 'alacaklilar'
                      ? '+ Alacaklı'
                      : '+ Kredi'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.subTabContainer}>
              {[
                { key: 'genel', label: 'GENEL' },
                { key: 'islemler', label: 'GELİR / GİDER' },
                { key: 'bankalar', label: 'BANKALAR' },
                { key: 'krediler', label: 'KREDİLER' },
                { key: 'alacaklilar', label: 'ALACAKLILAR' },
              ].map((tab) => (
                <TouchableOpacity
                  key={tab.key}
                  style={[styles.subTabButton, finansSubTab === tab.key && styles.subTabActive]}
                  onPress={() => setFinansSubTab(tab.key)}
                >
                  <Text style={[styles.subTabText, finansSubTab === tab.key && styles.subTextActive]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* YENİ: DOLGULU, BLUR/GRADYAN EFEKTLİ VE DİNAMİK RENKLİ GRAFİK */}
            <View style={styles.chartCard}>
              <View style={styles.rowBetween}>
                <Text style={styles.chartTitle}>Canlı Kasa &amp; Potansiyel Analizi</Text>
                <View style={[styles.profitBadge, { backgroundColor: isKarda ? '#1b4d2b' : '#3b1212' }]}>
                  <Text style={[styles.profitBadgeText, { color: grafikAnaRenk }]}>{paraGoster(netMevcutDurum)}</Text>
                </View>
              </View>
              <View style={styles.legendRow}>
                <Text style={[styles.legendBlue, { color: grafikAnaRenk }]}>● Mevcut Nakit: {paraGoster(netMevcutDurum)}</Text>
                <Text style={styles.legendGold}>┄ Alacak Dahil: {paraGoster(potansiyelDurum)}</Text>
              </View>

              <View style={[styles.graphVisualContainer, { backgroundColor: '#131815' }]}>
                {/* Blur / Gradyan Dolgu Efekti Katmanları */}
                <View style={[styles.blurGradientOverlay, { backgroundColor: grafikZeminGlow, bottom: `${mevcutYuzde / 2}%`, height: `${mevcutYuzde}%` }]} />
                
                <View style={styles.graphBaseLine} />

                {/* Potansiyel Alacak Çizgisi */}
                <View style={[styles.graphLineGold, { bottom: `${potansiyelYuzde}%` }]} />
                <View style={[styles.graphDotGold, { left: '12%', bottom: `${potansiyelYuzde - 6}%` }]}>
                  <Text style={styles.dotTextGold}>{kisalt(potansiyelDurum)}</Text>
                </View>
                <View style={[styles.graphDotGold, { left: '48%', bottom: `${potansiyelYuzde - 6}%` }]}>
                  <Text style={styles.dotTextGold}>{kisalt(potansiyelDurum)}</Text>
                </View>
                <View style={[styles.graphDotGold, { left: '82%', bottom: `${potansiyelYuzde - 6}%` }]}>
                  <Text style={styles.dotTextGold}>{kisalt(potansiyelDurum)}</Text>
                </View>

                {/* Mevcut Nakit Çizgisi (Dinamik Renkli: Yeşil / Kırmızı) */}
                <View style={[styles.graphLineDynamic, { bottom: `${mevcutYuzde}%`, backgroundColor: grafikAnaRenk, shadowColor: grafikAnaRenk }]} />
                <View style={[styles.graphDotDynamic, { left: '12%', bottom: `${mevcutYuzde - 6}%`, borderColor: grafikAnaRenk, backgroundColor: isKarda ? '#0d2b18' : '#3b1212' }]}>
                  <Text style={[styles.dotTextDynamic, { color: grafikAnaRenk }]}>{kisalt(netMevcutDurum)}</Text>
                </View>
                <View style={[styles.graphDotDynamic, { left: '48%', bottom: `${mevcutYuzde - 6}%`, borderColor: grafikAnaRenk, backgroundColor: isKarda ? '#0d2b18' : '#3b1212' }]}>
                  <Text style={[styles.dotTextDynamic, { color: grafikAnaRenk }]}>{kisalt(netMevcutDurum)}</Text>
                </View>
                <View style={[styles.graphDotDynamic, { left: '82%', bottom: `${mevcutYuzde - 6}%`, borderColor: grafikAnaRenk, backgroundColor: isKarda ? '#0d2b18' : '#3b1212' }]}>
                  <Text style={[styles.dotTextDynamic, { color: grafikAnaRenk }]}>{kisalt(netMevcutDurum)}</Text>
                </View>
              </View>
              <View style={styles.graphMonthsRow}>
                <Text style={styles.monthText}>Başlangıç</Text>
                <Text style={styles.monthText}>Güncel Nakit</Text>
                <Text style={styles.monthText}>Tahsilat Sonrası</Text>
              </View>
            </View>

            <View style={styles.infoBoxFull}>
              <Text style={styles.boxLabel}>Toplam Kullanılabilir Nakit Gücü (Banka + KMH)</Text>
              <Text style={styles.boxValueWhite}>{paraGoster(kullanilabilirNakitGucu)}</Text>
            </View>

            {(finansSubTab === 'genel' || finansSubTab === 'islemler') && (
              <View style={{ marginBottom: 15 }}>
                <Text style={styles.sectionTitle}>Son Gelir &amp; Gider Hareketleri</Text>
                {islemlerListesi.length === 0 ? (
                  <Text style={styles.emptyText}>Henüz gelir veya gider işlemi girilmemiş.</Text>
                ) : (
                  islemlerListesi.map((isl) => (
                    <View key={isl.id} style={styles.bankCard}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.bankTitle}>
                          {isl.tur === 'gelir' ? '🟢 ' : '🔴 '}
                          {isl.aciklama}
                        </Text>
                        <Text style={styles.propertySub}>
                          Banka: {isl.bankaAdi} | Tarih: {isl.tarih}
                        </Text>
                        <Text
                          style={{
                            color: isl.tur === 'gelir' ? '#00ff7f' : '#ff5555',
                            fontWeight: 'bold',
                            fontSize: 13,
                          }}
                        >
                          {isl.tur === 'gelir' ? '+' : '-'}
                          {paraGoster(isl.tutar)}
                        </Text>
                      </View>
                      <TouchableOpacity style={styles.deleteBtnSmall} onPress={() => sil('islem', isl.id)}>
                        <Text style={styles.btnTextRed}>Geri Al / Sil</Text>
                      </TouchableOpacity>
                    </View>
                  ))
                )}
              </View>
            )}

            {(finansSubTab === 'genel' || finansSubTab === 'bankalar') && (
              <View style={{ marginBottom: 15 }}>
                <Text style={styles.sectionTitle}>Banka Hesapları &amp; KMH</Text>
                {bankalarListesi.length === 0 ? (
                  <Text style={styles.emptyText}>Henüz kayıtlı banka hesabı yok.</Text>
                ) : (
                  bankalarListesi.map((b) => (
                    <View key={b.id} style={styles.bankCard}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.bankTitle}>{b.isim}</Text>
                        <Text style={styles.propertySub}>
                          Nakit: <Text style={{ color: '#00ff7f', fontWeight: 'bold' }}>{paraGoster(b.bakiye)}</Text> | KMH:{' '}
                          <Text style={{ color: '#4da6ff', fontWeight: 'bold' }}>{paraGoster(b.kmh)}</Text>
                        </Text>
                      </View>
                      <View style={styles.actionRowBtn}>
                        <TouchableOpacity style={styles.editBtnSmall} onPress={() => duzenleAc('banka', b)}>
                          <Text style={styles.btnTextOrange}>Düzenle</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.deleteBtnSmall} onPress={() => sil('banka', b.id)}>
                          <Text style={styles.btnTextRed}>Sil</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                )}
              </View>
            )}

            {(finansSubTab === 'genel' || finansSubTab === 'krediler') && (
              <View style={{ marginBottom: 15 }}>
                <View style={styles.rowBetween}>
                  <Text style={styles.sectionTitle}>Aktif Krediler (Borç Takibi)</Text>
                  <Text style={{ color: '#ff5555', fontSize: 12, fontWeight: 'bold' }}>
                    Aylık Toplam: {paraGoster(toplamKrediBorcu)}
                  </Text>
                </View>
                {kredilerListesi.length === 0 ? (
                  <Text style={styles.emptyText}>Henüz kayıtlı kredi yok.</Text>
                ) : (
                  kredilerListesi.map((k) => (
                    <View key={k.id} style={styles.bankCard}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.bankTitle}>{k.baslik}</Text>
                        <Text style={styles.propertySub}>
                          Taksit Tutarı: <Text style={{ color: '#ff5555', fontWeight: 'bold' }}>{paraGoster(k.tutar)}</Text>
                        </Text>
                        <Text style={styles.propertySub}>
                          Durum: {k.mevcutTaksit}. Taksit / {k.toplamTaksit} Taksit | Tarih: {k.odemeTarihi}
                        </Text>
                      </View>
                      <View style={styles.actionRowBtn}>
                        <TouchableOpacity style={styles.editBtnSmall} onPress={() => duzenleAc('kredi', k)}>
                          <Text style={styles.btnTextOrange}>Düzenle</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.deleteBtnSmall} onPress={() => sil('kredi', k.id)}>
                          <Text style={styles.btnTextRed}>Sil</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                )}
              </View>
            )}

            {(finansSubTab === 'genel' || finansSubTab === 'alacaklilar') && (
              <View style={{ marginBottom: 15 }}>
                <Text style={styles.sectionTitle}>Alacaklılar Listesi</Text>
                {alacaklilarListesi.length === 0 ? (
                  <Text style={styles.emptyText}>Henüz kayıtlı alacak yok.</Text>
                ) : (
                  alacaklilarListesi.map((a) => (
                    <View key={a.id} style={styles.bankCard}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.bankTitle}>{a.isim}</Text>
                        <Text style={styles.propertySub}>
                          Alacak Tutarı: <Text style={{ color: '#ffd700', fontWeight: 'bold' }}>{paraGoster(a.tutar)}</Text>
                        </Text>
                      </View>
                      <View style={styles.actionRowBtn}>
                        <TouchableOpacity style={styles.editBtnSmall} onPress={() => duzenleAc('alacakli', a)}>
                          <Text style={styles.btnTextOrange}>Düzenle</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.deleteBtnSmall} onPress={() => sil('alacakli', a.id)}>
                          <Text style={styles.btnTextRed}>Sil</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                )}
              </View>
            )}
          </View>
        )}

        {activeTab === 'portfoy' && (
          <View>
            <View style={styles.rowBetween}>
              <Text style={styles.sectionTitle}>Portföy &amp; Talep Yönetimi</Text>
              <TouchableOpacity
                style={styles.miniButtonRed}
                onPress={() => {
                  formuSifirla();
                  setModalType(portfoySubTab === 'mulkler' ? 'mulk' : 'talep');
                  setModalVisible(true);
                }}
              >
                <Text style={styles.miniButtonText}>
                  {portfoySubTab === 'mulkler' ? '+ Mülk Ekle' : '+ Talep Ekle'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.row}>
              <TouchableOpacity
                style={[styles.portfoyTabBtn, portfoySubTab === 'mulkler' && styles.portfoyTabActive]}
                onPress={() => setPortfoySubTab('mulkler')}
              >
                <Text style={styles.portfoyTabText}>🏠 Portföy Listesi ({mulklerListesi.length})</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.portfoyTabBtn, portfoySubTab === 'talepler' && styles.portfoyTabActive]}
                onPress={() => setPortfoySubTab('talepler')}
              >
                <Text style={styles.portfoyTabText}>🎯 Alıcı Talepleri ({taleplerListesi.length})</Text>
              </TouchableOpacity>
            </View>

            {portfoySubTab === 'mulkler' ? (
              <View>
                {mulklerListesi.length === 0 ? (
                  <Text style={styles.emptyText}>Henüz portföy mülk eklenmemiş.</Text>
                ) : (
                  mulklerListesi.map((m) => (
                    <View key={m.id} style={styles.propertyCard}>
                      <View style={styles.rowBetween}>
                        <View style={{ flexDirection: 'row' }}>
                          <View style={[styles.badgeBlue, { marginRight: 6 }]}>
                            <Text style={styles.badgeText}>{m.tip}</Text>
                          </View>
                          <View style={m.islemTipi === 'Kiralık' ? styles.badgeGreen : styles.badgeRed}>
                            <Text style={styles.badgeText}>{m.islemTipi || 'Satılık'}</Text>
                          </View>
                        </View>
                        <View style={styles.actionRowBtn}>
                          <TouchableOpacity style={styles.editBtnSmall} onPress={() => duzenleAc('mulk', m)}>
                            <Text style={styles.btnTextOrange}>Düzenle</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={styles.deleteBtnSmall} onPress={() => sil('mulk', m.id)}>
                            <Text style={styles.btnTextRed}>Sil</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                      <Text style={styles.propertyTitle}>{m.baslik}</Text>
                      <Text style={styles.propertySub}>{m.detay}</Text>
                      <Text style={styles.propertyPrice}>{paraGoster(m.fiyat)}</Text>
                    </View>
                  ))
                )}
              </View>
            ) : (
              <View>
                {taleplerListesi.length === 0 ? (
                  <Text style={styles.emptyText}>Henüz alıcı talebi eklenmemiş.</Text>
                ) : (
                  taleplerListesi.map((t) => (
                    <View key={t.id} style={styles.propertyCard}>
                      <View style={styles.rowBetween}>
                        <View style={t.islemTipi === 'Kiralık' ? styles.badgeGreen : styles.badgeRed}>
                          <Text style={styles.badgeText}>{t.islemTipi || 'Satılık'} Talep</Text>
                        </View>
                        <View style={styles.actionRowBtn}>
                          <TouchableOpacity style={styles.editBtnSmall} onPress={() => duzenleAc('talep', t)}>
                            <Text style={styles.btnTextOrange}>Düzenle</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={styles.deleteBtnSmall} onPress={() => sil('talep', t.id)}>
                            <Text style={styles.btnTextRed}>Sil</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                      <Text style={styles.propertyTitle}>{t.musteri}</Text>
                      <Text style={styles.propertySub}>
                        Bölge: {t.bolge} | Bütçe:{' '}
                        <Text style={{ color: '#00ff7f', fontWeight: 'bold' }}>{paraGoster(t.butce)}</Text>
                      </Text>
                      <Text style={styles.alertDesc}>{t.detay}</Text>
                    </View>
                  ))
                )}
              </View>
            )}
          </View>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              {modalType === 'islem'
                ? 'Gelir / Gider İşlemi'
                : duzenleId
                ? 'Kaydı Düzenle'
                : 'Yeni Kayıt Ekle'}
            </Text>

            {modalType === 'islem' && (
              <>
                <View style={styles.row}>
                  <TouchableOpacity
                    style={[
                      styles.typeSelectBtn,
                      islemTuru === 'gelir' && { backgroundColor: '#1b4d2b', borderColor: '#2ecc71' },
                    ]}
                    onPress={() => setIslemTuru('gelir')}
                  >
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>+ GELİR (Giriş)</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.typeSelectBtn,
                      islemTuru === 'gider' && { backgroundColor: '#800020', borderColor: '#ff4d4d' },
                    ]}
                    onPress={() => setIslemTuru('gider')}
                  >
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>- GİDER (Çıkış)</Text>
                  </TouchableOpacity>
                </View>

                <TextInput
                  style={styles.input}
                  placeholder={
                    islemTuru === 'gelir'
                      ? 'Gelir Açıklaması (Örn: Ören Daire Komisyonu)'
                      : 'Gider Açıklaması (Örn: Ofis Kirası / Yakıt)'
                  }
                  placeholderTextColor="#666"
                  value={input1}
                  onChangeText={setInput1}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Tutar (Örn: 45.000)"
                  placeholderTextColor="#666"
                  keyboardType="numeric"
                  value={input2}
                  onChangeText={(txt) => setInput2(noktaKoy(txt))}
                />

                <Text style={{ color: '#aaa', fontSize: 12, marginBottom: 8 }}>
                  {islemTuru === 'gelir' ? 'Hangi Bankaya Yattı?' : 'Hangi Bankadan Çıktı?'}
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
                  {bankalarListesi.map((b) => (
                    <TouchableOpacity
                      key={b.id}
                      style={[
                        styles.bankSelectChip,
                        seciliBankaId === b.id && { backgroundColor: '#1e3a5f', borderColor: '#4da6ff' },
                      ]}
                      onPress={() => setSeciliBankaId(b.id)}
                    >
                      <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>
                        {b.isim} ({paraGoster(b.bakiye)})
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            )}

            {modalType === 'kredi' && (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Kredi Adı (Örn: Ofis Kredisi)"
                  placeholderTextColor="#666"
                  value={input1}
                  onChangeText={setInput1}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Aylık Taksit Tutarı (Örn: 12.000)"
                  placeholderTextColor="#666"
                  keyboardType="numeric"
                  value={input2}
                  onChangeText={(txt) => setInput2(noktaKoy(txt))}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Toplam Taksit Sayısı (Örn: 12)"
                  placeholderTextColor="#666"
                  keyboardType="numeric"
                  value={input3}
                  onChangeText={setInput3}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Ödenecek Kaçıncı Taksit (Örn: 3)"
                  placeholderTextColor="#666"
                  keyboardType="numeric"
                  value={input4}
                  onChangeText={setInput4}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Ödeme Tarihi (Örn: Her Ayın 15'i)"
                  placeholderTextColor="#666"
                  value={input5}
                  onChangeText={setInput5}
                />
              </>
            )}

            {modalType === 'banka' && (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Banka Adı ve Türü (Örn: Ziraat Vadesiz)"
                  placeholderTextColor="#666"
                  value={input1}
                  onChangeText={setInput1}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Mevcut Nakit Bakiye (Örn: 150.000)"
                  placeholderTextColor="#666"
                  keyboardType="numeric"
                  value={input2}
                  onChangeText={(txt) => setInput2(noktaKoy(txt))}
                />
                <TextInput
                  style={styles.input}
                  placeholder="KMH / Ek Hesap Limiti (Örn: 50.000)"
                  placeholderTextColor="#666"
                  keyboardType="numeric"
                  value={input3}
                  onChangeText={(txt) => setInput3(noktaKoy(txt))}
                />
              </>
            )}

            {modalType === 'alacakli' && (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Kişi / Kurum Adı (Örn: Mehmet Bey)"
                  placeholderTextColor="#666"
                  value={input1}
                  onChangeText={setInput1}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Alacak Tutarı (Örn: 35.000)"
                  placeholderTextColor="#666"
                  keyboardType="numeric"
                  value={input2}
                  onChangeText={(txt) => setInput2(noktaKoy(txt))}
                />
              </>
            )}

            {modalType === 'mulk' && (
              <>
                <View style={styles.row}>
                  <TouchableOpacity
                    style={[
                      styles.typeSelectBtn,
                      mulkKategori === 'Satılık' && { backgroundColor: '#800020', borderColor: '#ff4d4d' },
                    ]}
                    onPress={() => setMulkKategori('Satılık')}
                  >
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>SATILIK</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.typeSelectBtn,
                      mulkKategori === 'Kiralık' && { backgroundColor: '#1b4d2b', borderColor: '#2ecc71' },
                    ]}
                    onPress={() => setMulkKategori('Kiralık')}
                  >
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>KİRALIK</Text>
                  </TouchableOpacity>
                </View>

                <TextInput
                  style={styles.input}
                  placeholder="Mülk Başlığı (Örn: Ören Lüks Villa)"
                  placeholderTextColor="#666"
                  value={input1}
                  onChangeText={setInput1}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Mülk Tipi (Örn: Konut / Zeytinlik)"
                  placeholderTextColor="#666"
                  value={input2}
                  onChangeText={setInput2}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Fiyat (Örn: 8.000.000)"
                  placeholderTextColor="#666"
                  keyboardType="numeric"
                  value={input3}
                  onChangeText={(txt) => setInput3(noktaKoy(txt))}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Ada / Parsel / Notlar"
                  placeholderTextColor="#666"
                  value={input4}
                  onChangeText={setInput4}
                />
              </>
            )}

            {modalType === 'talep' && (
              <>
                <View style={styles.row}>
                  <TouchableOpacity
                    style={[
                      styles.typeSelectBtn,
                      talepKategori === 'Satılık' && { backgroundColor: '#800020', borderColor: '#ff4d4d' },
                    ]}
                    onPress={() => setTalepKategori('Satılık')}
                  >
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>SATILIK</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.typeSelectBtn,
                      talepKategori === 'Kiralık' && { backgroundColor: '#1b4d2b', borderColor: '#2ecc71' },
                    ]}
                    onPress={() => setTalepKategori('Kiralık')}
                  >
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>KİRALIK</Text>
                  </TouchableOpacity>
                </View>

                <TextInput
                  style={styles.input}
                  placeholder="Müşteri Adı (Örn: Ali Bey)"
                  placeholderTextColor="#666"
                  value={input1}
                  onChangeText={setInput1}
                />
                <TextInput
                  style={styles.input}
                  placeholder="İstenen Bölge (Örn: Pelitköy)"
                  placeholderTextColor="#666"
                  value={input2}
                  onChangeText={setInput2}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Müşteri Bütçesi (Örn: 8.000.000)"
                  placeholderTextColor="#666"
                  keyboardType="numeric"
                  value={input3}
                  onChangeText={(txt) => setInput3(noktaKoy(txt))}
                />
              </>
            )}

            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={formuSifirla}>
                <Text style={styles.modalCancelText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSaveBtn} onPress={kaydetVeyaGuncelle}>
                <Text style={styles.modalSaveText}>Kaydet</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('ozet')}>
          <Text style={[styles.navText, activeTab === 'ozet' && styles.activeNavText]}>🏠 Özet</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('finans')}>
          <Text style={[styles.navText, activeTab === 'finans' && styles.activeNavText]}>💳 Finans</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('portfoy')}>
          <Text style={[styles.navText, activeTab === 'portfoy' && styles.activeNavText]}>🏢 Portföy &amp; Talep</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  splashContainer: { flex: 1, backgroundColor: '#0A0A0A', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30 },
  splashSub: { color: '#666', fontSize: 11, letterSpacing: 3, fontWeight: '600', marginBottom: 8 },
  splashLogo: { fontSize: 52, fontWeight: '900', color: '#A8002A', letterSpacing: 8, textShadowColor: '#FF1A53', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 22, marginBottom: 28 },
  progressTrack: { width: 240, height: 8, backgroundColor: '#1C1C1C', borderRadius: 6, overflow: 'hidden', borderWidth: 1, borderColor: '#3D0010' },
  progressFill: { height: '100%', backgroundColor: '#A8002A' },
  loadingInfoText: { color: '#777', fontSize: 11, marginTop: 14 },

  container: { flex: 1, backgroundColor: '#121212' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#222' },
  headerLeftGroup: { flexDirection: 'column', alignItems: 'flex-start' },
  subHeaderText: { fontSize: 10, color: '#999', marginBottom: 4, letterSpacing: 0.5 },
  patronBox: { backgroundColor: '#1A050A', borderWidth: 1.5, borderColor: '#9E0B32', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 4, shadowColor: '#FF1A53', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.45, shadowRadius: 8, elevation: 4 },
  patronBoxText: { fontSize: 18, fontWeight: '900', color: '#FFFFFF', letterSpacing: 3 },
  notificationBadge: { backgroundColor: '#800020', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  notificationText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  content: { flex: 1, padding: 16 },

  alertCard: { backgroundColor: '#1e1111', borderWidth: 1, borderColor: '#800020', borderRadius: 12, padding: 12, marginBottom: 12 },
  alertTitle: { color: '#ff5555', fontSize: 12, fontWeight: 'bold', marginBottom: 4 },
  alertDesc: { color: '#ddd', fontSize: 13 },
  emptyCardNotice: { backgroundColor: '#161616', borderWidth: 1, borderColor: '#262626', borderRadius: 12, padding: 14, marginBottom: 12, alignItems: 'center' },
  emptyNoticeText: { color: '#777', fontSize: 12, textAlign: 'center' },
  emptyText: { color: '#555', fontSize: 12, fontStyle: 'italic', marginVertical: 8, textAlign: 'center' },
  warningCard: { backgroundColor: '#1e1a11', borderWidth: 1, borderColor: '#b8860b', borderRadius: 12, padding: 12, marginBottom: 16 },
  warningTitle: { color: '#ffd700', fontSize: 12, fontWeight: 'bold', marginBottom: 4 },
  warningDesc: { color: '#ddd', fontSize: 13 },

  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  infoBox: { flex: 1, backgroundColor: '#1a1a1a', borderRadius: 12, padding: 14, marginHorizontal: 4 },
  infoBoxFull: { backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#1e3a5f', borderRadius: 12, padding: 16, marginBottom: 16 },
  boxLabel: { color: '#aaa', fontSize: 12, marginBottom: 4 },
  boxValueGreen: { color: '#00ff7f', fontSize: 18, fontWeight: 'bold', marginBottom: 2 },
  boxValueYellow: { color: '#ffd700', fontSize: 18, fontWeight: 'bold', marginBottom: 2 },
  boxValueWhite: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  boxSub: { color: '#777', fontSize: 10 },

  quickActionHalfBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginHorizontal: 4, borderWidth: 1 },
  sectionTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 12, marginTop: 4 },
  primaryButton: { backgroundColor: '#800020', borderRadius: 12, padding: 14, alignItems: 'center', marginBottom: 10 },
  primaryButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  secondaryButton: { backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#333', borderRadius: 12, padding: 14, alignItems: 'center', marginBottom: 10 },
  secondaryButtonText: { color: '#4da6ff', fontWeight: 'bold', fontSize: 13 },
  statusBox: { backgroundColor: '#0d1f12', borderWidth: 1, borderColor: '#1b4d2b', borderRadius: 12, padding: 12, alignItems: 'center', marginTop: 8, marginBottom: 20 },
  statusText: { color: '#2ecc71', fontSize: 12, fontWeight: 'bold' },

  miniButton: { backgroundColor: '#800020', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  miniButtonRed: { backgroundColor: '#800020', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  miniButtonText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },

  subTabContainer: { flexDirection: 'row', marginBottom: 14 },
  subTabButton: { paddingHorizontal: 14, paddingVertical: 8, backgroundColor: '#1a1a1a', borderRadius: 8, marginRight: 8, borderWidth: 1, borderColor: '#333' },
  subTabActive: { backgroundColor: '#1e3a5f', borderColor: '#4da6ff' },
  subTabText: { color: '#888', fontSize: 11, fontWeight: 'bold' },
  subTextActive: { color: '#fff' },

  portfoyTabBtn: { flex: 1, backgroundColor: '#1a1a1a', padding: 10, borderRadius: 8, alignItems: 'center', marginHorizontal: 4, borderWidth: 1, borderColor: '#333' },
  portfoyTabActive: { backgroundColor: '#800020', borderColor: '#ff4d4d' },
  portfoyTabText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },

  chartCard: { backgroundColor: '#1a1a1a', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#262626' },
  chartTitle: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  legendRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, marginTop: 4 },
  legendBlue: { fontSize: 10, fontWeight: 'bold' },
  legendGold: { color: '#ffd700', fontSize: 10, fontWeight: 'bold' },
  profitBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  profitBadgeText: { fontSize: 11, fontWeight: 'bold' },
  
  // Blur / Gradyan Dolgulu Grafik Stilleri
  graphVisualContainer: { height: 110, position: 'relative', justifyContent: 'center', marginVertical: 5, borderRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: '#222' },
  blurGradientOverlay: { position: 'absolute', left: 0, right: 0, borderTopLeftRadius: 15, borderTopRightRadius: 15 },
  graphBaseLine: { position: 'absolute', bottom: '45%', left: 0, right: 0, height: 1, backgroundColor: '#2a2a2a' },
  graphLineDynamic: { position: 'absolute', left: '10%', right: '10%', height: 3, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 6, elevation: 5 },
  graphLineGold: { position: 'absolute', left: '10%', right: '10%', height: 2, borderWidth: 1, borderColor: '#ffd700', borderStyle: 'dashed' },
  graphDotDynamic: { position: 'absolute', paddingHorizontal: 6, height: 18, borderRadius: 5, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5 },
  graphDotGold: { position: 'absolute', paddingHorizontal: 5, height: 16, backgroundColor: '#332b00', borderRadius: 4, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#ffd700' },
  dotTextDynamic: { fontSize: 9, fontWeight: 'bold' },
  dotTextGold: { color: '#ffd700', fontSize: 9, fontWeight: 'bold' },
  graphMonthsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10, marginTop: 8 },
  monthText: { color: '#777', fontSize: 10 },

  bankCard: { backgroundColor: '#1a1a1a', borderRadius: 12, padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  bankTitle: { color: '#fff', fontSize: 14, fontWeight: 'bold', marginBottom: 2 },
  actionRowBtn: { flexDirection: 'row', alignItems: 'center' },
  editBtnSmall: { paddingHorizontal: 8, paddingVertical: 5, borderWidth: 1, borderColor: '#ffa500', borderRadius: 6, backgroundColor: '#2a1a0f', marginRight: 6 },
  deleteBtnSmall: { paddingHorizontal: 8, paddingVertical: 5, borderWidth: 1, borderColor: '#ff4d4d', borderRadius: 6, backgroundColor: '#2a1111' },
  btnTextOrange: { color: '#ffa500', fontSize: 10, fontWeight: 'bold' },
  btnTextRed: { color: '#ff4d4d', fontSize: 10, fontWeight: 'bold' },

  propertyCard: { backgroundColor: '#1a1a1a', borderRadius: 12, padding: 16, marginBottom: 12 },
  badgeBlue: { backgroundColor: '#1e3a5f', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginBottom: 8 },
  badgeRed: { backgroundColor: '#800020', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginBottom: 8 },
  badgeGreen: { backgroundColor: '#1b4d2b', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginBottom: 8 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  propertyTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  propertySub: { color: '#aaa', fontSize: 12, marginBottom: 4 },
  propertyPrice: { color: '#00ff7f', fontSize: 18, fontWeight: 'bold', marginTop: 4 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContainer: { width: '100%', backgroundColor: '#1a1a1a', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#333' },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  typeSelectBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#333', backgroundColor: '#121212', alignItems: 'center', marginHorizontal: 4 },
  bankSelectChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#333', backgroundColor: '#121212', marginRight: 8 },
  input: { backgroundColor: '#121212', borderWidth: 1, borderColor: '#333', borderRadius: 8, padding: 12, color: '#fff', marginBottom: 10 },
  modalBtnRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  modalCancelBtn: { flex: 1, padding: 12, backgroundColor: '#333', borderRadius: 8, alignItems: 'center', marginRight: 6 },
  modalCancelText: { color: '#fff', fontWeight: 'bold' },
  modalSaveBtn: { flex: 1, padding: 12, backgroundColor: '#800020', borderRadius: 8, alignItems: 'center', marginLeft: 6 },
  modalSaveText: { color: '#fff', fontWeight: 'bold' },

  navBar: { flexDirection: 'row', backgroundColor: '#181818', borderTopWidth: 1, borderTopColor: '#252525', paddingVertical: 10 },
  navItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  navText: { color: '#777', fontSize: 12, fontWeight: '600' },
  activeNavText: { color: '#ffa500' },
});
