export interface Collection {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  documents: Document[];
}

export interface Document {
  id: string;
  name: string;
  uri: string;
  type: string;
  size: number;
  createdAt: Date;
  collectionId: string;
}

export interface Query {
  id: string;
  text: string;
  response?: string;
  createdAt: Date;
  documentId: string;
} 