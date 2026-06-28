import React, { useEffect, useState, useRef } from 'react';
import { useNoteStore } from '../../store/noteStore';
import { useVaultStore } from '../../store/vaultStore';
import './NoteWorkspace.css';

export const NoteWorkspace: React.FC = () => {
  const { activeNote, updateNoteLocal, saveNoteRemote, archiveNote, softDeleteNote, isSaving } = useNoteStore();
  const { folders } = useVaultStore();

  const [localTitle, setLocalTitle] = useState('');
  const [localContent, setLocalContent] = useState('');
  
  const saveTimeoutRef = useRef<number | null>(null);

  // Sync editor values when active note swaps
  useEffect(() => {
    if (activeNote) {
      setLocalTitle(activeNote.title);
      setLocalContent(activeNote.content);
    }
  }, [activeNote?.id]);

  // Cleanup pending saves on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        window.clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  if (!activeNote) {
    return null;
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalTitle(val);
    updateNoteLocal(activeNote.id, { title: val });

    if (saveTimeoutRef.current) {
      window.clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = window.setTimeout(() => {
      saveNoteRemote(activeNote.id, { title: val });
    }, 1000);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setLocalContent(val);
    
    // Immediate local count calculations
    const words = val.trim() ? val.trim().split(/\s+/).length : 0;
    updateNoteLocal(activeNote.id, { content: val, word_count: words });

    if (saveTimeoutRef.current) {
      window.clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = window.setTimeout(() => {
      saveNoteRemote(activeNote.id, { content: val });
    }, 1000);
  };

  const handleMoveFolder = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    const destFolderId = val === 'root' ? null : val;
    try {
      await saveNoteRemote(activeNote.id, { folder: destFolderId });
    } catch (err) {
      // Store handles error states
    }
  };

  const handleArchiveClick = async () => {
    try {
      await archiveNote(activeNote.id);
    } catch (err) {
      // Handled
    }
  };

  const handleDeleteClick = async () => {
    if (window.confirm('Move this note to Trash?')) {
      try {
        await softDeleteNote(activeNote.id);
      } catch (err) {
        // Handled
      }
    }
  };

  return (
    <div className="note-workspace-container animate-fade-in">
      {/* Note Header Info & Actions */}
      <header className="note-header">
        <input
          type="text"
          className="note-title-input"
          value={localTitle}
          onChange={handleTitleChange}
          placeholder="Untitled Note"
        />

        <div className="note-actions">
          {/* Folder Mover Dropdown */}
          <select 
            className="note-action-select"
            value={activeNote.folder || 'root'}
            onChange={handleMoveFolder}
          >
            <option value="root">📁 Workspace Root</option>
            {folders.map((f) => (
              <option key={f.id} value={f.id}>
                📁 {f.name}
              </option>
            ))}
          </select>

          <button className="note-action-btn" onClick={handleArchiveClick}>
            📦 Archive
          </button>
          
          <button className="note-action-btn delete" onClick={handleDeleteClick}>
            🗑️ Delete
          </button>
        </div>
      </header>

      {/* Text Editor Area */}
      <div className="note-editor-body">
        <textarea
          className="note-textarea"
          value={localContent}
          onChange={handleContentChange}
          placeholder="Start writing your thoughts here..."
        />
      </div>

      {/* Editor Footer Metrics & Save Logs */}
      <footer className="note-footer">
        <div>
          <span>{activeNote.word_count || 0} words</span>
          <span style={{ margin: '0 8px' }}>|</span>
          <span>{localContent.length} characters</span>
        </div>

        <div className={`save-status ${isSaving ? 'saving' : 'saved'}`}>
          {isSaving ? (
            <>
              <span className="spinner" style={{ width: '12px', height: '12px', borderWidth: '1px' }}></span>
              <span>Saving...</span>
            </>
          ) : (
            <span>✓ All changes saved</span>
          )}
        </div>
      </footer>
    </div>
  );
};
