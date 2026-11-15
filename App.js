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
  const [finansSubTab, setFinansSubTab] = useState('genel'); // 'genel', 'bankalar', 'krediler', 'alacaklilar'
  const [portfoySubTab, setPortfoySubTab] = useState('mulkler'); // 'mulkler', 'talepler'

  // Modal State'leri
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState(''); // 'kredi', 'banka', 'alacakli', 'mulk', 'talep'
  const [duzenleId, setDuzenleId] = useState(null); // Düzenleme Modu için ID
  
  // Form State'leri
  const [input1, setInput1] = useState('');
  const [input2, setInput2] = useState('');
  const [input3, setInput3] = useState('');

  // Tamamen Boş Başlangıç Verileri
  const [kredilerListesi, setKredilerListesi] = useState([]);
  const [bankalarListesi, setBankalarListesi] = useState([]);
  const [alacaklilarListesi, setAlacaklilarListesi] = useState([]);
  const [mulklerListesi, setMulklerListesi] = useState([]);
  const [taleplerListesi, setTaleplerListesi] = useState([]);

  const progressAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

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
      const k = await AsyncStorage.getItem('@patron_krediler');
      const b = await AsyncStorage.getItem('@patron_bankalar');
      const a = await AsyncStorage.getItem('@patron_alacaklilar');
      const m = await AsyncStorage.getItem('@patron_mulkler');
      const t = await AsyncStorage.getItem('@patron_talepler');
      
      if (k !== null) setKredilerListesi(JSON.parse(k));
      if (b !== null) setBankalarListesi(JSON.parse(b));
      if (a !== null) setAlacaklilarListesi(JSON.parse(a));
      if (m !== null) setMulklerListesi(JSON.parse(m));
      if (t !== null) setTaleplerListesi(JSON.parse(t));
    } catch (e) { console.log(e); }
  };

  const veriKaydet = async (key, data) => {
    try { await AsyncStorage.setItem(key, JSON.stringify(data)); } catch (e) { console.log(e); }
  };

  const kalanGunHesapla = (tarihStr) => {
    if (!tarihStr) return 'Tarih girilmedi';
    const hedef = new Date(tarihStr);
    const bugun = new Date();
    const farkMs = hedef - bugun;
    const farkGun = Math.ceil(farkMs / (1000 * 60 * 60 * 24));
    if (farkGun < 0) return 'Vadesi geçti';
    if (farkGun === 0) return 'Bugün son gün!';
    return `${farkGun} gün kaldı`;
  };

  // Ekleme veya Güncelleme İşlemi
  const kaydetVeyaGuncelle = () => {
    if (!input1) {
      Alert.alert('Eksik Bilgi', 'Lütfen ana alanı doldurunuz.');
      return;
    }

    if (duzenleId) {
      // DÜZENLEME MODU
      if (modalType === 'kredi') {
        const yeni = kredilerListesi.map(x => x.id === duzenleId ? { ...x, baslik: input1, tutar: input2, tarih: input3 } : x);
        setKredilerListesi(yeni); veriKaydet('@patron_krediler', yeni);
      } else if (modalType === 'banka') {
        const yeni = bankalarListesi.map(x => x.id === duzenleId ? { ...x, isim: input1 } : x);
        setBankalarListesi(yeni); veriKaydet('@patron_bankalar', yeni);
      } else if (modalType === 'alacakli') {
        const yeni = alacaklilarListesi.map(x => x.id === duzenleId ? { ...x, isim: input1, tutar: input2 } : x);
        setAlacaklilarListesi(yeni); veriKaydet('@patron_alacaklilar', yeni);
      } else if (modalType === 'mulk') {
        const yeni = mulklerListesi.map(x => x.id === duzenleId ? { ...x, baslik: input1, tip: input2, fiyat: '₺' + input3 } : x);
        setMulklerListesi(yeni); veriKaydet('@patron_mulkler', yeni);
      } else if (modalType === 'talep') {
        const yeni = taleplerListesi.map(x => x.id === duzenleId ? { ...x, musteri: input1, bolge: input2 } : x);
        setTaleplerListesi(yeni); veriKaydet('@patron_talepler', yeni);
      }
    } else {
      // YENİ EKLEME MODU
      const id = Date.now().toString();
      if (modalType === 'kredi') {
        const yeni = [...kredilerListesi, { id, baslik: input1, tutar: input2 || '₺0', tarih: input3 || '2026-12-31' }];
        setKredilerListesi(yeni); veriKaydet('@patron_krediler', yeni);
      } else if (modalType === 'banka') {
        const yeni = [...bankalarListesi, { id, isim: input1 }];
        setBankalarListesi(yeni); veriKaydet('@patron_bankalar', yeni);
      } else if (modalType === 'alacakli') {
        const yeni = [...alacaklilarListesi, { id, isim: input1, tutar: input2 || '₺0' }];
        setAlacaklilarListesi(yeni); veriKaydet('@patron_alacaklilar', yeni);
      } else if (modalType === 'mulk') {
        const yeni = [...mulklerListesi, { id, baslik: input1, tip: input2 || 'Konut', detay: 'Özel mülk', fiyat: '₺' + (input3 || '0') }];
        setMulklerListesi(yeni); veriKaydet('@patron_mulkler', yeni);
      } else if (modalType === 'talep') {
        const yeni = [...taleplerListesi, { id, musteri: input1, bolge: input2 || 'Genel', tip: 'Konut', detay: `${input2 || 'Merkez'} - Talep` }];
        setTaleplerListesi(yeni); veriKaydet('@patron_talepler', yeni);
      }
    }

    formuSifirla();
  };

  const formuSifirla = () => {
    setInput1(''); setInput2(''); setInput3('');
    setDuzenleId(null);
    setModalVisible(false);
  };

  const duzenleAc = (type, item) => {
    setModalType(type);
    setDuzenleId(item.id);
    if (type === 'kredi') {
      setInput1(item.baslik); setInput2(item.tutar); setInput3(item.tarih);
    } else if (type === 'banka') {
      setInput1(item.isim);
    } else if (type === 'alacakli') {
      setInput1(item.isim); setInput2(item.tutar);
    } else if (type === 'mulk') {
      setInput1(item.baslik); setInput2(item.tip); setInput3(item.fiyat.replace('₺', ''));
    } else if (type === 'talep') {
      setInput1(item.musteri); setInput2(item.bolge);
    }
    setModalVisible(true);
  };

  const sil = (type, id) => {
    if (type === 'kredi') {
      const yeni = kredilerListesi.filter(x => x.id !== id);
      setKredilerListesi(yeni); veriKaydet('@patron_krediler', yeni);
    } else if (type === 'banka') {
      const yeni = bankalarListesi.filter(x => x.id !== id);
      setBankalarListesi(yeni); veriKaydet('@patron_bankalar', yeni);
    } else if (type === 'alacakli') {
      const yeni = alacaklilarListesi.filter(x => x.id !== id);
      setAlacaklilarListesi(yeni); veriKaydet('@patron_alacaklilar', yeni);
    } else if (type === 'mulk') {
      const yeni = mulklerListesi.filter(x => x.id !== id);
      setMulklerListesi(yeni); veriKaydet('@patron_mulkler', yeni);
    } else if (type === 'talep') {
      const yeni = taleplerListesi.filter(x => x.id !== id);
      setTaleplerListesi(yeni); veriKaydet('@patron_talepler', yeni);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.splashContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />
        <Animated.View style={{ opacity: fadeAnim, alignItems: 'center' }}>
          <Text style={styles.splashSub}>TOCO TİCARET OFİSİ</Text>
          <Text style={styles.splashLogo}>PATRON</Text>
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressFill, { width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }]} />
          </View>
          <Text style={styles.loadingInfoText}>Sistem verileri yükleniyor...</Text>
        </Animated.View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />

      {/* Üst Başlık */}
      <View style={styles.header}>
        <View style={styles.headerLeftGroup}>
          <Text style={styles.subHeaderText}>TOCO Ticaret Ofisi</Text>
          <View style={styles.patronBox}><Text style={styles.patronBoxText}>PATRON</Text></View>
        </View>
        <TouchableOpacity style={styles.notificationBadge}>
          <Text style={styles.notificationText}>🔔 {taleplerListesi.length > 0 && mulklerListesi.length > 0 ? '1' : '0'} Eşleşme</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* ÖZET SEKMESİ */}
        {activeTab === 'ozet' && (
          <View>
            {taleplerListesi.length > 0 && mulklerListesi.length > 0 ? (
              <View style={styles.alertCard}>
                <Text style={styles.alertTitle}>🎯 YENİ PORTFÖY &amp; TALEP EŞLEŞMESİ</Text>
                <Text style={styles.alertDesc}>• {taleplerListesi[0].musteri} ({taleplerListesi[0].bolge}) talebi ile portföyünüz eşleşti!</Text>
              </View>
            ) : (
              <View style={styles.emptyCardNotice}>
                <Text style={styles.emptyNoticeText}>Aktif eşleşme yok. Mülk ve talep ekledikçe eşleşmeler burada görünür.</Text>
              </View>
            )}

            {kredilerListesi.length > 0 ? (
              <View style={styles.warningCard}>
                <Text style={styles.warningTitle}>🔔 YAKLAŞAN KREDİ ÖDEMESİ</Text>
                <Text style={styles.warningDesc}>• {kredilerListesi[0].baslik}: {kredilerListesi[0].tutar} ({kalanGunHesapla(kredilerListesi[0].tarih)})</Text>
              </View>
            ) : null}

            <View style={styles.row}>
              <View style={styles.infoBox}>
                <Text style={styles.boxLabel}>Mevcut Nakit</Text>
                <Text style={styles.boxValueGreen}>₺0</Text>
                <Text style={styles.boxSub}>Ek Hesap: ₺0</Text>
              </View>
              <View style={styles.infoBox}>
                <Text style={styles.boxLabel}>Toplam Alacak</Text>
                <Text style={styles.boxValueYellow}>₺0</Text>
                <Text style={styles.boxSub}>{alacaklilarListesi.length} alacak kaydı</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Hızlı İşlemler</Text>
            <TouchableOpacity style={styles.primaryButton} onPress={() => setActiveTab('finans')}>
              <Text style={styles.primaryButtonText}>💳 Finans, Alacaklılar &amp; Kredi Yönetimi</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={() => setActiveTab('portfoy')}>
              <Text style={styles.secondaryButtonText}>🏢 Gayrimenkul Portföy &amp; Talep Listesi</Text>
            </TouchableOpacity>
            <View style={styles.statusBox}><Text style={styles.statusText}>● Yerel Veri &amp; Canlı Eşleşme Motoru Aktif</Text></View>
          </View>
        )}

        {/* FİNANS SEKMESİ */}
        {activeTab === 'finans' && (
          <View>
            <View style={styles.rowBetween}>
              <Text style={styles.sectionTitle}>Finans &amp; Alacaklılar</Text>
              <TouchableOpacity style={styles.miniButton} onPress={() => {
                setDuzenleId(null);
                if (finansSubTab === 'krediler') { setModalType('kredi'); }
                else if (finansSubTab === 'bankalar') { setModalType('banka'); }
                else if (finansSubTab === 'alacaklilar') { setModalType('alacakli'); }
                else { setModalType('kredi'); }
                setModalVisible(true);
              }}>
                <Text style={styles.miniButtonText}>
                  {finansSubTab === 'bankalar' ? '+ Banka Ekle' : finansSubTab === 'alacaklilar' ? '+ Alacaklı Ekle' : '+ Kredi Ekle'}
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.subTabContainer}>
              {['genel', 'bankalar', 'krediler', 'alacaklilar'].map((tab) => (
                <TouchableOpacity
                  key={tab}
                  style={[styles.subTabButton, finansSubTab === tab && styles.subTabActive]}
                  onPress={() => setFinansSubTab(tab)}
                >
                  <Text style={[styles.subTabText, finansSubTab === tab && styles.subTextActive]}>{tab.toUpperCase()}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* GRAFİK */}
            <View style={styles.chartCard}>
              <View style={styles.rowBetween}>
                <Text style={styles.chartTitle}>Aylık Kâr / Zarar Trendi</Text>
                <View style={styles.profitBadge}><Text style={styles.profitBadgeText}>₺0</Text></View>
              </View>
              <Text style={styles.chartSub}>Son 6 Aylık Net Performans</Text>
              
              <View style={styles.graphVisualContainer}>
                <View style={styles.graphLineReal} />
                <View style={[styles.graphDot, { left: '8%', top: 40 }]}><Text style={styles.dotText}>0k</Text></View>
                <View style={[styles.graphDot, { left: '26%', top: 40 }]}><Text style={styles.dotText}>0k</Text></View>
                <View style={[styles.graphDot, { left: '44%', top: 40 }]}><Text style={styles.dotText}>0k</Text></View>
                <View style={[styles.graphDot, { left: '62%', top: 40 }]}><Text style={styles.dotText}>0k</Text></View>
                <View style={[styles.graphDot, { left: '80%', top: 40 }]}><Text style={styles.dotText}>0k</Text></View>
              </View>
              <View style={styles.graphMonthsRow}>
                <Text style={styles.monthText}>Haz</Text><Text style={styles.monthText}>Tem</Text>
                <Text style={styles.monthText}>Ağu</Text><Text style={styles.monthText}>Eyl</Text>
                <Text style={styles.monthText}>Eki</Text><Text style={styles.monthText}>Kas</Text>
              </View>
            </View>

            <View style={styles.infoBoxFull}>
              <Text style={styles.boxLabel}>Toplam Kullanılabilir Nakit Gücü</Text>
              <Text style={styles.boxValueWhite}>₺0</Text>
            </View>

            {/* KREDİLER */}
            {(finansSubTab === 'genel' || finansSubTab === 'krediler') && (
              <View>
                <Text style={styles.sectionTitle}>Aktif Krediler &amp; Ödemeler</Text>
                {kredilerListesi.length === 0 ? (
                  <Text style={styles.emptyText}>Henüz kayıtlı kredi yok.</Text>
                ) : (
                  kredilerListesi.map((k) => (
                    <View key={k.id} style={styles.bankCard}>
                      <View style={{flex: 1}}>
                        <Text style={styles.bankTitle}>{k.baslik}</Text>
                        <Text style={styles.propertySub}>Tutar: {k.tutar} | Vade: {k.tarih} ({kalanGunHesapla(k.tarih)})</Text>
                      </View>
                      <View style={styles.actionRowBtn}>
                        <TouchableOpacity style={styles.editBtnSmall} onPress={() => duzenleAc('kredi', k)}><Text style={styles.btnTextOrange}>Düzenle</Text></TouchableOpacity>
                        <TouchableOpacity style={styles.deleteBtnSmall} onPress={() => sil('kredi', k.id)}><Text style={styles.btnTextRed}>Sil</Text></TouchableOpacity>
                      </View>
                    </View>
                  ))
                )}
              </View>
            )}

            {/* BANKALAR */}
            {(finansSubTab === 'genel' || finansSubTab === 'bankalar') && (
              <View style={{marginTop: 15}}>
                <Text style={styles.sectionTitle}>Banka Hesapları &amp; KMH</Text>
                {bankalarListesi.length === 0 ? (
                  <Text style={styles.emptyText}>Henüz kayıtlı banka hesabı yok.</Text>
                ) : (
                  bankalarListesi.map((b) => (
                    <View key={b.id} style={styles.bankCard}>
                      <Text style={styles.bankTitle}>{b.isim}</Text>
                      <View style={styles.actionRowBtn}>
                        <TouchableOpacity style={styles.editBtnSmall} onPress={() => duzenleAc('banka', b)}><Text style={styles.btnTextOrange}>Düzenle</Text></TouchableOpacity>
                        <TouchableOpacity style={styles.deleteBtnSmall} onPress={() => sil('banka', b.id)}><Text style={styles.btnTextRed}>Sil</Text></TouchableOpacity>
                      </View>
                    </View>
                  ))
                )}
              </View>
            )}

            {/* ALACAKLILAR */}
            {(finansSubTab === 'genel' || finansSubTab === 'alacaklilar') && (
              <View style={{marginTop: 15}}>
                <Text style={styles.sectionTitle}>Alacaklılar Listesi</Text>
                {alacaklilarListesi.length === 0 ? (
                  <Text style={styles.emptyText}>Henüz kayıtlı alacak yok.</Text>
                ) : (
                  alacaklilarListesi.map((a) => (
                    <View key={a.id} style={styles.bankCard}>
                      <View style={{flex: 1}}>
                        <Text style={styles.bankTitle}>{a.isim}</Text>
                        <Text style={styles.propertySub}>Alacak Tutarı: {a.tutar}</Text>
                      </View>
                      <View style={styles.actionRowBtn}>
                        <TouchableOpacity style={styles.editBtnSmall} onPress={() => duzenleAc('alacakli', a)}><Text style={styles.btnTextOrange}>Düzenle</Text></TouchableOpacity>
                        <TouchableOpacity style={styles.deleteBtnSmall} onPress={() => sil('alacakli', a.id)}><Text style={styles.btnTextRed}>Sil</Text></TouchableOpacity>
                      </View>
                    </View>
                  ))
                )}
              </View>
            )}
          </View>
        )}

        {/* PORTFÖY & TALEP SEKMESİ */}
        {activeTab === 'portfoy' && (
          <View>
            <View style={styles.rowBetween}>
              <Text style={styles.sectionTitle}>Portföy &amp; Talep Yönetimi</Text>
              <TouchableOpacity style={styles.miniButtonRed} onPress={() => {
                setDuzenleId(null);
                setModalType(portfoySubTab === 'mulkler' ? 'mulk' : 'talep');
                setModalVisible(true);
              }}>
                <Text style={styles.miniButtonText}>{portfoySubTab === 'mulkler' ? '+ Mülk Ekle' : '+ Talep Ekle'}</Text>
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
                        <View style={styles.badgeBlue}><Text style={styles.badgeText}>{m.tip}</Text></View>
                        <View style={styles.actionRowBtn}>
                          <TouchableOpacity style={styles.editBtnSmall} onPress={() => duzenleAc('mulk', m)}><Text style={styles.btnTextOrange}>Düzenle</Text></TouchableOpacity>
                          <TouchableOpacity style={styles.deleteBtnSmall} onPress={() => sil('mulk', m.id)}><Text style={styles.btnTextRed}>Sil</Text></TouchableOpacity>
                        </View>
                      </View>
                      <Text style={styles.propertyTitle}>{m.baslik}</Text>
                      <Text style={styles.propertySub}>{m.detay}</Text>
                      <Text style={styles.propertyPrice}>{m.fiyat}</Text>
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
                        <View style={styles.badgeRed}><Text style={styles.badgeText}>Talep</Text></View>
                        <View style={styles.actionRowBtn}>
                          <TouchableOpacity style={styles.editBtnSmall} onPress={() => duzenleAc('talep', t)}><Text style={styles.btnTextOrange}>Düzenle</Text></TouchableOpacity>
                          <TouchableOpacity style={styles.deleteBtnSmall} onPress={() => sil('talep', t.id)}><Text style={styles.btnTextRed}>Sil</Text></TouchableOpacity>
                        </View>
                      </View>
                      <Text style={styles.propertyTitle}>{t.musteri}</Text>
                      <Text style={styles.propertySub}>Bölge: {t.bolge} | Tür: {t.tip}</Text>
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

      {/* VERİ EKLEME / DÜZENLEME MODALI */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              {duzenleId ? 'Kaydı Düzenle' : 'Yeni Kayıt Ekle'}
            </Text>

            {modalType === 'kredi' && (
              <>
                <TextInput style={styles.input} placeholder="Kredi Adı (Örn: Ofis Kredisi)" placeholderTextColor="#666" value={input1} onChangeText={setInput1} />
                <TextInput style={styles.input} placeholder="Tutar (Örn: ₺12.000)" placeholderTextColor="#666" value={input2} onChangeText={setInput2} />
                <TextInput style={styles.input} placeholder="Son Ödeme Tarihi (Yıl-Ay-Gün Örn: 2026-12-30)" placeholderTextColor="#666" value={input3} onChangeText={setInput3} />
              </>
            )}

            {modalType === 'banka' && (
              <TextInput style={styles.input} placeholder="Banka Adı ve Türü (Örn: Garanti Vadesiz)" placeholderTextColor="#666" value={input1} onChangeText={setInput1} />
            )}

            {modalType === 'alacakli' && (
              <>
                <TextInput style={styles.input} placeholder="Kişi / Kurum Adı (Örn: Mehmet Bey)" placeholderTextColor="#666" value={input1} onChangeText={setInput1} />
                <TextInput style={styles.input} placeholder="Tutar (Örn: ₺15.000)" placeholderTextColor="#666" value={input2} onChangeText={setInput2} />
              </>
            )}

            {modalType === 'mulk' && (
              <>
                <TextInput style={styles.input} placeholder="Mülk Başlığı (Örn: Ören Lüks Villa)" placeholderTextColor="#666" value={input1} onChangeText={setInput1} />
                <TextInput style={styles.input} placeholder="Mülk Tipi (Örn: Konut / Zeytinlik)" placeholderTextColor="#666" value={input2} onChangeText={setInput2} />
                <TextInput style={styles.input} placeholder="Fiyat (Örn: 3.500.000)" placeholderTextColor="#666" value={input3} onChangeText={setInput3} />
              </>
            )}

            {modalType === 'talep' && (
              <>
                <TextInput style={styles.input} placeholder="Müşteri Adı (Örn: Ali Bey)" placeholderTextColor="#666" value={input1} onChangeText={setInput1} />
                <TextInput style={styles.input} placeholder="İstenen Bölge (Örn: Pelitköy)" placeholderTextColor="#666" value={input2} onChangeText={setInput2} />
              </>
            )}

            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={formuSifirla}><Text style={styles.modalCancelText}>İptal</Text></TouchableOpacity>
              <TouchableOpacity style={styles.modalSaveBtn} onPress={kaydetVeyaGuncelle}><Text style={styles.modalSaveText}>Kaydet</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Alt Navigasyon Çubuğu */}
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
  boxValueGreen: { color: '#00ff7f', fontSize: 20, fontWeight: 'bold', marginBottom: 2 },
  boxValueYellow: { color: '#ffd700', fontSize: 20, fontWeight: 'bold', marginBottom: 2 },
  boxValueWhite: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  boxSub: { color: '#777', fontSize: 10 },

  sectionTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 12, marginTop: 4 },
  primaryButton: { backgroundColor: '#800020', borderRadius: 12, padding: 14, alignItems: 'center', marginBottom: 10 },
  primaryButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  secondaryButton: { backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#333', borderRadius: 12, padding: 14, alignItems: 'center', marginBottom: 10 },
  secondaryButtonText: { color: '#4da6ff', fontWeight: 'bold', fontSize: 13 },
  statusBox: { backgroundColor: '#0d1f12', borderWidth: 1, borderColor: '#1b4d2b', borderRadius: 12, padding: 12, alignItems: 'center', marginTop: 8, marginBottom: 20 },
  statusText: { color: '#2ecc71', fontSize: 12, fontWeight: 'bold' },

  miniButton: { backgroundColor: '#800020', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  miniButtonRed: { backgroundColor: '#800020', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  miniButtonText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },

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
  chartSub: { color: '#888', fontSize: 11, marginBottom: 15 },
  profitBadge: { backgroundColor: '#1b4d2b', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  profitBadgeText: { color: '#00ff7f', fontSize: 11, fontWeight: 'bold' },
  graphVisualContainer: { height: 70, position: 'relative', justifyContent: 'center', marginVertical: 5 },
  graphLineReal: { position: 'absolute', top: '50%', left: '10%', right: '15%', height: 2, backgroundColor: '#333' },
  graphDot: { position: 'absolute', width: 22, height: 16, backgroundColor: '#1e3a5f', borderRadius: 4, justifyContent: 'center', alignItems: 'center' },
  dotText: { color: '#4da6ff', fontSize: 9, fontWeight: 'bold' },
  graphMonthsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 6, marginTop: 4 },
  monthText: { color: '#666', fontSize: 10 },

  bankCard: { backgroundColor: '#1a1a1a', borderRadius: 12, padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  bankTitle: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  actionRowBtn: { flexDirection: 'row', alignItems: 'center' },
  editBtnSmall: { paddingHorizontal: 8, paddingVertical: 5, borderWidth: 1, borderColor: '#ffa500', borderRadius: 6, backgroundColor: '#2a1a0f', marginRight: 6 },
  deleteBtnSmall: { paddingHorizontal: 8, paddingVertical: 5, borderWidth: 1, borderColor: '#ff4d4d', borderRadius: 6, backgroundColor: '#2a1111' },
  btnTextOrange: { color: '#ffa500', fontSize: 10, fontWeight: 'bold' },
  btnTextRed: { color: '#ff4d4d', fontSize: 10, fontWeight: 'bold' },

  propertyCard: { backgroundColor: '#1a1a1a', borderRadius: 12, padding: 16, marginBottom: 12 },
  badgeBlue: { backgroundColor: '#1e3a5f', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginBottom: 8 },
  badgeRed: { backgroundColor: '#800020', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginBottom: 8 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  propertyTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  propertySub: { color: '#aaa', fontSize: 12, marginBottom: 8 },
  propertyPrice: { color: '#00ff7f', fontSize: 18, fontWeight: 'bold' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContainer: { width: '100%', backgroundColor: '#1a1a1a', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#333' },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  input: { backgroundColor: '#121212', borderWidth: 1, borderColor: '#333', borderRadius: 8, padding: 12, color: '#fff', marginBottom: 12 },
  modalBtnRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  modalCancelBtn: { flex: 1, padding: 12, backgroundColor: '#333', borderRadius: 8, alignItems: 'center', marginRight: 6 },
  modalCancelText: { color: '#fff', fontWeight: 'bold' },
  modalSaveBtn: { flex: 1, padding: 12, backgroundColor: '#800020', borderRadius: 8, alignItems: 'center', marginLeft: 6 },
  modalSaveText: { color: '#fff', fontWeight: 'bold' },

  navBar: { flexDirection: 'row', backgroundColor: '#181818', borderTopWidth: 1, borderTopColor: '#252525', paddingVertical: 10 },
  navItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  navText: { color: '#777', fontSize: 12, fontWeight: '600' },
  activeNavText: { color: '#ffa500' }
});
