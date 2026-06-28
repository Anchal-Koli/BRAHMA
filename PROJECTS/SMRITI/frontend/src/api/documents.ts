import { client } from './client';

export interface Document {
  id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  created_at: string;
}

export const documentsApi = {
  getDocuments: async (): Promise<Document[]> => {
    const response = await client.get('vault/documents/');
    return response.data;
  },

  uploadDocument: async (
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<Document> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await client.post('vault/documents/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      },
    });
    return response.data;
  },

  renameDocument: async (id: string, name: string): Promise<Document> => {
    const response = await client.patch(`vault/documents/${id}/`, { file_name: name });
    return response.data;
  },

  deleteDocument: async (id: string): Promise<void> => {
    await client.delete(`vault/documents/${id}/`);
  },
};
