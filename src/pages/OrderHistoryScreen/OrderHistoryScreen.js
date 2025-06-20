import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import firestore from '@react-native-firebase/firestore';

export default function OrderHistoryScreen() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('orders')
      .orderBy('createdAt', 'desc')
      .onSnapshot(snapshot => {
        const data = [];
        snapshot.forEach(doc => {
          data.push({ id: doc.id, ...doc.data() });
        });
        setOrders(data);
        setLoading(false);
      }, error => {
        console.log('Siparişler çekilemedi:', error);
        setLoading(false);
      });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6f4e37" />
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={{ fontSize: 18, color: '#6f4e37' }}>Geçmiş sipariş bulunmamaktadır.</Text>
      </View>
    );
  }

  const renderOrderItem = ({ item }) => {
    return (
      <View style={styles.orderContainer}>
        <Text style={styles.orderDate}>
          {item.createdAt?.toDate ? item.createdAt.toDate().toLocaleString() : 'Tarih yok'}
        </Text>

        <FlatList
          data={item.items}
          keyExtractor={(i, index) => i.id ? i.id : index.toString()}
          renderItem={({ item: coffee }) => (
            <View style={styles.coffeeItem}>
              <Text style={styles.coffeeTitle}>
                {coffee.title} ({coffee.size}) x{coffee.quantity || 1}
              </Text>
              <Text style={styles.coffeeDetails}>
                Ekstra Shot: {coffee.extraShot ? 'Var' : 'Yok'} | Aroma: {coffee.extraAromaEnabled ? (coffee.selectedAroma || 'Seçilmedi') : 'Yok'}
              </Text>
              <Text style={styles.coffeePrice}>
                Fiyat: {((coffee.totalPrice) || coffee.basePrice)?.toFixed(2)} ₺
              </Text>
            </View>
          )}
        />
        <Text style={styles.totalPrice}>Toplam: {item.totalPrice?.toFixed(2)} ₺</Text>
      </View>
    );
  };

  return (
    <FlatList
      data={orders}
      keyExtractor={item => item.id}
      renderItem={renderOrderItem}
      contentContainerStyle={{ padding: 16 }}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  orderContainer: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#6f4e37',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#fff',
  },
  orderDate: {
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 10,
    color: '#4e342e',
  },
  coffeeItem: {
    marginBottom: 10,
    paddingLeft: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#6f4e37',
  },
  coffeeTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#3e2723',
  },
  coffeeDetails: {
    fontSize: 13,
    color: '#5d4037',
  },
  coffeePrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4e342e',
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6f4e37',
    marginTop: 8,
    textAlign: 'right',
  },
});
