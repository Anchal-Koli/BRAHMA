import { create } from 'zustand';
import { foldersApi } from '../api/folders';
import { documentsApi } from '../api/documents';
import type { Folder } from '../api/folders';
import type { Document } from '../api/documents';

interface VaultState {
  folders: Folder[];
  documents: Document[];
  currentFolderId: string | null;
  loading: boolean;
  error: string | null;
  uploadProgress: Record<string, number>; // filename -> percentage

  fetchFolders: () => Promise<void>;
  createFolder: (name: string, parentId?: string | null) => Promise<void>;
  renameFolder: (id: string, name: string) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;
  setCurrentFolderId: (id: string | null) => void;
  
  fetchDocuments: () => Promise<void>;
  uploadDocument: (file: File) => Promise<void>;
  renameDocument: (id: string, name: string) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  
  clearError: () => void;
}

export const useVaultStore = create<VaultState>((set) => ({
  folders: [],
  documents: [],
  currentFolderId: null,
  loading: false,
  error: null,
  uploadProgress: {},

  clearError: () => set({ error: null }),

  setCurrentFolderId: (id) => set({ currentFolderId: id }),

  fetchFolders: async () => {
    set({ loading: true, error: null });
    try {
      const folders = await foldersApi.getFolders();
      set({ folders, loading: false });
    } catch (err: any) {
      set({ loading: false, error: err.response?.data?.detail || 'Failed to fetch folders' });
    }
  },

  createFolder: async (name, parentId = null) => {
    set({ loading: true, error: null });
    try {
      const newFolder = await foldersApi.createFolder(name, parentId);
      set((state) => ({
        folders: [...state.folders, newFolder],
        loading: false,
      }));
    } catch (err: any) {
      set({ loading: false, error: err.response?.data?.name?.[0] || 'Failed to create folder' });
      throw err;
    }
  },

  renameFolder: async (id, name) => {
    set({ loading: true, error: null });
    try {
      const updated = await foldersApi.renameFolder(id, name);
      set((state) => ({
        folders: state.folders.map((f) => (f.id === id ? updated : f)),
        loading: false,
      }));
    } catch (err: any) {
      set({ loading: false, error: err.response?.data?.name?.[0] || 'Failed to rename folder' });
      throw err;
    }
  },

  deleteFolder: async (id) => {
    set({ loading: true, error: null });
    try {
      await foldersApi.deleteFolder(id);
      set((state) => ({
        folders: state.folders.filter((f) => f.id !== id),
        currentFolderId: state.currentFolderId === id ? null : state.currentFolderId,
        loading: false,
      }));
    } catch (err: any) {
      set({ loading: false, error: 'Failed to delete folder' });
      throw err;
    }
  },

  fetchDocuments: async () => {
    set({ loading: true, error: null });
    try {
      const docs = await documentsApi.getDocuments();
      set({ documents: docs, loading: false });
    } catch (err: any) {
      set({ loading: false, error: 'Failed to fetch documents' });
    }
  },

  uploadDocument: async (file: File) => {
    set({ error: null });
    const filename = file.name;
    
    // Check local file size constraint (20MB)
    const max_size = 20 * 1024 * 1024;
    if (file.size > max_size) {
      set({ error: `File "${filename}" exceeds 20MB upload size limit.` });
      throw new Error('File size limit exceeded');
    }

    try {
      set((state) => ({
        uploadProgress: { ...state.uploadProgress, [filename]: 0 },
      }));

      const newDoc = await documentsApi.uploadDocument(file, (progress) => {
        set((state) => ({
          uploadProgress: { ...state.uploadProgress, [filename]: progress },
        }));
      });

      set((state) => {
        const cleanedProgress = { ...state.uploadProgress };
        delete cleanedProgress[filename];
        return {
          documents: [newDoc, ...state.documents],
          uploadProgress: cleanedProgress,
        };
      });
    } catch (err: any) {
      set((state) => {
        const cleanedProgress = { ...state.uploadProgress };
        delete cleanedProgress[filename];
        return {
          uploadProgress: cleanedProgress,
          error: err.response?.data?.file || `Failed to upload "${filename}"`,
        };
      });
      throw err;
    }
  },

  renameDocument: async (id, name) => {
    set({ loading: true, error: null });
    try {
      const updated = await documentsApi.renameDocument(id, name);
      set((state) => ({
        documents: state.documents.map((d) => (d.id === id ? updated : d)),
        loading: false,
      }));
    } catch (err: any) {
      set({ loading: false, error: 'Failed to rename document' });
      throw err;
    }
  },

  deleteDocument: async (id) => {
    set({ loading: true, error: null });
    try {
      await documentsApi.deleteDocument(id);
      set((state) => ({
        documents: state.documents.filter((d) => d.id !== id),
        loading: false,
      }));
    } catch (err: any) {
      set({ loading: false, error: 'Failed to delete document' });
      throw err;
    }
  },
}));
