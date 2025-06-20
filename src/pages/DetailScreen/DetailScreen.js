import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import firebase from '@react-native-firebase/app';

// React Native Firebase Firestore importu
import firestore from '@react-native-firebase/firestore';

export default function DetailScreen({ route }) {
  const { coffee } = route.params;

  const sizes = [
    { label: 'Küçük', priceDiff: 0 },
    { label: 'Orta', priceDiff: 10 },
    { label: 'Büyük', priceDiff: 20 },
  ];

  const EXTRA_PRICE = 10;
  const aromas = ['Vanilya', 'Karamel', 'Fındık'];

  const [selectedSize, setSelectedSize] = useState(sizes[0]);
  const [extraShot, setExtraShot] = useState(false);
  const [extraAromaEnabled, setExtraAromaEnabled] = useState(false);
  const [selectedAroma, setSelectedAroma] = useState(null);

  const basePrice = coffee.price || 90;

  let totalPrice = basePrice + selectedSize.priceDiff;
  if (extraShot) totalPrice += EXTRA_PRICE;
  if (extraAromaEnabled && selectedAroma) totalPrice += EXTRA_PRICE;

  const addToCart = async () => {
    try {
      // Firestore 'cart' koleksiyonuna belge ekleme
      await firestore().collection('cart').add({
        coffeeId: coffee.id || null,
        title: coffee.title,
        size: selectedSize.label,
        basePrice: basePrice,
        extraShot: extraShot,
        extraAromaEnabled: extraAromaEnabled,
        selectedAroma: selectedAroma,
        totalPrice: totalPrice,
        createdAt: firestore.FieldValue.serverTimestamp(),
        image: coffee.image || null,
      });

      Alert.alert(
        'Sepete Eklendi',
        `${coffee.title} - ${selectedSize.label}\nFiyat: ${totalPrice} TL\nEkstra Shot: ${
          extraShot ? 'Evet' : 'Hayır'
        }\nEkstra Aroma: ${
          extraAromaEnabled ? selectedAroma || 'Seçilmedi' : 'Hayır'
        }`
      );
    } catch (error) {
      Alert.alert('Hata', 'Sepete eklenirken hata oluştu.');
      console.error(error);
    }
  };

  return (
    <SafeAreaView style={styles.detailContainer}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.detailTitle}>{coffee.title}</Text>
        {coffee.image && (
          <Image source={{ uri: coffee.image }} style={styles.detailImage} />
        )}

        <Text style={styles.sectionTitle}>Boy Seçimi</Text>
        <View style={styles.optionsRow}>
          {sizes.map((size) => (
            <TouchableOpacity
              key={size.label}
              style={[
                styles.optionButton,
                selectedSize.label === size.label && styles.optionButtonSelected,
              ]}
              onPress={() => setSelectedSize(size)}
            >
              <Text
                style={[
                  styles.optionText,
                  selectedSize.label === size.label && styles.optionTextSelected,
                ]}
              >
                {size.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Ekstralar</Text>
        <View style={styles.optionsRow}>
          <TouchableOpacity
            style={[styles.optionButton, extraShot && styles.optionButtonSelected]}
            onPress={() => setExtraShot(!extraShot)}
          >
            <Text style={[styles.optionText, extraShot && styles.optionTextSelected]}>
              Ekstra Shot (+{EXTRA_PRICE} TL)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.optionButton,
              extraAromaEnabled && styles.optionButtonSelected,
            ]}
            onPress={() => {
              setExtraAromaEnabled(!extraAromaEnabled);
              if (extraAromaEnabled) setSelectedAroma(null);
            }}
          >
            <Text
              style={[
                styles.optionText,
                extraAromaEnabled && styles.optionTextSelected,
              ]}
            >
              Ekstra Aroma (+{EXTRA_PRICE} TL)
            </Text>
          </TouchableOpacity>
        </View>

        {extraAromaEnabled && (
          <View style={[styles.optionsRow, { marginTop: 0 }]}>
            {aromas.map((aroma) => (
              <TouchableOpacity
                key={aroma}
                style={[
                  styles.optionButton,
                  selectedAroma === aroma && styles.optionButtonSelected,
                ]}
                onPress={() => setSelectedAroma(aroma)}
              >
                <Text
                  style={[
                    styles.optionText,
                    selectedAroma === aroma && styles.optionTextSelected,
                  ]}
                >
                  {aroma}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Sabit alt bar */}
      <View style={styles.bottomBar}>
        <Text style={styles.priceText}>Toplam Fiyat: {totalPrice} TL</Text>
        <TouchableOpacity style={styles.addButton} onPress={addToCart}>
          <Text style={styles.addButtonText}>Sepete Ekle</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  detailContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 120,
    alignItems: 'center',
  },
  detailTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  detailImage: {
    width: 250,
    height: 250,
    borderRadius: 15,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  optionButton: {
    borderWidth: 1,
    borderColor: '#6f4e37',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 8,
    marginVertical: 5,
  },
  optionButtonSelected: {
    backgroundColor: '#6f4e37',
  },
  optionText: {
    color: '#6f4e37',
    fontWeight: '600',
  },
  optionTextSelected: {
    color: '#fff',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#ddd',
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  priceText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#6f4e37',
  },
  addButton: {
    backgroundColor: '#6f4e37',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
