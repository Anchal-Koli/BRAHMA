import { create } from 'zustand';
import { foldersApi } from '../api/folders';
import type { Folder } from '../api/folders';

interface VaultState {
  folders: Folder[];
  currentFolderId: string | null;
  loading: boolean;
  error: string | null;

  fetchFolders: () => Promise<void>;
  createFolder: (name: string, parentId?: string | null) => Promise<void>;
  renameFolder: (id: string, name: string) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;
  setCurrentFolderId: (id: string | null) => void;
  clearError: () => void;
}

export const useVaultStore = create<VaultState>((set) => ({
  folders: [],
  currentFolderId: null,
  loading: false,
  error: null,

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
}));
