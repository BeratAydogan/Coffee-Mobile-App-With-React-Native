import React, { useEffect, useState } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, 
  ActivityIndicator, Image, Alert 
} from 'react-native';
import firestore from '@react-native-firebase/firestore';

export default function CartScreen() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false); // Sipariş tamamlama yükleniyor durumu

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('cart')
      .orderBy('createdAt', 'desc')
      .onSnapshot(querySnapshot => {
        const items = [];
        querySnapshot.forEach(doc => {
          items.push({ id: doc.id, ...doc.data() });
        });
        setCartItems(items);
        setLoading(false);
      }, error => {
        console.log('Sepet verisi çekme hatası:', error);
        setLoading(false);
      });

    return () => unsubscribe();
  }, []);

  // Adet güncelleme fonksiyonu
  const updateQuantity = async (item, newQuantity) => {
    if (newQuantity <= 0) {
      // Adet 0 veya altı ise ürünü sil
      try {
        await firestore().collection('cart').doc(item.id).delete();
      } catch (error) {
        console.log('Silme hatası:', error);
      }
      return;
    }
    try {
      // Birim fiyat = toplam fiyat / adet
      const unitPrice = (item.totalPrice || item.basePrice) / (item.quantity || 1);
      await firestore().collection('cart').doc(item.id).update({
        quantity: newQuantity,
        totalPrice: unitPrice * newQuantity,
      });
    } catch (error) {
      console.log('Adet güncelleme hatası:', error);
    }
  };

  const increaseQuantity = (item) => {
    updateQuantity(item, (item.quantity || 1) + 1);
  };

  const decreaseQuantity = (item) => {
    updateQuantity(item, (item.quantity || 1) - 1);
  };

  // Sepetteki toplam fiyatı hesapla
  const getTotalPrice = () => {
    return cartItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
  };

  // Siparişi tamamla fonksiyonu
  const placeOrder = async () => {
    if (cartItems.length === 0) {
      Alert.alert('Sepet boş', 'Lütfen önce sepete ürün ekleyin.');
      return;
    }
    setPlacingOrder(true);
    try {
      // Siparişleri "orders" koleksiyonuna ekle
      await firestore().collection('orders').add({
        items: cartItems,
        totalPrice: getTotalPrice(),
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      // Sepeti temizle
      const batch = firestore().batch();
      cartItems.forEach(item => {
        const ref = firestore().collection('cart').doc(item.id);
        batch.delete(ref);
      });
      await batch.commit();

      Alert.alert('Başarılı', 'Siparişiniz alındı.');
    } catch (error) {
      console.log('Sipariş oluşturma hatası:', error);
      Alert.alert('Hata', 'Sipariş verirken bir hata oluştu.');
    } finally {
      setPlacingOrder(false);
    }
  };

  // Ürün öğesi görünümü
  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      {/* Ürün Resmi */}
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.image} />
      ) : (
        <View style={styles.noImage}><Text>Resim yok</Text></View>
      )}

      <View style={styles.infoContainer}>
        <Text style={styles.itemName}>{item.title} ({item.size})</Text>

        {/* Ürün özellikleri */}
        <Text style={styles.itemDetails}>
          Ekstra Shot: {item.extraShot ? 'Var' : 'Yok'} | 
          Aroma: {item.extraAromaEnabled ? (item.selectedAroma || 'Seçilmedi') : 'Yok'}
        </Text>

        <View style={styles.controls}>
          <TouchableOpacity onPress={() => decreaseQuantity(item)} style={styles.button}>
            <Text style={styles.buttonText}>-</Text>
          </TouchableOpacity>

          <Text style={styles.quantity}>{item.quantity || 1}</Text>

          <TouchableOpacity onPress={() => increaseQuantity(item)} style={styles.button}>
            <Text style={styles.buttonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.price}>{((item.totalPrice) || item.basePrice).toFixed(2)} ₺</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.emptyContainer}>
        <ActivityIndicator size="large" color="#6f4e37" />
      </View>
    );
  }

  if (cartItems.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Sepetiniz şu anda boş.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={cartItems}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 140 }}
      />

      <View style={styles.totalContainer}>
        <Text style={styles.totalText}>Toplam: {getTotalPrice().toFixed(2)} ₺</Text>
        <TouchableOpacity
          style={[styles.orderButton, placingOrder && { opacity: 0.6 }]}
          onPress={placeOrder}
          disabled={placingOrder}
        >
          {placingOrder ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.orderButtonText}>Siparişi Tamamla</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 18, color: '#6f4e37' },

  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginRight: 12,
  },
  noImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    color: '#3e2723',
    fontWeight: '600',
  },
  itemDetails: {
    color: '#5d4037',
    marginVertical: 4,
    fontSize: 14,
  },

  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  button: {
    backgroundColor: '#6f4e37',
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  buttonText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  quantity: {
    marginHorizontal: 8,
    fontSize: 16,
    minWidth: 20,
    textAlign: 'center',
  },

  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4e342e',
    marginLeft: 12,
  },

  totalContainer: {
    borderTopWidth: 1,
    borderColor: '#ddd',
    paddingVertical: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#5d4037',
  },

  orderButton: {
    backgroundColor: '#6f4e37',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  orderButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
