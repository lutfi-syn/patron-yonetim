import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, SafeAreaStorage } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  const [veriler, setVeriler] = useState([]);
  const [yazi, setYazi] = useState('');

  // 1. Uygulama açıldığında telefon hafızasındaki kayıtlı verileri yükle
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
      console.log('Veri yüklenirken hata oluştu:', hata);
    }
  };

  // 2. Yeni veri ekleyip hem hafızaya hem telefona kalıcı kaydet
  const veriEkle = async () => {
    if (yazi.trim() === '') return;
    
    const yeniListe = [...veriler, { id: Date.now().toString(), baslik: yazi }];
    setVeriler(yeniListe);
    setYazi('');

    try {
      await AsyncStorage.setItem('@patron_veriler', JSON.stringify(yeniListe));
    } catch (hata) {
      console.log('Veri kaydedilirken hata oluştu:', hata);
    }
  };

  // 3. Veriyi silip listeyi güncelle
  const veriSil = async (id) => {
    const yeniListe = veriler.filter((item) => item.id !== id);
    setVeriler(yeniListe);

    try {
      await AsyncStorage.setItem('@patron_veriler', JSON.stringify(yeniListe));
    } catch (hata) {
      console.log('Veri silinirken hata oluştu:', hata);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Text style={styles.baslik}>PATRON YÖNETİM</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Yeni kayıt veya not ekle..."
          placeholderTextColor="#888"
          value={yazi}
          onChangeText={setYazi}
        />
        <TouchableOpacity style={styles.buton} onPress={veriEkle}>
          <Text style={styles.butonText}>Kaydet</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  baslik: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8A1C14', // Vişne çürüğü kurumsal renk
    textAlign: 'center',
    marginBottom: 20,
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
});
