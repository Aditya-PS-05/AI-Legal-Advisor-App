import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { FAB, Card, Text, Portal, Modal, Button, TextInput } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Collection } from '../types';
import { router, Redirect } from 'expo-router';
import { useAuth } from '../hooks/useAuth';

export default function CollectionsScreen() {
  const { isAuthenticated, user } = useAuth();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [visible, setVisible] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDescription, setNewCollectionDescription] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      loadCollections();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  const loadCollections = async () => {
    try {
      const storedCollections = await AsyncStorage.getItem('collections');
      if (storedCollections) {
        setCollections(JSON.parse(storedCollections));
      }
    } catch (error) {
      console.error('Error loading collections:', error);
    }
  };

  const saveCollections = async (updatedCollections: Collection[]) => {
    try {
      await AsyncStorage.setItem('collections', JSON.stringify(updatedCollections));
      setCollections(updatedCollections);
    } catch (error) {
      console.error('Error saving collections:', error);
    }
  };

  const createCollection = () => {
    if (!newCollectionName.trim()) return;

    const newCollection: Collection = {
      id: Date.now().toString(),
      name: newCollectionName,
      description: newCollectionDescription,
      createdAt: new Date(),
      updatedAt: new Date(),
      documents: [],
    };

    const updatedCollections = [...collections, newCollection];
    saveCollections(updatedCollections);
    setVisible(false);
    setNewCollectionName('');
    setNewCollectionDescription('');
  };

  const renderCollection = ({ item }: { item: Collection }) => (
    <Card
      style={styles.card}
      onPress={() => router.push(`/collection/${item.id}`)}
    >
      <Card.Content>
        <Text variant="titleLarge">{item.name}</Text>
        {item.description && <Text variant="bodyMedium">{item.description}</Text>}
        <Text variant="bodySmall">
          {item.documents.length} documents • Created {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineSmall">Welcome, {user?.name || 'User'}</Text>
      </View>
      <FlatList
        data={collections}
        renderItem={renderCollection}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
      <Portal>
        <Modal
          visible={visible}
          onDismiss={() => setVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <View>
            <Text variant="titleLarge" style={styles.modalTitle}>New Collection</Text>
            <TextInput
              mode="outlined"
              label="Collection Name"
              value={newCollectionName}
              onChangeText={setNewCollectionName}
              style={styles.input}
            />
            <TextInput
              mode="outlined"
              label="Description (optional)"
              value={newCollectionDescription}
              onChangeText={setNewCollectionDescription}
              style={styles.input}
            />
            <Button mode="contained" onPress={createCollection} style={styles.button}>
              Create Collection
            </Button>
          </View>
        </Modal>
      </Portal>
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setVisible(true)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  list: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  modalTitle: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
});
