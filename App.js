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

  // Modal ve Form State'leri
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState(''); // 'kredi', 'talep'
  
  // Form Alanları
  const [krediBaslik, setKrediBaslik] = useState('');
  const [krediTutar, setKrediTutar] = useState('');
  const [krediTarih, setKrediTarih] = useState('');
  
  const [talepMusteri, setTalepMusteri] = useState('');
  const [talepBolge, setTalepBolge] = useState('');

  // Listeler (Başlangıç verileri)
  const [kredilerListesi, setKredilerListesi] = useState([
    { id: '1', baslik: 'Ofis Yatırım Kredisi', tutar: '₺14.200', kalan: '4 gün' }
  ]);

  const [taleplerListesi, setTaleplerListesi] = useState([
    { id: '1', musteri: 'Ahmet Bey', bolge: 'Ören', tip: 'Konut', detay: 'Ören - Konut talebi' }
  ]);

  const progressAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Uygulama açıldığında kaydedilmiş verileri yükle
  useEffect(() => {
    veriYukle();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 1800,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      useNativeDriver: false,
    }).start(() => {
      setTimeout(() => {
        setIsLoading(false);
      }, 150);
    });
  }, []);

  // AsyncStorage Veri Okuma
  const veriYukle = async () => {
    try {
      const kayitliKrediler = await AsyncStorage.getItem('@krediler_listesi');
      const kayitliTalepler = await AsyncStorage.getItem('@talepler_listesi');
      if (kayitliKrediler) setKredilerListesi(JSON.parse(kayitliKrediler));
      if (kayitliTalepler) setTaleplerListesi(JSON.parse(kayitliTalepler));
    } catch (e) {
      console.log('Veri yükleme hatası', e);
    }
  };

  // AsyncStorage Veri Kaydetme
  const veriKaydet = async (yeniKrediler, yeniTalepler) => {
    try {
      if (yeniKrediler) await AsyncStorage.setItem('@krediler_listesi', JSON.stringify(yeniKrediler));
      if (yeniTalepler) await AsyncStorage.setItem('@talepler_listesi', JSON.stringify(yeniTalepler));
    } catch (e) {
      console.log('Veri kaydetme hatası', e);
    }
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const kayitEkle = () => {
    if (modalType === 'kredi') {
      if (!krediBaslik || !krediTutar) {
        Alert.alert('Eksik Bilgi', 'Lütfen kredi başlığı ve tutarını giriniz.');
        return;
      }
      const yeniListe = [...kredilerListesi, { id: Date.now().toString(), baslik: krediBaslik, tutar: krediTutar, kalan: krediTarih || '1 ay' }];
      setKredilerListesi(yeniListe);
      veriKaydet(yeniListe, null);
      setKrediBaslik(''); setKrediTutar(''); setKrediTarih('');
    } else if (modalType === 'talep') {
      if (!talepMusteri || !talepBolge) {
        Alert.alert('Eksik Bilgi', 'Lütfen müşteri adı ve bölgeyi giriniz.');
        return;
      }
      const yeniListe = [...taleplerListesi, { id: Date.now().toString(), musteri: talepMusteri, bolge: talepBolge, tip: 'Konut', detay: `${talepBolge} - Konut talebi` }];
      setTaleplerListesi(yeniListe);
      veriKaydet(null, yeniListe);
      setTalepMusteri(''); setTalepBolge('');
    }
    setModalVisible(false);
  };

  const krediSil = (id) => {
    const yeniListe = kredilerListesi.filter(item => item.id !== id);
    setKredilerListesi(yeniListe);
    veriKaydet(yeniListe, null);
  };

  if (isLoading) {
    return (
      <View style={styles.splashContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />
        <Animated.View style={{ opacity: fadeAnim, alignItems: 'center' }}>
          <Text style={styles.splashSub}>TOCO TİCARET OFİSİ</Text>
          <Text style={styles.splashLogo}>PATRON</Text>
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
          </View>
          <Text style={styles.loadingInfoText}>Sistem ve portföy verileri yükleniyor...</Text>
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
          <View style={styles.patronBox}>
            <Text style={styles.patronBoxText}>PATRON</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.notificationBadge}>
          <Text style={styles.notificationText}>🔔 1 Eşleşme</Text>
        </TouchableOpacity>
      </View>

      {/* İçerik Alanı */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'ozet' && (
          <View>
            <View style={styles.alertCard}>
              <Text style={styles.alertTitle}>🎯 YENİ PORTFÖY &amp; TALEP EŞLEŞMESİ</Text>
              <Text style={styles.alertDesc}>
                • Ahmet Bey (Ören - Konut) talebi ile "Ören Sahil Lüks Konut" eşleşti!
              </Text>
            </View>

            <View style={styles.warningCard}>
              <Text style={styles.warningTitle}>🔔 YAKLAŞAN KREDİ ÖDEMESİ</Text>
              <Text style={styles.warningDesc}>
                • Ofis Yatırım Kredisi: ₺14.200 (4 gün kaldı)
              </Text>
            </View>

            <View style={styles.row}>
              <View style={styles.infoBox}>
                <Text style={styles.boxLabel}>Mevcut Nakit</Text>
                <Text style={styles.boxValueGreen}>₺173.750</Text>
                <Text style={styles.boxSub}>Ek Hesap Dahil: ₺248.750</Text>
              </View>
              <View style={styles.infoBox}>
                <Text style={styles.boxLabel}>Toplam Alacak</Text>
                <Text style={styles.boxValueYellow}>₺35.000</Text>
                <Text style={styles.boxSub}>1 aktif alacak kaydı</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Hızlı İşlemler</Text>
            <TouchableOpacity style={styles.primaryButton} onPress={() => setActiveTab('finans')}>
              <Text style={styles.primaryButtonText}>💳 Finans, Alacaklılar &amp; Kredi Yönetimi</Text>
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
              <Text style={styles.sectionTitle}>Finans &amp; Alacaklılar</Text>
              <TouchableOpacity style={styles.miniButton} onPress={() => { setModalType('kredi'); setModalVisible(true); }}>
                <Text style={styles.miniButtonText}>+ Kredi Ekle</Text>
              </TouchableOpacity>
            </View>

            {/* Finans Alt Sekmeler */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.subTabContainer}>
              {['genel', 'bankalar', 'krediler', 'alacaklilar'].map((tab) => (
                <TouchableOpacity
                  key={tab}
                  style={[styles.subTabButton, finansSubTab === tab && styles.subTabActive]}
                  onPress={() => setFinansSubTab(tab)}
                >
                  <Text style={[styles.subTabText, finansSubTab === tab && styles.subTextActive]}>
                    {tab.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* ÇİZGİ GRAFİK (Aylık Kâr / Zarar Trendi) */}
            <View style={styles.chartCard}>
              <View style={styles.rowBetween}>
                <Text style={styles.chartTitle}>Aylık Kâr / Zarar Trendi</Text>
                <View style={styles.profitBadge}><Text style={styles.profitBadgeText}>+₺48.000</Text></View>
              </View>
              <Text style={styles.chartSub}>Son 6 Aylık Net Performans</Text>
              
              <View style={styles.graphVisualContainer}>
                <View style={styles.graphLineFake} />
                <View style={[styles.graphDot, { left: '10%', top: 50 }]}><Text style={styles.dotText}>22k</Text></View>
                <View style={[styles.graphDot, { left: '30%', top: 45 }]}><Text style={styles.dotText}>28k</Text></View>
                <View style={[styles.graphDotRed, { left: '50%', top: 75 }]}><Text style={styles.dotTextRed}>-15k</Text></View>
                <View style={[styles.graphDot, { left: '70%', top: 38 }]}><Text style={styles.dotText}>34k</Text></View>
                <View style={[styles.graphDot, { left: '90%', top: 30 }]}><Text style={styles.dotText}>48k</Text></View>
              </View>
              <View style={styles.graphMonthsRow}>
                <Text style={styles.monthText}>Haz</Text><Text style={styles.monthText}>Tem</Text>
                <Text style={styles.monthText}>Ağu</Text><Text style={styles.monthText}>Eyl</Text>
                <Text style={styles.monthText}>Eki</Text><Text style={styles.monthText}>Kas</Text>
              </View>
            </View>

            <View style={styles.infoBoxFull}>
              <Text style={styles.boxLabel}>Toplam Kullanılabilir Nakit Gücü</Text>
              <Text style={styles.boxValueWhite}>₺248.750</Text>
            </View>

            {/* Krediler Listesi */}
            {(finansSubTab === 'krediler' || finansSubTab === 'genel') && (
              <View>
                <Text style={styles.sectionTitle}>Aktif Krediler &amp; Ödemeler</Text>
                {kredilerListesi.map((k) => (
                  <View key={k.id} style={styles.bankCard}>
                    <View>
                      <Text style={styles.bankTitle}>{k.baslik}</Text>
                      <Text style={styles.propertySub}>Tutar: {k.tutar} | Kalan: {k.kalan}</Text>
                    </View>
                    <TouchableOpacity style={styles.deleteBtn} onPress={() => krediSil(k.id)}>
                      <Text style={styles.btnTextRed}>Sil</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            <Text style={styles.sectionTitle}>Banka Hesapları &amp; KMH</Text>
            <View style={styles.bankCard}>
              <Text style={styles.bankTitle}>Ziraat Bankası (Vadesiz)</Text>
              <View style={styles.bankActionRow}>
                <TouchableOpacity style={styles.editBtn}><Text style={styles.btnTextOrange}>Düzenle</Text></TouchableOpacity>
                <TouchableOpacity style={styles.deleteBtn}><Text style={styles.btnTextRed}>Sil</Text></TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {activeTab === 'portfoy' && (
          <View>
            <View style={styles.rowBetween}>
              <Text style={styles.sectionTitle}>Portföy &amp; Talep Yönetimi</Text>
              <TouchableOpacity style={styles.miniButtonRed} onPress={() => { setModalType('talep'); setModalVisible(true); }}>
                <Text style={styles.miniButtonText}>+ Talep Ekle</Text>
              </TouchableOpacity>
            </View>

            {/* Portföy Alt Sekmeler */}
            <View style={styles.row}>
              <TouchableOpacity 
                style={[styles.portfoyTabBtn, portfoySubTab === 'mulkler' && styles.portfoyTabActive]}
                onPress={() => setPortfoySubTab('mulkler')}
              >
                <Text style={styles.portfoyTabText}>🏠 Portföy Listesi (2)</Text>
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
                <View style={styles.propertyCard}>
                  <View style={styles.badgeBlue}><Text style={styles.badgeText}>Konut</Text></View>
                  <Text style={styles.propertyTitle}>Ören Sahil Lüks Konut</Text>
                  <Text style={styles.propertySub}>Bölge: Ören | Ada: 142 | Parsel: 5</Text>
                  <Text style={styles.propertyPrice}>₺3.250.000</Text>
                </View>

                <View style={styles.propertyCard}>
                  <View style={styles.badgeGreen}><Text style={styles.badgeText}>Zeytinlik</Text></View>
                  <Text style={styles.propertyTitle}>Pelitköy Zeytinlik</Text>
                  <Text style={styles.propertySub}>Bölge: Pelitköy | Ada: 88 | Parsel: 12</Text>
                  <Text style={styles.propertyPrice}>₺850.000</Text>
                </View>
              </View>
            ) : (
              <View>
                {taleplerListesi.map((t) => (
                  <View key={t.id} style={styles.propertyCard}>
                    <View style={styles.badgeRed}><Text style={styles.badgeText}>Talep</Text></View>
                    <Text style={styles.propertyTitle}>{t.musteri}</Text>
                    <Text style={styles.propertySub}>Bölge: {t.bolge} | Tür: {t.tip}</Text>
                    <Text style={styles.alertDesc}>{t.detay}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* VERİ EKLEME MODALI */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              {modalType === 'kredi' ? 'Yeni Kredi / Ödeme Ekle' : 'Yeni Alıcı Talebi Ekle'}
            </Text>

            {modalType === 'kredi' ? (
              <>
                <TextInput style={styles.input} placeholder="Kredi Başlığı (Örn: Ofis Kredisi)" placeholderTextColor="#666" value={krediBaslik} onChangeText={setKrediBaslik} />
                <TextInput style={styles.input} placeholder="Tutar (Örn: ₺12.000)" placeholderTextColor="#666" value={krediTutar} onChangeText={setKrediTutar} />
                <TextInput style={styles.input} placeholder="Kalan Süre (Örn: 5 gün)" placeholderTextColor="#666" value={krediTarih} onChangeText={setKrediTarih} />
              </>
            ) : (
              <>
                <TextInput style={styles.input} placeholder="Müşteri Adı (Örn: Mehmet Bey)" placeholderTextColor="#666" value={talepMusteri} onChangeText={setTalepMusteri} />
                <TextInput style={styles.input} placeholder="Bölge (Örn: Pelitköy / Ören)" placeholderTextColor="#666" value={talepBolge} onChangeText={setTalepBolge} />
              </>
            )}

            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalCancelText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSaveBtn} onPress={kayitEkle}>
                <Text style={styles.modalSaveText}>Kaydet</Text>
              </TouchableOpacity>
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
  progressFill: { height: '100%', backgroundColor: '#A8002A', shadowColor: '#FF1A53', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.9, shadowRadius: 10, elevation: 6 },
  loadingInfoText: { color: '#777', fontSize: 11, marginTop: 14, letterSpacing: 0.5 },

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
  graphLineFake: { position: 'absolute', top: '50%', left: 0, right: 0, height: 2, backgroundColor: '#333' },
  graphDot: { position: 'absolute', width: 22, height: 16, backgroundColor: '#1e3a5f', borderRadius: 4, justifyContent: 'center', alignItems: 'center' },
  graphDotRed: { position: 'absolute', width: 24, height: 16, backgroundColor: '#800020', borderRadius: 4, justifyContent: 'center', alignItems: 'center' },
  dotText: { color: '#4da6ff', fontSize: 9, fontWeight: 'bold' },
  dotTextRed: { color: '#ff5555', fontSize: 9, fontWeight: 'bold' },
  graphMonthsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 6, marginTop: 4 },
  monthText: { color: '#666', fontSize: 10 },

  bankCard: { backgroundColor: '#1a1a1a', borderRadius: 12, padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  bankTitle: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  bankActionRow: { flexDirection: 'row' },
  editBtn: { paddingHorizontal: 8, paddingVertical: 4, marginRight: 6, borderWidth: 1, borderColor: '#ffa500', borderRadius: 6 },
  deleteBtn: { paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: '#ff4d4d', borderRadius: 6 },
  btnTextOrange: { color: '#ffa500', fontSize: 11 },
  btnTextRed: { color: '#ff4d4d', fontSize: 11 },

  propertyCard: { backgroundColor: '#1a1a1a', borderRadius: 12, padding: 16, marginBottom: 12 },
  badgeBlue: { backgroundColor: '#1e3a5f', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginBottom: 8 },
  badgeGreen: { backgroundColor: '#1b4d2b', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginBottom: 8 },
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
