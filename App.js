import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, Alert, Share } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';

export default function App() {
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

  // 1. VERİLERİ DIŞA AKTAR (Export & E-posta / Paylaş)
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

  // 2. VERİLERİ İÇE AKTAR (Import)
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
    <View style={styles.container}>
      <StatusBar style="light" />
      <Text style={styles.baslik}>PATRON YÖNETİM</Text>

      {/* Veri Paylaşım ve Yükleme Butonları */}
      <View style={styles.syncContainer}>
        <TouchableOpacity style={styles.syncButton} onPress={verileriDisariAktar}>
          <Text style={styles.syncButtonText}>Yedeği Paylaş / Gönder</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Yeni kayıt ekle..."
          placeholderTextColor="#888"
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
      />

      {/* İçe Aktarma Alanı */}
      <View style={styles.importBox}>
        <TextInput
          style={styles.input}
          placeholder="Başka telefondan gelen yedek kodunu buraya yapıştır..."
          placeholderTextColor="#666"
          value={importMetni}
          onChangeText={setImportMetni}
        />
        <TouchableOpacity style={[styles.buton, { backgroundColor: '#444', marginTop: 8 }]} onPress={verileriIceriAktar}>
          <Text style={styles.butonText}>Yedeği Yükle (Import)</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  baslik: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#8A1C14', // Vişne çürüğü
    textAlign: 'center',
    marginBottom: 10,
  },
  syncContainer: {
    marginBottom: 15,
  },
  syncButton: {
    backgroundColor: '#8A1C14',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  syncButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  input: {
    flex: 1,
    backgroundColor: '#1E1E1E',
    color: '#FFF',
    paddingHorizontal: 12,
    borderRadius: 8,
    height: 45,
    borderWidth: 1,
    borderColor: '#333',
  },
  buton: {
    backgroundColor: '#8A1C14',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 15,
    borderRadius: 8,
    marginLeft: 8,
    height: 45,
  },
  butonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  itemContainer: {
    flexDirection: 'row',
    backgroundColor: '#1E1E1E',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  itemText: {
    color: '#FFF',
    fontSize: 15,
    flex: 1,
  },
  silText: {
    color: '#ff5555',
    fontWeight: 'bold',
    marginLeft: 10,
  },
  importBox: {
    marginTop: 10,
    marginBottom: 30,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#222',
  },
});
