import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, Alert, Share, Modal, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  const [veriler, setVeriler] = useState([]);
  const [yazi, setYazi] = useState('');
  const [modalGorunur, setModalGorunur] = useState(false);
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

  // Verileri Dışa Aktar (Export)
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

  // Verileri İçe Aktar (Import)
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
        setModalGorunur(false);
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
      
      {/* Üst Başlık ve Ayarlar/Yedek Butonu */}
      <View style={styles.header}>
        <Text style={styles.baslik}>PATRON YÖNETİM</Text>
        <TouchableOpacity style={styles.ayarButon} onPress={() => setModalGorunur(true)}>
          <Text style={styles.ayarButonText}>⚙️ Yedekle</Text>
        </TouchableOpacity>
      </View>

      {/* Ana Veri Ekleme Alanı */}
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

      {/* Kayıt Listesi */}
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

      {/* Yedekleme ve Taşıma Paneli (Modal) */}
      <Modal visible={modalGorunur} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalBaslik}>Veri Yedekleme ve Taşıma</Text>
            
            <TouchableOpacity style={styles.modalButton} onPress={verileriDisariAktar}>
              <Text style={styles.modalButtonText}>📤 Yedeği Başka Telefona Gönder / Paylaş</Text>
            </TouchableOpacity>

            <Text style={styles.modalAciklama}>Başka telefondan gelen yedek kodunu aşağıya yapıştır:</Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder="Yedek kodunu buraya yapıştır..."
              placeholderTextColor="#666"
              value={importMetni}
              onChangeText={setImportMetni}
              multiline
            />

            <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#444', marginTop: 10 }]} onPress={verileriIceriAktar}>
              <Text style={styles.modalButtonText}>📥 Yedeği Yükle (Import)</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.kapatButton} onPress={() => setModalGorunur(false)}>
              <Text style={styles.kapatButtonText}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  baslik: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#8A1C14', // Vişne çürüğü
  },
  ayarButon: {
    backgroundColor: '#1E1E1E',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  ayarButonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  modalBaslik: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalAciklama: {
    color: '#aaa',
    fontSize: 13,
    marginTop: 15,
    marginBottom: 5,
  },
  modalButton: {
    backgroundColor: '#8A1C14',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  modalInput: {
    backgroundColor: '#121212',
    color: '#FFF',
    padding: 10,
    borderRadius: 8,
    height: 80,
    borderWidth: 1,
    borderColor: '#333',
    textAlignVertical: 'top',
  },
  kapatButton: {
    marginTop: 15,
    padding: 10,
    alignItems: 'center',
  },
  kapatButtonText: {
    color: '#888',
    fontWeight: 'bold',
  },
});
