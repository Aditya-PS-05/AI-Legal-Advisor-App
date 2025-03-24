import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Text, FAB, Portal, Modal, Button, List, TextInput } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import { Collection } from '../../types';
import { useAuth } from '../../hooks/useAuth';

interface Document {
  id: string;
  name: string;
  uri: string;
  type: string;
  size: number;
  createdAt: Date;
  collectionId: string;
}

export default function CollectionDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [visible, setVisible] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [queryText, setQueryText] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }
    loadCollection();
  }, [id, isAuthenticated]);

  const loadCollection = async () => {
    try {
      const storedCollections = await AsyncStorage.getItem('collections');
      if (storedCollections) {
        const collections: Collection[] = JSON.parse(storedCollections);
        const found = collections.find(c => c.id === id);
        if (found) {
          setCollection(found);
        } else {
          router.back();
        }
      }
    } catch (error) {
      console.error('Error loading collection:', error);
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      });

      if (!result.assets || !result.assets[0]) {
        return; // User cancelled or no document selected
      }

      const asset = result.assets[0];
      const newDocument: Document = {
        id: Date.now().toString(),
        name: asset.name,
        uri: asset.uri,
        type: asset.mimeType || 'application/pdf',
        size: asset.size || 0,
        createdAt: new Date(),
        collectionId: id as string,
      };

      if (collection) {
        const updatedDocuments = [...collection.documents, newDocument];
        const updatedCollection = { ...collection, documents: updatedDocuments };
        setCollection(updatedCollection);
        await saveDocuments(updatedDocuments);
      }
    } catch (err) {
      console.error('Error picking document:', err);
    }
  };

  const saveDocuments = async (updatedDocuments: Document[]) => {
    try {
      const storedCollections = await AsyncStorage.getItem('collections');
      if (storedCollections) {
        const collections = JSON.parse(storedCollections);
        const updatedCollections = collections.map((c: Collection) =>
          c.id === id
            ? { ...c, documents: updatedDocuments, updatedAt: new Date() }
            : c
        );
        await AsyncStorage.setItem('collections', JSON.stringify(updatedCollections));
      }
    } catch (error) {
      console.error('Error saving documents:', error);
    }
  };

  const handleQuery = async () => {
    if (!queryText.trim() || !selectedDocument) return;

    // TODO: Implement query processing with backend
    const mockResponse = "This is a mock response. In the actual implementation, this will be processed by the backend.";
    
    setQueryText('');
    setVisible(false);
  };

  return (
    <View style={styles.container}>
      {collection ? (
        <>
          <View style={styles.header}>
            <Text variant="headlineMedium">{collection.name}</Text>
            {collection.description && (
              <Text variant="bodyMedium" style={styles.description}>
                {collection.description}
              </Text>
            )}
          </View>
          <List.Section>
            <List.Subheader>Documents</List.Subheader>
            {collection.documents.map((doc, index) => (
              <List.Item
                key={index}
                title={doc.name}
                description={`Added ${new Date(doc.createdAt).toLocaleDateString()}`}
                left={props => <List.Icon {...props} icon="file-document" />}
                onPress={() => {
                  setSelectedDocument(doc.id);
                  setVisible(true);
                }}
              />
            ))}
          </List.Section>
          <FAB
            icon="plus"
            style={styles.fab}
            onPress={pickDocument}
          />
        </>
      ) : (
        <View style={styles.loading}>
          <Text>Loading...</Text>
        </View>
      )}
      <Portal>
        <Modal
          visible={visible}
          onDismiss={() => setVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <View>
            <Text variant="titleLarge" style={styles.modalTitle}>
              Query Document: {selectedDocument}
            </Text>
            <TextInput
              mode="outlined"
              label="Your Question"
              value={queryText}
              onChangeText={setQueryText}
              multiline
              numberOfLines={4}
              style={styles.input}
            />
            <Button mode="contained" onPress={handleQuery} style={styles.button}>
              Submit Query
            </Button>
          </View>
        </Modal>
      </Portal>
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
  description: {
    marginTop: 8,
    opacity: 0.7,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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