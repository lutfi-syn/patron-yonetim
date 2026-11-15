import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Modal,
  TextInput,
  Alert,
} from 'react-native';

export default function App() {
  const [activeTab, setActiveTab] = useState('ozet');
  const [finansSubTab, setFinansSubTab] = useState('Genel');
  const [portfoySubTab, setPortfoySubTab] = useState('Portfoy');
  const [kategoriFiltre, setKategoriFiltre] = useState('Tümü');

  // --- VERİ STATE'LERİ ---
  const [bankalar, setBankalar] = useState([
    { id: '1', ad: 'Ziraat Bankası (Vadesiz)', bakiye: 173750, kmhLimit: 75000, kullanilanKmh: 0 },
  ]);

  const [krediler, setKrediler] = useState([
    { id: '1', ad: 'Ofis Yatırım Kredisi', tutar: 14200, kalanGun: 4 },
  ]);

  const [alacaklilar, setAlacaklilar] = useState([
    { id: '1', kisi: 'Mehmet Yılmaz (Komisyon)', tutar: 35000, aciklama: 'Ören daire satışı' },
  ]);

  const [hareketler, setHareketler] = useState([
    { id: '1', baslik: 'Komisyon Tahsilatı', tutar: 48000, tip: 'gelir', tarih: 'Kasım' },
    { id: '2', baslik: 'Ofis Kira & Gider', tutar: -12500, tip: 'gider', tarih: 'Kasım' },
  ]);

  const [aylikTrend, setAylikTrend] = useState([
    { ay: 'Haz', deger: 22000 },
    { ay: 'Tem', deger: 28000 },
    { ay: 'Ağu', deger: -15000 },
    { ay: 'Eyl', deger: 34000 },
    { ay: 'Eki', deger: 31000 },
    { ay: 'Kas', deger: 48000 },
  ]);

  const [portfoyler, setPortfoyler] = useState([
    {
      id: '1',
      baslik: 'Ören Sahil Lüks Konut',
      tip: 'Konut',
      bolge: 'Ören',
      ada: '142',
      parsel: '5',
      aciklama: 'Deniz manzaralı geniş konut.',
      fiyat: 3250000,
    },
    {
      id: '2',
      baslik: 'Pelitköy Zeytinlik',
      tip: 'Zeytinlik',
      bolge: 'Pelitköy',
      ada: '88',
      parsel: '12',
      aciklama: 'İçinde verimli zeytin ağaçları var.',
      fiyat: 850000,
    },
  ]);

  const [talepler, setTalepler] = useState([
    {
      id: '1',
      alici: 'Ahmet Bey',
      tip: 'Konut',
      bolge: 'Ören',
      maxButce: 3500000,
      not: 'Sahile yakın, krediye uygun.',
    },
  ]);

  // --- MODAL & FORM STATE'LERİ ---
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTur, setModalTur] = useState(''); // 'portfoy', 'talep', 'banka', 'kredi', 'alacak', 'islem'
  const [duzenlenenId, setDuzenlenenId] = useState(null);

  // Ortak Form Alanları
  const [f1, setF1] = useState('');
  const [f2, setF2] = useState('');
  const [f3, setF3] = useState('');
  const [f4, setF4] = useState('');
  const [f5, setF5] = useState('');
  const [f6, setF6] = useState('');

  // --- HESAPLAMALAR ---
  const toplamNakit = useMemo(
    () => bankalar.reduce((acc, b) => acc + Number(b.bakiye || 0), 0),
    [bankalar]
  );

  const toplamKullanilabilirKmh = useMemo(
    () => bankalar.reduce((acc, b) => acc + (Number(b.kmhLimit || 0) - Number(b.kullanilanKmh || 0)), 0),
    [bankalar]
  );

  const toplamAlacak = useMemo(
    () => alacaklilar.reduce((acc, a) => acc + Number(a.tutar || 0), 0),
    [alacaklilar]
  );

  const toplamNakitGucu = toplamNakit + toplamKullanilabilirKmh;

  // --- CANLI EŞLEŞME ALGORİTMASI ---
  const eslesmeler = useMemo(() => {
    const liste = [];
    portfoyler.forEach((p) => {
      talepler.forEach((t) => {
        const tipUyumu = p.tip.toLowerCase() === t.tip.toLowerCase();
        const bolgeUyumu =
          p.bolge.toLowerCase().includes(t.bolge.toLowerCase()) ||
          t.bolge.toLowerCase().includes(p.bolge.toLowerCase());
        const butceUyumu = Number(p.fiyat) <= Number(t.maxButce);

        if (tipUyumu && bolgeUyumu && butceUyumu) {
          liste.push({
            portfoyId: p.id,
            talepId: t.id,
            mesaj: `${t.alici} (${t.bolge} - ${t.tip}) talebi ile "${p.baslik}" eşleşti!`,
          });
        }
      });
    });
    return liste;
  }, [portfoyler, talepler]);

  // --- MODAL AÇMA & KAYDETME ---
  const formAc = (tur, item = null) => {
    setModalTur(tur);
    setDuzenlenenId(item ? item.id : null);

    if (tur === 'portfoy') {
      setF1(item ? item.baslik : '');
      setF2(item ? item.tip : 'Konut');
      setF3(item ? item.bolge : '');
      setF4(item ? item.ada : '');
      setF5(item ? item.parsel : '');
      setF6(item ? String(item.fiyat) : '');
    } else if (tur === 'talep') {
      setF1(item ? item.alici : '');
      setF2(item ? item.tip : 'Konut');
      setF3(item ? item.bolge : '');
      setF4(item ? String(item.maxButce) : '');
      setF5(item ? item.not : '');
    } else if (tur === 'banka') {
      setF1(item ? item.ad : '');
      setF2(item ? String(item.bakiye) : '');
      setF3(item ? String(item.kmhLimit) : '0');
    } else if (tur === 'kredi') {
      setF1(item ? item.ad : '');
      setF2(item ? String(item.tutar) : '');
      setF3(item ? String(item.kalanGun) : '');
    } else if (tur === 'alacak') {
      setF1(item ? item.kisi : '');
      setF2(item ? String(item.tutar) : '');
      setF3(item ? item.aciklama : '');
    } else if (tur === 'islem') {
      setF1('');
      setF2('');
      setF3('gelir'); // gelir veya gider
    }

    setModalVisible(true);
  };

  const formuKaydet = () => {
    const id = duzenlenenId || String(Date.now());

    if (modalTur === 'portfoy') {
      if (!f1 || !f6) return Alert.alert('Eksik Bilgi', 'Başlık ve fiyat zorunludur.');
      const yeni = {
        id,
        baslik: f1,
        tip: f2 || 'Konut',
        bolge: f3 || 'Burhaniye',
        ada: f4 || '-',
        parsel: f5 || '-',
        aciklama: `${f3 || 'Burhaniye'} bölgesinde portföy.`,
        fiyat: Number(f6) || 0,
      };
      setPortfoyler((prev) =>
        duzenlenenId ? prev.map((x) => (x.id === id ? yeni : x)) : [yeni, ...prev]
      );
    } else if (modalTur === 'talep') {
      if (!f1 || !f4) return Alert.alert('Eksik Bilgi', 'Alıcı adı ve maksimum bütçe zorunludur.');
      const yeni = {
        id,
        alici: f1,
        tip: f2 || 'Konut',
        bolge: f3 || 'Ören',
        maxButce: Number(f4) || 0,
        not: f5 || '',
      };
      setTalepler((prev) =>
        duzenlenenId ? prev.map((x) => (x.id === id ? yeni : x)) : [yeni, ...prev]
      );
    } else if (modalTur === 'banka') {
      if (!f1) return Alert.alert('Eksik Bilgi', 'Banka adı giriniz.');
      const yeni = {
        id,
        ad: f1,
        bakiye: Number(f2) || 0,
        kmhLimit: Number(f3) || 0,
        kullanilanKmh: 0,
      };
      setBankalar((prev) =>
        duzenlenenId ? prev.map((x) => (x.id === id ? yeni : x)) : [...prev, yeni]
      );
    } else if (modalTur === 'kredi') {
      if (!f1 || !f2) return Alert.alert('Eksik Bilgi', 'Kredi adı ve tutarı giriniz.');
      const yeni = {
        id,
        ad: f1,
        tutar: Number(f2) || 0,
        kalanGun: Number(f3) || 10,
      };
      setKrediler((prev) =>
        duzenlenenId ? prev.map((x) => (x.id === id ? yeni : x)) : [...prev, yeni]
      );
    } else if (modalTur === 'alacak') {
      if (!f1 || !f2) return Alert.alert('Eksik Bilgi', 'Alacaklı kişi ve tutarı giriniz.');
      const yeni = {
        id,
        kisi: f1,
        tutar: Number(f2) || 0,
        aciklama: f3 || '',
      };
      setAlacaklilar((prev) =>
        duzenlenenId ? prev.map((x) => (x.id === id ? yeni : x)) : [...prev, yeni]
      );
    } else if (modalTur === 'islem') {
      if (!f1 || !f2) return Alert.alert('Eksik Bilgi', 'Açıklama ve tutar giriniz.');
      const netTutar = f3 === 'gider' ? -Math.abs(Number(f2)) : Math.abs(Number(f2));
      setHareketler((prev) => [
        { id, baslik: f1, tutar: netTutar, tip: f3, tarih: 'Kasım' },
        ...prev,
      ]);
      // İlk bankanın bakiyesini otomatik güncelle
      if (bankalar.length > 0) {
        setBankalar((prev) =>
          prev.map((b, idx) => (idx === 0 ? { ...b, bakiye: b.bakiye + netTutar } : b))
        );
      }
      // Son ayın trendini güncelle
      setAylikTrend((prev) =>
        prev.map((item, idx) =>
          idx === prev.length - 1 ? { ...item, deger: item.deger + netTutar } : item
        )
      );
    }

    setModalVisible(false);
  };

  const kayitSil = (tur, id) => {
    if (tur === 'portfoy') setPortfoyler((prev) => prev.filter((x) => x.id !== id));
    if (tur === 'talep') setTalepler((prev) => prev.filter((x) => x.id !== id));
    if (tur === 'banka') setBankalar((prev) => prev.filter((x) => x.id !== id));
    if (tur === 'kredi') setKrediler((prev) => prev.filter((x) => x.id !== id));
    if (tur === 'alacak') setAlacaklilar((prev) => prev.filter((x) => x.id !== id));
  };

  // --- GRAFİK ÇİZİM BİLEŞENİ (Çizgili & Noktalı Tam Bağlantılı) ---
  const renderLineChart = () => {
    const maxVal = Math.max(...aylikTrend.map((d) => Math.abs(d.deger)), 50000);
    const chartHeight = 110;
    const midY = chartHeight / 2;

    // Nokta koordinatlarını hesapla
    const points = aylikTrend.map((d, i) => {
      const xPercent = (i / (aylikTrend.length - 1)) * 86 + 7; // %7 ile %93 arası
      const yOffset = (d.deger / maxVal) * (midY - 14);
      const y = midY - yOffset;
      return { ...d, xPercent, y };
    });

    return (
      <View style={styles.chartCard}>
        <View style={styles.chartHeaderRow}>
          <View>
            <Text style={styles.chartTitle}>Aylık Kâr / Zarar Trendi</Text>
            <Text style={styles.chartSub}>Son 6 Aylık Net Performans</Text>
          </View>
          <View style={styles.profitBadge}>
            <Text style={styles.profitBadgeText}>
              {aylikTrend[aylikTrend.length - 1].deger >= 0 ? '+' : ''}₺
              {aylikTrend[aylikTrend.length - 1].deger.toLocaleString('tr-TR')}
            </Text>
          </View>
        </View>

        <View style={[styles.chartCanvas, { height: chartHeight }]}>
          {/* Sıfır (Orta) Referans Çizgisi */}
          <View style={[styles.zeroLine, { top: midY }]} />

          {/* Noktalar Arası Bağlantı Çizgileri */}
          {points.map((pt, idx) => {
            if (idx === points.length - 1) return null;
            const next = points[idx + 1];
            const dx = (next.xPercent - pt.xPercent) * 2.8; // Yaklaşık piksel karşılığı
            const dy = next.y - pt.y;
            const length = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx) * (180 / Math.PI);

            return (
              <View
                key={`line-${idx}`}
                style={{
                  position: 'absolute',
                  left: `${(pt.xPercent + next.xPercent) / 2}%`,
                  top: (pt.y + next.y) / 2 - 1.5,
                  width: length,
                  height: 3,
                  backgroundColor: next.deger < 0 ? '#e74c3c' : '#3498db',
                  transform: [{ translateX: -length / 2 }, { rotate: `${angle}deg` }],
                  borderRadius: 2,
                }}
              />
            );
          })}

          {/* Veri Noktaları ve Üst Değerler */}
          {points.map((pt, idx) => (
            <View
              key={`pt-${idx}`}
              style={{
                position: 'absolute',
                left: `${pt.xPercent}%`,
                top: pt.y,
                alignItems: 'center',
                transform: [{ translateX: -16 }, { translateY: -6 }],
                width: 32,
              }}
            >
              <View
                style={[
                  styles.chartDot,
                  { backgroundColor: pt.deger < 0 ? '#e74c3c' : '#2ecc71' },
                ]}
              />
              <Text style={styles.chartPointVal}>
                {Math.round(pt.deger / 1000)}k
              </Text>
            </View>
          ))}
        </View>

        {/* Alt Ay İsimleri */}
        <View style={styles.chartMonths}>
          {aylikTrend.map((d, i) => (
            <Text key={i} style={styles.monthText}>
              {d.ay}
            </Text>
          ))}
        </View>
      </View>
    );
  };

  const filtrelenmisPortfoy =
    kategoriFiltre === 'Tümü'
      ? portfoyler
      : portfoyler.filter((p) => p.tip.toLowerCase() === kategoriFiltre.toLowerCase());

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />

      {/* Üst Başlık */}
      <View style={styles.headerArea}>
        <View>
          <Text style={styles.welcomeText}>TOCO Ticaret Ofisi</Text>
          <Text style={styles.mainTitle}>Patron Yönetim</Text>
        </View>
        {eslesmeler.length > 0 && (
          <TouchableOpacity
            style={styles.badge}
            onPress={() => {
              setActiveTab('portfoy');
              setPortfoySubTab('Portfoy');
            }}
          >
            <Text style={styles.badgeText}>🔔 {eslesmeler.length} Eşleşme</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* ================= 1. ÖZET SEKMESİ ================= */}
        {activeTab === 'ozet' && (
          <View>
            {/* Canlı Eşleşme Bildirimi */}
            {eslesmeler.length > 0 && (
              <View style={styles.alertCard}>
                <Text style={styles.alertTitle}>🎯 YENİ PORTFÖY & TALEP EŞLEŞMESİ</Text>
                {eslesmeler.map((e, index) => (
                  <Text key={index} style={styles.alertText}>
                    • {e.mesaj}
                  </Text>
                ))}
              </View>
            )}

            {/* Yaklaşan Kredi Uyarısı */}
            {krediler.length > 0 && (
              <View style={styles.warningBanner}>
                <Text style={styles.warningTitle}>🔔 YAKLAŞAN KREDİ ÖDEMESİ</Text>
                <Text style={styles.warningDesc}>
                  • {krediler[0].ad}: ₺{krediler[0].tutar.toLocaleString('tr-TR')} ({krediler[0].kalanGun} gün kaldı)
                </Text>
              </View>
            )}

            <View style={styles.row}>
              <View style={styles.smallCard}>
                <Text style={styles.cardLabel}>Mevcut Nakit</Text>
                <Text style={styles.cardValueGreen}>₺{toplamNakit.toLocaleString('tr-TR')}</Text>
                <Text style={styles.cardSub}>
                  Ek Hesap Dahil: ₺{toplamNakitGucu.toLocaleString('tr-TR')}
                </Text>
              </View>
              <View style={styles.smallCard}>
                <Text style={styles.cardLabel}>Toplam Alacak</Text>
                <Text style={styles.cardValueYellow}>₺{toplamAlacak.toLocaleString('tr-TR')}</Text>
                <Text style={styles.cardSub}>{alacaklilar.length} aktif alacak kaydı</Text>
              </View>
            </View>

            <Text style={styles.sectionHeader}>Hızlı İşlemler</Text>

            <TouchableOpacity style={styles.actionBtnRed} onPress={() => setActiveTab('finans')}>
              <Text style={styles.actionBtnText}>💳 Finans, Alacaklılar & Kredi Yönetimi</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtnBorder} onPress={() => setActiveTab('portfoy')}>
              <Text style={styles.actionBtnTextBlue}>🏢 Gayrimenkul Portföy & Talep Listesi</Text>
            </TouchableOpacity>

            <View style={styles.syncCard}>
              <Text style={styles.syncText}>● Yerel Veri & Canlı Eşleşme Motoru Aktif</Text>
            </View>
          </View>
        )}

        {/* ================= 2. FİNANS SEKMESİ ================= */}
        {activeTab === 'finans' && (
          <View>
            <View style={styles.pageTopRow}>
              <View>
                <Text style={styles.pageTitle}>Finans & Alacaklar</Text>
                <Text style={styles.pageSub}>Nakit, Kredi & Alacaklı Takibi</Text>
              </View>
              <TouchableOpacity style={styles.miniBtnRed} onPress={() => formAc('islem')}>
                <Text style={styles.miniBtnText}>+ İşlem</Text>
              </TouchableOpacity>
            </View>

            {/* Alt Sekmeler */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.subFilterRow}>
              {['Genel', 'Bankalar', 'Krediler', 'Alacaklılar', 'Hareketler'].map((tab) => (
                <TouchableOpacity
                  key={tab}
                  style={[styles.subFilterBtn, finansSubTab === tab && styles.subFilterBtnActive]}
                  onPress={() => setFinansSubTab(tab)}
                >
                  <Text
                    style={[
                      styles.subFilterText,
                      finansSubTab === tab && styles.subFilterTextActive,
                    ]}
                  >
                    {tab}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* GENEL ALT SEKMESİ */}
            {finansSubTab === 'Genel' && (
              <View>
                {renderLineChart()}

                <View style={styles.statBoxContainer}>
                  <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Mevcut Nakit</Text>
                    <Text style={styles.statValGreen}>₺{toplamNakit.toLocaleString('tr-TR')}</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Toplam Alacaklar</Text>
                    <Text style={styles.statValYellow}>₺{toplamAlacak.toLocaleString('tr-TR')}</Text>
                  </View>
                </View>

                <View style={styles.totalPowerBox}>
                  <Text style={styles.totalPowerLabel}>Toplam Kullanılabilir Nakit Gücü</Text>
                  <Text style={styles.totalPowerVal}>₺{toplamNakitGucu.toLocaleString('tr-TR')}</Text>
                </View>

                <View style={styles.row}>
                  <TouchableOpacity style={styles.quickAddBtn} onPress={() => formAc('banka')}>
                    <Text style={styles.quickAddText}>🏦 + Banka Ekle</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.quickAddBtn} onPress={() => formAc('alacak')}>
                    <Text style={styles.quickAddText}>👤 + Alacaklı Ekle</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* BANKALAR ALT SEKMESİ (ve Genel altında özet) */}
            {(finansSubTab === 'Genel' || finansSubTab === 'Bankalar') && (
              <View>
                <View style={styles.listHeaderRow}>
                  <Text style={styles.sectionHeader}>Banka Hesapları & KMH</Text>
                  <TouchableOpacity onPress={() => formAc('banka')}>
                    <Text style={styles.linkBlue}>+ Yeni Ekle</Text>
                  </TouchableOpacity>
                </View>
                {bankalar.map((b) => (
                  <View key={b.id} style={styles.itemCard}>
                    <View style={styles.itemCardTop}>
                      <Text style={styles.itemTitle}>{b.ad}</Text>
                      <View style={styles.iconActions}>
                        <TouchableOpacity onPress={() => formAc('banka', b)} style={styles.editBadge}>
                          <Text style={styles.editBadgeText}>Düzenle</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => kayitSil('banka', b.id)} style={styles.delBadge}>
                          <Text style={styles.delBadgeText}>Sil</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                    <Text style={styles.itemSub}>
                      Nakit: ₺{b.bakiye.toLocaleString('tr-TR')} | KMH Limit: ₺{b.kmhLimit.toLocaleString('tr-TR')}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* KREDİLER ALT SEKMESİ */}
            {finansSubTab === 'Krediler' && (
              <View>
                <View style={styles.listHeaderRow}>
                  <Text style={styles.sectionHeader}>Aktif Kredi Ödemeleri</Text>
                  <TouchableOpacity onPress={() => formAc('kredi')}>
                    <Text style={styles.linkBlue}>+ Kredi Ekle</Text>
                  </TouchableOpacity>
                </View>
                {krediler.map((k) => (
                  <View key={k.id} style={styles.itemCard}>
                    <View style={styles.itemCardTop}>
                      <Text style={styles.itemTitle}>{k.ad}</Text>
                      <View style={styles.iconActions}>
                        <TouchableOpacity onPress={() => formAc('kredi', k)} style={styles.editBadge}>
                          <Text style={styles.editBadgeText}>Düzenle</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => kayitSil('kredi', k.id)} style={styles.delBadge}>
                          <Text style={styles.delBadgeText}>Sil</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                    <Text style={styles.cardValueRed}>₺{k.tutar.toLocaleString('tr-TR')}</Text>
                    <Text style={styles.itemSub}>Ödemeye kalan: {k.kalanGun} gün</Text>
                  </View>
                ))}
              </View>
            )}

            {/* ALACAKLILAR ALT SEKMESİ */}
            {finansSubTab === 'Alacaklılar' && (
              <View>
                <View style={styles.listHeaderRow}>
                  <Text style={styles.sectionHeader}>Tahsil Edilecek Alacaklar</Text>
                  <TouchableOpacity onPress={() => formAc('alacak')}>
                    <Text style={styles.linkBlue}>+ Alacak Ekle</Text>
                  </TouchableOpacity>
                </View>
                {alacaklilar.map((a) => (
                  <View key={a.id} style={styles.itemCard}>
                    <View style={styles.itemCardTop}>
                      <Text style={styles.itemTitle}>{a.kisi}</Text>
                      <View style={styles.iconActions}>
                        <TouchableOpacity onPress={() => formAc('alacak', a)} style={styles.editBadge}>
                          <Text style={styles.editBadgeText}>Düzenle</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => kayitSil('alacak', a.id)} style={styles.delBadge}>
                          <Text style={styles.delBadgeText}>Sil</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                    <Text style={styles.cardValueYellow}>₺{a.tutar.toLocaleString('tr-TR')}</Text>
                    <Text style={styles.itemSub}>{a.aciklama}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* HAREKETLER ALT SEKMESİ */}
            {finansSubTab === 'Hareketler' && (
              <View>
                <Text style={styles.sectionHeader}>Son Gelir / Gider Hareketleri</Text>
                {hareketler.map((h) => (
                  <View key={h.id} style={styles.itemCard}>
                    <View style={styles.itemCardTop}>
                      <Text style={styles.itemTitle}>{h.baslik}</Text>
                      <Text style={h.tutar >= 0 ? styles.statValGreen : styles.cardValueRed}>
                        {h.tutar >= 0 ? '+' : ''}₺{h.tutar.toLocaleString('tr-TR')}
                      </Text>
                    </View>
                    <Text style={styles.itemSub}>Dönem: {h.tarih}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* ================= 3. PORTFÖY & TALEP SEKMESİ ================= */}
        {activeTab === 'portfoy' && (
          <View>
            <View style={styles.pageTopRow}>
              <View>
                <Text style={styles.pageTitle}>Portföy & Talep Yönetimi</Text>
                <Text style={styles.pageSub}>Mülkler, Ada/Parsel & Alıcı Talepleri</Text>
              </View>
              <TouchableOpacity
                style={styles.miniBtnRed}
                onPress={() => formAc(portfoySubTab === 'Portfoy' ? 'portfoy' : 'talep')}
              >
                <Text style={styles.miniBtnText}>
                  {portfoySubTab === 'Portfoy' ? '+ Mülk Ekle' : '+ Talep Ekle'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Portföy / Talep Geçişi */}
            <View style={styles.tabSubRow}>
              <TouchableOpacity
                style={[styles.subTab, portfoySubTab === 'Portfoy' && styles.subTabActive]}
                onPress={() => setPortfoySubTab('Portfoy')}
              >
                <Text style={[styles.subTabText, portfoySubTab === 'Portfoy' && styles.subTabTextActive]}>
                  🏢 Portföy Listesi ({portfoyler.length})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.subTab, portfoySubTab === 'Talep' && styles.subTabActive]}
                onPress={() => setPortfoySubTab('Talep')}
              >
                <Text style={[styles.subTabText, portfoySubTab === 'Talep' && styles.subTabTextActive]}>
                  🎯 Alıcı Talepleri ({talepler.length})
                </Text>
              </TouchableOpacity>
            </View>

            {portfoySubTab === 'Portfoy' ? (
              <View>
                {/* Kategori Filtreleri */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.subFilterRow}>
                  {['Tümü', 'Konut', 'Tarla', 'Zeytinlik', 'Arsa'].map((kat) => (
                    <TouchableOpacity
                      key={kat}
                      style={[styles.subFilterBtn, kategoriFiltre === kat && styles.subFilterBtnActive]}
                      onPress={() => setKategoriFiltre(kat)}
                    >
                      <Text
                        style={[
                          styles.subFilterText,
                          kategoriFiltre === kat && styles.subFilterTextActive,
                        ]}
                      >
                        {kat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {filtrelenmisPortfoy.map((item) => {
                  const eslesenTalep = eslesmeler.find((e) => e.portfoyId === item.id);
                  return (
                    <View key={item.id} style={styles.propertyCard}>
                      <View style={styles.propTagRow}>
                        <Text style={styles.propTag}>{item.tip}</Text>
                        <View style={styles.iconActions}>
                          <TouchableOpacity
                            onPress={() => formAc('portfoy', item)}
                            style={styles.editBadge}
                          >
                            <Text style={styles.editBadgeText}>Düzenle</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => kayitSil('portfoy', item.id)}
                            style={styles.delBadge}
                          >
                            <Text style={styles.delBadgeText}>Sil</Text>
                          </TouchableOpacity>
                        </View>
                      </View>

                      {eslesenTalep && (
                        <View style={styles.matchBanner}>
                          <Text style={styles.matchBannerText}>🎯 {eslesenTalep.mesaj}</Text>
                        </View>
                      )}

                      <Text style={styles.propTitle}>{item.baslik}</Text>
                      <View style={styles.adaParselBox}>
                        <Text style={styles.adaParselText}>
                          Bölge: {item.bolge} | Ada: {item.ada} | Parsel: {item.parsel}
                        </Text>
                      </View>
                      <Text style={styles.propPrice}>₺{item.fiyat.toLocaleString('tr-TR')}</Text>
                    </View>
                  );
                })}
              </View>
            ) : (
              <View>
                {talepler.map((t) => {
                  const eslesenMulk = eslesmeler.find((e) => e.talepId === t.id);
                  return (
                    <View key={t.id} style={styles.propertyCard}>
                      <View style={styles.propTagRow}>
                        <Text style={styles.propTag}>{t.tip} Talebi</Text>
                        <View style={styles.iconActions}>
                          <TouchableOpacity onPress={() => formAc('talep', t)} style={styles.editBadge}>
                            <Text style={styles.editBadgeText}>Düzenle</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => kayitSil('talep', t.id)}
                            style={styles.delBadge}
                          >
                            <Text style={styles.delBadgeText}>Sil</Text>
                          </TouchableOpacity>
                        </View>
                      </View>

                      {eslesenMulk && (
                        <View style={styles.matchBanner}>
                          <Text style={styles.matchBannerText}>🎯 {eslesenMulk.mesaj}</Text>
                        </View>
                      )}

                      <Text style={styles.propTitle}>{t.alici}</Text>
                      <Text style={styles.propDetail}>
                        Aranan Bölge: {t.bolge} | Not: {t.not}
                      </Text>
                      <Text style={styles.propPrice}>
                        Max Bütçe: ₺{t.maxButce.toLocaleString('tr-TR')}
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* ================= EKLEME / DÜZENLEME MODALI ================= */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>
              {duzenlenenId ? 'Kaydı Düzenle' : 'Yeni Kayıt Ekle'}
            </Text>

            {modalTur === 'portfoy' && (
              <>
                <TextInput style={styles.input} placeholder="İlan Başlığı (Örn: Ören Daire)" placeholderTextColor="#777" value={f1} onChangeText={setF1} />
                <TextInput style={styles.input} placeholder="Tip (Konut, Arsa, Tarla, Zeytinlik)" placeholderTextColor="#777" value={f2} onChangeText={setF2} />
                <TextInput style={styles.input} placeholder="Bölge / Mahalle (Örn: Ören)" placeholderTextColor="#777" value={f3} onChangeText={setF3} />
                <View style={styles.row}>
                  <TextInput style={[styles.input, { width: '48%' }]} placeholder="Ada No" placeholderTextColor="#777" value={f4} onChangeText={setF4} />
                  <TextInput style={[styles.input, { width: '48%' }]} placeholder="Parsel No" placeholderTextColor="#777" value={f5} onChangeText={setF5} />
                </View>
                <TextInput style={styles.input} placeholder="Fiyat (TL)" placeholderTextColor="#777" keyboardType="numeric" value={f6} onChangeText={setF6} />
              </>
            )}

            {modalTur === 'talep' && (
              <>
                <TextInput style={styles.input} placeholder="Alıcı Adı Soyadı" placeholderTextColor="#777" value={f1} onChangeText={setF1} />
                <TextInput style={styles.input} placeholder="İstenen Tip (Konut, Arsa, Zeytinlik)" placeholderTextColor="#777" value={f2} onChangeText={setF2} />
                <TextInput style={styles.input} placeholder="İstenen Bölge (Örn: Ören)" placeholderTextColor="#777" value={f3} onChangeText={setF3} />
                <TextInput style={styles.input} placeholder="Maksimum Bütçe (TL)" placeholderTextColor="#777" keyboardType="numeric" value={f4} onChangeText={setF4} />
                <TextInput style={styles.input} placeholder="Müşteri Notu" placeholderTextColor="#777" value={f5} onChangeText={setF5} />
              </>
            )}

            {modalTur === 'banka' && (
              <>
                <TextInput style={styles.input} placeholder="Banka / Hesap Adı" placeholderTextColor="#777" value={f1} onChangeText={setF1} />
                <TextInput style={styles.input} placeholder="Mevcut Nakit Bakiye (TL)" placeholderTextColor="#777" keyboardType="numeric" value={f2} onChangeText={setF2} />
                <TextInput style={styles.input} placeholder="KMH Ek Hesap Limiti (TL)" placeholderTextColor="#777" keyboardType="numeric" value={f3} onChangeText={setF3} />
              </>
            )}

            {modalTur === 'kredi' && (
              <>
                <TextInput style={styles.input} placeholder="Kredi / Taksit Adı" placeholderTextColor="#777" value={f1} onChangeText={setF1} />
                <TextInput style={styles.input} placeholder="Ödeme Tutarı (TL)" placeholderTextColor="#777" keyboardType="numeric" value={f2} onChangeText={setF2} />
                <TextInput style={styles.input} placeholder="Ödemeye Kalan Gün" placeholderTextColor="#777" keyboardType="numeric" value={f3} onChangeText={setF3} />
              </>
            )}

            {modalTur === 'alacak' && (
              <>
                <TextInput style={styles.input} placeholder="Alacaklı Olunan Kişi / Kurum" placeholderTextColor="#777" value={f1} onChangeText={setF1} />
                <TextInput style={styles.input} placeholder="Alacak Tutarı (TL)" placeholderTextColor="#777" keyboardType="numeric" value={f2} onChangeText={setF2} />
                <TextInput style={styles.input} placeholder="Açıklama" placeholderTextColor="#777" value={f3} onChangeText={setF3} />
              </>
            )}

            {modalTur === 'islem' && (
              <>
                <View style={styles.row}>
                  <TouchableOpacity
                    style={[styles.typeToggle, f3 === 'gelir' && styles.typeToggleGreen]}
                    onPress={() => setF3('gelir')}
                  >
                    <Text style={styles.typeToggleText}>+ Gelir Ekle</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.typeToggle, f3 === 'gider' && styles.typeToggleRed]}
                    onPress={() => setF3('gider')}
                  >
                    <Text style={styles.typeToggleText}>- Gider Ekle</Text>
                  </TouchableOpacity>
                </View>
                <TextInput style={styles.input} placeholder="İşlem Açıklaması" placeholderTextColor="#777" value={f1} onChangeText={setF1} />
                <TextInput style={styles.input} placeholder="Tutar (TL)" placeholderTextColor="#777" keyboardType="numeric" value={f2} onChangeText={setF2} />
              </>
            )}

            <View style={styles.row}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: '#333' }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalBtnText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: '#8B0000' }]}
                onPress={formuKaydet}
              >
                <Text style={styles.modalBtnText}>Kaydet</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ================= ALT NAVİGASYON (3 SEKMELİ) ================= */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('ozet')}>
          <Text style={[styles.navText, activeTab === 'ozet' && styles.navTextActive]}>🏠 Özet</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('finans')}>
          <Text style={[styles.navText, activeTab === 'finans' && styles.navTextActive]}>💳 Finans</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('portfoy')}>
          <Text style={[styles.navText, activeTab === 'portfoy' && styles.navTextActive]}>
            🏢 Portföy & Talep
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  headerArea: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#252525',
  },
  welcomeText: { color: '#888', fontSize: 11 },
  mainTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  badge: { backgroundColor: '#8B0000', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  scrollContent: { padding: 16, paddingBottom: 90 },

  alertCard: {
    backgroundColor: '#2d1515',
    borderWidth: 1,
    borderColor: '#e74c3c',
    padding: 14,
    borderRadius: 10,
    marginBottom: 14,
  },
  alertTitle: { color: '#ff6b6b', fontSize: 13, fontWeight: 'bold', marginBottom: 4 },
  alertText: { color: '#fff', fontSize: 13, marginTop: 2 },

  warningBanner: {
    backgroundColor: '#2b1b12',
    borderWidth: 1,
    borderColor: '#e67e22',
    padding: 12,
    borderRadius: 8,
    marginBottom: 14,
  },
  warningTitle: { color: '#f39c12', fontSize: 12, fontWeight: 'bold' },
  warningDesc: { color: '#fff', fontSize: 13, marginTop: 4 },

  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  smallCard: {
    backgroundColor: '#1e1e1e',
    width: '48%',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  cardLabel: { color: '#aaa', fontSize: 12 },
  cardValueGreen: { color: '#2ecc71', fontSize: 18, fontWeight: 'bold', marginVertical: 4 },
  cardValueRed: { color: '#e74c3c', fontSize: 16, fontWeight: 'bold', marginVertical: 4 },
  cardValueYellow: { color: '#f1c40f', fontSize: 18, fontWeight: 'bold', marginVertical: 4 },
  cardSub: { color: '#777', fontSize: 10 },

  sectionHeader: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginVertical: 10 },
  listHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  linkBlue: { color: '#3498db', fontSize: 13, fontWeight: 'bold' },

  actionBtnRed: { backgroundColor: '#8B0000', padding: 16, borderRadius: 8, alignItems: 'center', marginBottom: 10 },
  actionBtnBorder: {
    backgroundColor: '#1e1e1e',
    borderWidth: 1,
    borderColor: '#333',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  actionBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  actionBtnTextBlue: { color: '#3498db', fontWeight: 'bold', fontSize: 14 },
  syncCard: {
    backgroundColor: '#162619',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#274e2e',
  },
  syncText: { color: '#2ecc71', fontSize: 12, fontWeight: '600' },

  pageTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  pageTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  pageSub: { color: '#888', fontSize: 11 },
  miniBtnRed: { backgroundColor: '#8B0000', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 6 },
  miniBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },

  subFilterRow: { flexDirection: 'row', marginBottom: 14 },
  subFilterBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#1e1e1e',
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  subFilterBtnActive: { backgroundColor: '#3498db', borderColor: '#3498db' },
  subFilterText: { color: '#aaa', fontSize: 12, fontWeight: '600' },
  subFilterTextActive: { color: '#fff' },

  // Grafik
  chartCard: {
    backgroundColor: '#1e1e1e',
    padding: 16,
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  chartHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chartTitle: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  chartSub: { color: '#888', fontSize: 11, marginTop: 2 },
  profitBadge: { backgroundColor: '#143822', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
  profitBadgeText: { color: '#2ecc71', fontSize: 13, fontWeight: 'bold' },
  chartCanvas: { position: 'relative', marginTop: 14, marginBottom: 6, width: '100%' },
  zeroLine: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: '#333' },
  chartDot: { width: 10, height: 10, borderRadius: 5, borderWidth: 2, borderColor: '#fff' },
  chartPointVal: { color: '#ccc', fontSize: 9, marginTop: 2, fontWeight: 'bold' },
  chartMonths: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 8 },
  monthText: { color: '#888', fontSize: 11 },

  statBoxContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  statBox: {
    backgroundColor: '#1e1e1e',
    width: '48%',
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  statLabel: { color: '#aaa', fontSize: 12 },
  statValGreen: { color: '#2ecc71', fontSize: 16, fontWeight: 'bold', marginTop: 4 },
  statValYellow: { color: '#f1c40f', fontSize: 16, fontWeight: 'bold', marginTop: 4 },
  totalPowerBox: {
    backgroundColor: '#16222b',
    borderWidth: 1,
    borderColor: '#2980b9',
    padding: 14,
    borderRadius: 8,
    marginBottom: 14,
  },
  totalPowerLabel: { color: '#3498db', fontSize: 12 },
  totalPowerVal: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginTop: 4 },

  quickAddBtn: {
    backgroundColor: '#1e1e1e',
    width: '48%',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  quickAddText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },

  itemCard: {
    backgroundColor: '#1e1e1e',
    padding: 14,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  itemCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  itemTitle: { color: '#fff', fontWeight: 'bold', fontSize: 14, flex: 1 },
  itemSub: { color: '#999', fontSize: 12, marginTop: 2 },

  iconActions: { flexDirection: 'row', gap: 6 },
  editBadge: { backgroundColor: '#2c2511', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, borderWidth: 1, borderColor: '#f39c12' },
  editBadgeText: { color: '#f39c12', fontSize: 11, fontWeight: 'bold' },
  delBadge: { backgroundColor: '#2d1515', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, borderWidth: 1, borderColor: '#e74c3c' },
  delBadgeText: { color: '#e74c3c', fontSize: 11, fontWeight: 'bold' },

  tabSubRow: { flexDirection: 'row', marginBottom: 14 },
  subTab: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#333',
  },
  subTabActive: { backgroundColor: '#1e272c', borderColor: '#3498db' },
  subTabText: { color: '#888', fontSize: 12, fontWeight: '600' },
  subTabTextActive: { color: '#3498db', fontWeight: 'bold' },

  propertyCard: {
    backgroundColor: '#1e1e1e',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  propTagRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  propTag: {
    color: '#3498db',
    fontSize: 11,
    fontWeight: 'bold',
    backgroundColor: '#12263a',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  matchBanner: {
    backgroundColor: '#332b10',
    borderWidth: 1,
    borderColor: '#f1c40f',
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
  },
  matchBannerText: { color: '#f1c40f', fontSize: 12, fontWeight: 'bold' },
  propTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  adaParselBox: { backgroundColor: '#252525', padding: 8, borderRadius: 6, marginVertical: 6 },
  adaParselText: { color: '#ccc', fontSize: 12 },
  propDetail: { color: '#aaa', fontSize: 12, marginTop: 4 },
  propPrice: { color: '#2ecc71', fontSize: 16, fontWeight: 'bold', marginTop: 6 },

  // Modal Stilleri
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 20 },
  modalBox: { backgroundColor: '#1e1e1e', padding: 20, borderRadius: 12, borderWidth: 1, borderColor: '#333' },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 14 },
  input: {
    backgroundColor: '#121212',
    color: '#fff',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    fontSize: 14,
  },
  typeToggle: { flex: 1, padding: 10, alignItems: 'center', borderRadius: 8, backgroundColor: '#252525', marginHorizontal: 4 },
  typeToggleGreen: { backgroundColor: '#194d2b', borderWidth: 1, borderColor: '#2ecc71' },
  typeToggleRed: { backgroundColor: '#4d1919', borderWidth: 1, borderColor: '#e74c3c' },
  typeToggleText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  modalBtn: { flex: 1, padding: 14, borderRadius: 8, alignItems: 'center', marginHorizontal: 4, marginTop: 6 },
  modalBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },

  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#181818',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#2a2a2a',
  },
  navItem: { alignItems: 'center', flex: 1 },
  navText: { color: '#888', fontSize: 13, fontWeight: '600' },
  navTextActive: { color: '#3498db' },
});
