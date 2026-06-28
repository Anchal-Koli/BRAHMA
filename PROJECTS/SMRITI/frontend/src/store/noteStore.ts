import { create } from 'zustand';
import { notesApi } from '../api/notes';
import type { Note } from '../api/notes';

interface NoteState {
  notes: Note[];
  activeNote: Note | null;
  loading: boolean;
  isSaving: boolean;
  error: string | null;

  fetchNotes: (filters?: { is_deleted?: boolean; is_archived?: boolean }) => Promise<void>;
  createNote: (title: string, folderId?: string | null) => Promise<Note>;
  updateNoteLocal: (id: string, fields: Partial<Note>) => void;
  saveNoteRemote: (id: string, fields: Partial<Note>) => Promise<void>;
  archiveNote: (id: string) => Promise<void>;
  unarchiveNote: (id: string) => Promise<void>;
  softDeleteNote: (id: string) => Promise<void>;
  restoreNote: (id: string) => Promise<void>;
  deleteNotePermanently: (id: string) => Promise<void>;
  setActiveNote: (note: Note | null) => void;
  clearError: () => void;
}

export const useNoteStore = create<NoteState>((set) => ({
  notes: [],
  activeNote: null,
  loading: false,
  isSaving: false,
  error: null,

  clearError: () => set({ error: null }),

  setActiveNote: (note) => set({ activeNote: note }),

  fetchNotes: async (filters) => {
    set({ loading: true, error: null });
    try {
      const notes = await notesApi.getNotes(filters);
      set({ notes, loading: false });
    } catch (err: any) {
      set({ loading: false, error: 'Failed to fetch notes' });
    }
  },

  createNote: async (title, folderId = null) => {
    set({ loading: true, error: null });
    try {
      const newNote = await notesApi.createNote(title, folderId);
      set((state) => ({
        notes: [newNote, ...state.notes],
        activeNote: newNote,
        loading: false,
      }));
      return newNote;
    } catch (err: any) {
      set({ loading: false, error: 'Failed to create note' });
      throw err;
    }
  },

  updateNoteLocal: (id, fields) => {
    set((state) => {
      const updatedNotes = state.notes.map((n) => (n.id === id ? { ...n, ...fields } : n));
      const active = state.activeNote && state.activeNote.id === id 
        ? { ...state.activeNote, ...fields } 
        : state.activeNote;
      return { notes: updatedNotes, activeNote: active };
    });
  },

  saveNoteRemote: async (id, fields) => {
    set({ isSaving: true, error: null });
    try {
      const updatedNote = await notesApi.updateNote(id, fields);
      set((state) => {
        const updatedNotes = state.notes.map((n) => (n.id === id ? updatedNote : n));
        const active = state.activeNote && state.activeNote.id === id ? updatedNote : state.activeNote;
        return { notes: updatedNotes, activeNote: active, isSaving: false };
      });
    } catch (err: any) {
      set({ isSaving: false, error: 'Failed to save note changes' });
      throw err;
    }
  },

  archiveNote: async (id) => {
    set({ loading: true, error: null });
    try {
      await notesApi.archiveNote(id);
      set((state) => ({
        notes: state.notes.filter((n) => n.id !== id),
        activeNote: state.activeNote?.id === id ? null : state.activeNote,
        loading: false,
      }));
    } catch (err: any) {
      set({ loading: false, error: 'Failed to archive note' });
      throw err;
    }
  },

  unarchiveNote: async (id) => {
    set({ loading: true, error: null });
    try {
      await notesApi.unarchiveNote(id);
      set((state) => ({
        notes: state.notes.filter((n) => n.id !== id),
        activeNote: state.activeNote?.id === id ? null : state.activeNote,
        loading: false,
      }));
    } catch (err: any) {
      set({ loading: false, error: 'Failed to unarchive note' });
      throw err;
    }
  },

  softDeleteNote: async (id) => {
    set({ loading: true, error: null });
    try {
      await notesApi.softDeleteNote(id);
      set((state) => ({
        notes: state.notes.filter((n) => n.id !== id),
        activeNote: state.activeNote?.id === id ? null : state.activeNote,
        loading: false,
      }));
    } catch (err: any) {
      set({ loading: false, error: 'Failed to move note to trash' });
      throw err;
    }
  },

  restoreNote: async (id) => {
    set({ loading: true, error: null });
    try {
      await notesApi.restoreNote(id);
      set((state) => ({
        notes: state.notes.filter((n) => n.id !== id),
        activeNote: state.activeNote?.id === id ? null : state.activeNote,
        loading: false,
      }));
    } catch (err: any) {
      set({ loading: false, error: 'Failed to restore note' });
      throw err;
    }
  },

  deleteNotePermanently: async (id) => {
    set({ loading: true, error: null });
    try {
      await notesApi.deleteNote(id);
      set((state) => ({
        notes: state.notes.filter((n) => n.id !== id),
        activeNote: state.activeNote?.id === id ? null : state.activeNote,
        loading: false,
      }));
    } catch (err: any) {
      set({ loading: false, error: 'Failed to delete note permanently' });
      throw err;
    }
  },
}));
