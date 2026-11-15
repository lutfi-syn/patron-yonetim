import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, Alert, Share, SafeAreaStorage, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  const [aktifTab, setAktifTab] = useState('anaSayfa'); // 'anaSayfa' veya 'ayarlar'
  const [veriler, setVeriler] = useState([]);
  const [yazi, setYazi] = useState('');
  const [importMetni, setImportMetni] = useState('');

  useEffect(() => {
    kayitlariYukle();
  }, []);

  const kayitlariYukle = async () => {
    try {
      const kayitliVeri = await AsyncStorage.getItem('@patron_veriler');
      if (kayitliVeri !== null) {
        setVeriler(JSON.parse(kayitliVeri));
      }
    } catch (hata) {
      console.log('Veri yüklenirken hata:', hata);
    }
  };

  const veriyiKaydet = async (yeniListe) => {
    setVeriler(yeniListe);
    try {
      await AsyncStorage.setItem('@patron_veriler', JSON.stringify(yeniListe));
    } catch (hata) {
      console.log('Veri kaydedilirken hata:', hata);
    }
  };

  const veriEkle = () => {
    if (yazi.trim() === '') return;
    const yeniListe = [...veriler, { id: Date.now().toString(), baslik: yazi }];
    veriyiKaydet(yeniListe);
    setYazi('');
  };

  const veriSil = (id) => {
    const yeniListe = veriler.filter((item) => item.id !== id);
    veriyiKaydet(yeniListe);
  };

  const verileriDisariAktar = async () => {
    try {
      const jsonVeri = JSON.stringify(veriler);
      await Share.share({
        message: jsonVeri,
        title: 'Patron Yonetim Yedek Verileri',
      });
    } catch (hata) {
      Alert.alert('Hata', 'Veriler paylaşılırken bir sorun oluştu.');
    }
  };

  const verileriIceriAktar = () => {
    try {
      if (!importMetni.trim()) {
        Alert.alert('Uyarı', 'Lütfen yedek kodunu alana yapıştırın.');
        return;
      }
      const parseEdilmis = JSON.parse(importMetni);
      if (Array.isArray(parseEdilmis)) {
        veriyiKaydet(parseEdilmis);
        setImportMetni('');
        Alert.alert('Başarılı', 'Veriler başarıyla yüklendi!');
      } else {
        Alert.alert('Hata', 'Geçersiz yedek formatı.');
      }
    } catch (hata) {
      Alert.alert('Hata', 'Yedek kodu okunamadı, metni kontrol edin.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Üst Başlık */}
      <View style={styles.header}>
        <Text style={styles.baslik}>PATRON YÖNETİM</Text>
      </View>

      {/* İÇERİK ALANI: Sekmelere Göre Değişir */}
      <View style={styles.content}>
        {aktifTab === 'anaSayfa' ? (
          /* --- ANA SAYFA --- */
          <View style={{ flex: 1 }}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Yeni kayıt veya not ekle..."
                placeholderTextColor="#777"
                value={yazi}
                onChangeText={setYazi}
              />
              <TouchableOpacity style={styles.buton} onPress={veriEkle}>
                <Text style={styles.butonText}>Ekle</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={veriler}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.itemContainer}>
                  <Text style={styles.itemText}>{item.baslik}</Text>
                  <TouchableOpacity onPress={() => veriSil(item.id)}>
                    <Text style={styles.silText}>Sil</Text>
                  </TouchableOpacity>
                </View>
              )}
              ListEmptyComponent={
                <Text style={styles.bosText}>Henüz kayıt eklenmemiş. Yukarıdan yeni kayıt ekleyebilirsin.</Text>
              }
            />
          </View>
        ) : (
          /* --- AYARLAR VE YEDEKLEME SAYFASI --- */
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>Veri Yedekleme ve Taşıma</Text>
            
            <TouchableOpacity style={styles.ayarButton} onPress={verileriDisariAktar}>
              <Text style={styles.ayarButtonText}>📤 Yedeği Başka Telefona Gönder / Paylaş</Text>
            </TouchableOpacity>

            <Text style={styles.aciklama}>Başka telefondan gelen yedek kodunu aşağıya yapıştır:</Text>
            
            <TextInput
              style={styles.textArea}
              placeholder="Yedek kodunu buraya yapıştır..."
              placeholderTextColor="#666"
              value={importMetni}
              onChangeText={setImportMetni}
              multiline
            />

            <TouchableOpacity style={[styles.ayarButton, { backgroundColor: '#444', marginTop: 10 }]} onPress={verileriIceriAktar}>
              <Text style={styles.ayarButtonText}>📥 Yedeği Yükle (Import)</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* ALT MENÜ (TAB BAR) */}
      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tabItem, aktifTab === 'anaSayfa' && styles.aktifTab]} 
          onPress={() => setAktifTab('anaSayfa')}
        >
          <Text style={[styles.tabText, aktifTab === 'anaSayfa' && styles.aktifTabText]}>🏠 Ana Sayfa</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tabItem, aktifTab === 'ayarlar' && styles.aktifTab]} 
          onPress={() => setAktifTab('ayarlar')}
        >
          <Text style={[styles.tabText, aktifTab === 'ayarlar' && styles.aktifTabText]}>⚙️ Ayarlar & Yedek</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  header: {
    marginBottom: 15,
    paddingHorizontal: 4,
  },
  baslik: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8A1C14', // Vişne çürüğü
  },
  content: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    backgroundColor: '#1E1E1E',
    color: '#FFF',
    paddingHorizontal: 15,
    borderRadius: 8,
    height: 50,
    borderWidth: 1,
    borderColor: '#333',
  },
  buton: {
    backgroundColor: '#8A1C14',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    borderRadius: 8,
    marginLeft: 10,
    height: 50,
  },
  butonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  itemContainer: {
    flexDirection: 'row',
    backgroundColor: '#1E1E1E',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  itemText: {
    color: '#FFF',
    fontSize: 16,
    flex: 1,
  },
  silText: {
    color: '#ff5555',
    fontWeight: 'bold',
    marginLeft: 10,
  },
  bosText: {
    color: '#666',
    textAlign: 'center',
    marginTop: 40,
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 15,
  },
  aciklama: {
    color: '#aaa',
    fontSize: 13,
    marginTop: 20,
    marginBottom: 5,
  },
  ayarButton: {
    backgroundColor: '#8A1C14',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  ayarButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  textArea: {
    backgroundColor: '#1E1E1E',
    color: '#FFF',
    padding: 12,
    borderRadius: 8,
    height: 100,
    borderWidth: 1,
    borderColor: '#333',
    textAlignVertical: 'top',
  },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#222',
    paddingVertical: 10,
    backgroundColor: '#121212',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 8,
  },
  aktifTab: {
    backgroundColor: '#1E1E1E',
  },
  tabText: {
    color: '#777',
    fontWeight: 'bold',
    fontSize: 14,
  },
  aktifTabText: {
    color: '#8A1C14',
  },
});
