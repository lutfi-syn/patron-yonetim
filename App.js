import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';

export default function App() {
  const [activeTab, setActiveTab] = useState('ozet'); // 'ozet', 'finans', 'portfoy'

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      
      {/* Üst Başlık */}
      <View style={styles.header}>
        <View>
          <Text style={styles.subHeaderText}>TOCO Ticaret Ofisi</Text>
          <Text style={styles.mainHeaderText}>Patron Yönetim</Text>
        </View>
        <TouchableOpacity style={styles.notificationBadge}>
          <Text style={styles.notificationText}>🔔 1 Eşleşme</Text>
        </TouchableOpacity>
      </View>

      {/* İçerik Alanı */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'ozet' && (
          <View>
            {/* Eşleşme Kartı */}
            <View style={styles.alertCard}>
              <Text style={styles.alertTitle}>🎯 YENİ PORTFÖY &amp; TALEP EŞLEŞMESİ</Text>
              <Text style={styles.alertDesc}>• Ahmet Bey (Ören - Konut) talebi ile "Ören Sahil Lüks Konut" eşleşti!</Text>
            </View>

            {/* Yaklaşan Ödeme Kartı */}
            <View style={styles.warningCard}>
              <Text style={styles.warningTitle}>🔔 YAKLAŞAN KREDİ ÖDEMESİ</Text>
              <Text style={styles.warningDesc}>• Ofis Yatırım Kredisi: ₺14.200 (4 gün kaldı)</Text>
            </View>

            {/* Özet Finans Kutuları */}
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

            {/* Hızlı İşlemler */}
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
              <TouchableOpacity style={styles.miniButton}>
                <Text style={styles.miniButtonText}>+ İşlem</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.infoBoxFull}>
              <Text style={styles.boxLabel}>Toplam Kullanılabilir Nakit Gücü</Text>
              <Text style={styles.boxValueWhite}>₺248.750</Text>
            </View>

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
              <TouchableOpacity style={styles.miniButtonRed}>
                <Text style={styles.miniButtonText}>+ Mülk Ekle</Text>
              </TouchableOpacity>
            </View>

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
        )}
        <View style={{ height: 40 }} />
      </ScrollView>

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
  container: { flex: 1, backgroundColor: '#121212' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#222' },
  subHeaderText: { fontSize: 11, color: '#aaa' },
  mainHeaderText: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
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
  badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  propertyTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  propertySub: { color: '#aaa', fontSize: 12, marginBottom: 8 },
  propertyPrice: { color: '#00ff7f', fontSize: 18, fontWeight: 'bold' },
  navBar: { flexDirection: 'row', backgroundColor: '#181818', borderTopWidth: 1, borderTopColor: '#252525', paddingVertical: 10 },
  navItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  navText: { color: '#777', fontSize: 12, fontWeight: '600' },
  activeNavText: { color: '#ffa500' }
});
