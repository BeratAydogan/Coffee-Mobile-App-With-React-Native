import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
} from 'react-native';

const PRICE = 90;

export default function HomeScreen({ navigation }) {
  const [hotData, setHotData] = useState([]);
  const [coldData, setColdData] = useState([]);
  const [selectedType, setSelectedType] = useState('hot');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getAllData = async () => {
      try {
        const [hotResp, coldResp] = await Promise.all([
          fetch('https://api.sampleapis.com/coffee/hot'),
          fetch('https://api.sampleapis.com/coffee/iced'),
        ]);
        const hot = await hotResp.json();
        const cold = await coldResp.json();
        setHotData(hot);
        setColdData(cold);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    getAllData();
  }, []);

  const renderCoffeeItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('Detail', { coffee: item })}
    >
      {item.image && <Image source={{ uri: item.image }} style={styles.image} />}
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.price}>{PRICE} TL</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#6f4e37" />
      </View>
    );
  }

  const selectedData = selectedType === 'hot' ? hotData : coldData;
  const filteredData = selectedData.filter((item) =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safe}>


      <View style={styles.container}>
        <TextInput
          style={styles.searchInput}
          placeholder="Kahve ara..."
          placeholderTextColor="#aaa"
          value={searchTerm}
          onChangeText={setSearchTerm}
        />

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.button,
              selectedType === 'hot' && styles.activeButton,
            ]}
            onPress={() => setSelectedType('hot')}
          >
            <Text
              style={[
                styles.buttonText,
                selectedType === 'hot' && styles.activeButtonText,
              ]}
            >
              ☕ Sıcak
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              selectedType === 'cold' && styles.activeButton,
            ]}
            onPress={() => setSelectedType('cold')}
          >
            <Text
              style={[
                styles.buttonText,
                selectedType === 'cold' && styles.activeButtonText,
              ]}
            >
              🧊 Soğuk
            </Text>
          </TouchableOpacity>
        </View>

        {filteredData.length > 0 ? (
          <FlatList
            data={filteredData}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            renderItem={renderCoffeeItem}
            columnWrapperStyle={styles.row}
            contentContainerStyle={{ paddingBottom: 24 }}
          />
        ) : (
          <Text style={{ textAlign: 'center', marginTop: 20, color: '#999' }}>
            Aradığınız kahve bulunamadı.
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingVertical: 20,
    backgroundColor: '#6f4e37',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  container: {
    padding: 16,
    flex: 1,
    backgroundColor: '#fff',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 12,
    fontSize: 16,
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#6f4e37',
    backgroundColor: '#fff',
  },
  activeButton: {
    backgroundColor: '#6f4e37',
  },
  buttonText: {
    color: '#6f4e37',
    fontWeight: 'bold',
  },
  activeButtonText: {
    color: '#fff',
  },
  row: {
    justifyContent: 'space-between',
  },
  card: {
    flex: 1,
    marginBottom: 16,
    backgroundColor: '#fce6d0',
    borderRadius: 10,
    padding: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
    borderRadius: 8,
    marginBottom: 8,
  },
  cardTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },
  price: {
    marginTop: 4,
    fontWeight: '600',
    color: '#6f4e37',
  },
});
