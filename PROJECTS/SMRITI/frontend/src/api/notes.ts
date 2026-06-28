import { client } from './client';

export interface Note {
  id: string;
  folder: string | null;
  title: string;
  content: string;
  is_archived: boolean;
  is_deleted: boolean;
  word_count: number;
  created_at: string;
  updated_at: string;
  tags: string[];
}

export const notesApi = {
  getNotes: async (filters?: { is_deleted?: boolean; is_archived?: boolean }): Promise<Note[]> => {
    const params = {
      is_deleted: filters?.is_deleted ? 'true' : 'false',
      is_archived: filters?.is_archived ? 'true' : 'false',
    };
    const response = await client.get('vault/notes/', { params });
    return response.data;
  },

  createNote: async (title: string, folderId: string | null = null): Promise<Note> => {
    const response = await client.post('vault/notes/', {
      title,
      content: '',
      folder: folderId,
    });
    return response.data;
  },

  updateNote: async (id: string, payload: Partial<Note>): Promise<Note> => {
    const response = await client.patch(`vault/notes/${id}/`, payload);
    return response.data;
  },

  archiveNote: async (id: string): Promise<void> => {
    await client.post(`vault/notes/${id}/archive/`);
  },

  unarchiveNote: async (id: string): Promise<void> => {
    await client.post(`vault/notes/${id}/unarchive/`);
  },

  softDeleteNote: async (id: string): Promise<void> => {
    await client.post(`vault/notes/${id}/soft_delete/`);
  },

  restoreNote: async (id: string): Promise<void> => {
    await client.post(`vault/notes/${id}/restore/`);
  },

  deleteNote: async (id: string): Promise<void> => {
    await client.delete(`vault/notes/${id}/`);
  },
};
