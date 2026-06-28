import React, { useEffect, useState } from 'react';
import { useVaultStore } from '../../store/vaultStore';
import { useNoteStore } from '../../store/noteStore';
import type { Folder } from '../../api/folders';
import type { Note } from '../../api/notes';
import './FolderTree.css';

interface FolderNodeProps {
  folder: Folder;
  allFolders: Folder[];
  allNotes: Note[];
  depth: number;
}

const FolderNode: React.FC<FolderNodeProps> = ({ folder, allFolders, allNotes, depth }) => {
  const { currentFolderId, setCurrentFolderId, renameFolder, deleteFolder, createFolder } = useVaultStore();
  const { activeNote, setActiveNote, createNote } = useNoteStore();
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(folder.name);
  
  const [isCreatingSub, setIsCreatingSub] = useState(false);
  const [subFolderName, setSubFolderName] = useState('');

  const childrenFolders = allFolders.filter((f) => f.parent === folder.id);
  const childrenNotes = allNotes.filter((n) => n.folder === folder.id);
  
  const hasChildren = childrenFolders.length > 0 || childrenNotes.length > 0;
  const isSelected = currentFolderId === folder.id;

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentFolderId(folder.id);
    setIsExpanded(!isExpanded);
  };

  const handleRenameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || newName === folder.name) {
      setIsEditing(false);
      return;
    }
    try {
      await renameFolder(folder.id, newName.trim());
      setIsEditing(false);
    } catch (err) {
      setNewName(folder.name);
    }
  };

  const handleCreateSubSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subFolderName.trim()) {
      setIsCreatingSub(false);
      return;
    }
    try {
      await createFolder(subFolderName.trim(), folder.id);
      setSubFolderName('');
      setIsCreatingSub(false);
      setIsExpanded(true);
    } catch (err) {
      // Handled by store
    }
  };

  const handleCreateNoteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await createNote('Untitled Note', folder.id);
      setIsExpanded(true);
    } catch (err) {
      // Handled by store
    }
  };

  const handleDeleteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete folder "${folder.name}"? This will delete all subfolders and notes.`)) {
      try {
        await deleteFolder(folder.id);
      } catch (err) {
        // Handled by store
      }
    }
  };

  return (
    <div className="folder-node-wrapper">
      <div 
        className={`folder-node-row ${isSelected ? 'selected' : ''}`}
        onClick={handleSelect}
      >
        <div className="folder-node-left">
          <span 
            className={`folder-arrow ${isExpanded ? 'expanded' : ''}`}
            style={{ visibility: hasChildren ? 'visible' : 'hidden' }}
          >
            ▶
          </span>
          <span className="folder-icon">📁</span>
          
          {isEditing ? (
            <form onSubmit={handleRenameSubmit} onClick={(e) => e.stopPropagation()} style={{ flex: 1 }}>
              <input
                type="text"
                className="folder-inline-input"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onBlur={handleRenameSubmit}
                autoFocus
                required
              />
            </form>
          ) : (
            <span className="folder-name">{folder.name}</span>
          )}
        </div>

        {!isEditing && (
          <div className="folder-node-actions" onClick={(e) => e.stopPropagation()}>
            <button 
              className="action-btn" 
              onClick={() => setIsCreatingSub(true)}
              title="New Subfolder"
            >
              +📁
            </button>
            <button 
              className="action-btn" 
              onClick={handleCreateNoteClick}
              title="New Note"
            >
              +📄
            </button>
            <button 
              className="action-btn" 
              onClick={() => setIsEditing(true)}
              title="Rename"
            >
              ✏️
            </button>
            <button 
              className="action-btn delete" 
              onClick={handleDeleteClick}
              title="Delete"
            >
              🗑️
            </button>
          </div>
        )}
      </div>

      {/* Inline Subfolder creation form */}
      {isCreatingSub && (
        <div style={{ paddingLeft: '24px', margin: '4px 0' }}>
          <form onSubmit={handleCreateSubSubmit}>
            <input
              type="text"
              className="folder-inline-input"
              placeholder="Subfolder name..."
              value={subFolderName}
              onChange={(e) => setSubFolderName(e.target.value)}
              onBlur={handleCreateSubSubmit}
              autoFocus
              required
            />
          </form>
        </div>
      )}

      {/* Subfolders and Notes list */}
      {isExpanded && hasChildren && (
        <div className="folder-children">
          {childrenFolders.map((child) => (
            <FolderNode
              key={child.id}
              folder={child}
              allFolders={allFolders}
              allNotes={allNotes}
              depth={depth + 1}
            />
          ))}
          {childrenNotes.map((note) => (
            <div
              key={note.id}
              className={`note-node-row ${activeNote?.id === note.id ? 'selected' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                setActiveNote(note);
              }}
            >
              <span className="note-icon">📄</span>
              <span className="note-name">{note.title || 'Untitled Note'}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const FolderTree: React.FC = () => {
  const { folders, fetchFolders, createFolder, error, clearError } = useVaultStore();
  const { notes, fetchNotes, createNote, activeNote, setActiveNote } = useNoteStore();
  
  const [isCreatingRoot, setIsCreatingRoot] = useState(false);
  const [rootName, setRootName] = useState('');

  useEffect(() => {
    fetchFolders();
    fetchNotes();
  }, [fetchFolders, fetchNotes]);

  const handleCreateRootSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rootName.trim()) {
      setIsCreatingRoot(false);
      return;
    }
    try {
      await createFolder(rootName.trim(), null);
      setRootName('');
      setIsCreatingRoot(false);
    } catch (err) {
      // Handled by store
    }
  };

  const handleCreateRootNote = async () => {
    try {
      await createNote('Untitled Note', null);
    } catch (err) {
      // Handled by store
    }
  };

  const rootFolders = folders.filter((f) => f.parent === null);
  const rootNotes = notes.filter((n) => n.folder === null);

  return (
    <div className="folder-tree-container">
      <div className="folder-tree-header">
        <span className="sidebar-title" style={{ marginBottom: 0 }}>Workspace Explorer</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            className="create-root-btn"
            onClick={() => setIsCreatingRoot(true)}
            title="Add Root Folder"
          >
            +📁 Folder
          </button>
          <button 
            className="create-root-btn"
            onClick={handleCreateRootNote}
            title="Add Root Note"
          >
            +📄 Note
          </button>
        </div>
      </div>

      {error && (
        <div className="auth-error animate-fade-in" style={{ padding: '6px 10px', fontSize: '0.8rem', margin: '4px 0' }}>
          <span>{error}</span>
          <button className="auth-error-close" onClick={clearError}>&times;</button>
        </div>
      )}

      {isCreatingRoot && (
        <form onSubmit={handleCreateRootSubmit} style={{ margin: '4px 0' }}>
          <input
            type="text"
            className="folder-inline-input"
            placeholder="Folder name..."
            value={rootName}
            onChange={(e) => setRootName(e.target.value)}
            onBlur={handleCreateRootSubmit}
            autoFocus
            required
          />
        </form>
      )}

      <div className="folder-list">
        {/* Render root folders recursively */}
        {rootFolders.map((folder) => (
          <FolderNode
            key={folder.id}
            folder={folder}
            allFolders={folders}
            allNotes={notes}
            depth={0}
          />
        ))}

        {/* Render root notes */}
        {rootNotes.map((note) => (
          <div
            key={note.id}
            className={`note-node-row ${activeNote?.id === note.id ? 'selected' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setActiveNote(note);
            }}
            style={{ paddingLeft: '8px' }}
          >
            <span className="note-icon">📄</span>
            <span className="note-name">{note.title || 'Untitled Note'}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
