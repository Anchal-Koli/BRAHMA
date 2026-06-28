import { client } from './client';

export interface Folder {
  id: string;
  name: string;
  parent: string | null;
  created_at: string;
}

export const foldersApi = {
  getFolders: async (): Promise<Folder[]> => {
    const response = await client.get('vault/folders/');
    return response.data;
  },

  createFolder: async (name: string, parentId: string | null = null): Promise<Folder> => {
    const response = await client.post('vault/folders/', { name, parent: parentId });
    return response.data;
  },

  renameFolder: async (id: string, name: string): Promise<Folder> => {
    const response = await client.patch(`vault/folders/${id}/`, { name });
    return response.data;
  },

  deleteFolder: async (id: string): Promise<void> => {
    await client.delete(`vault/folders/${id}/`);
  },
};
