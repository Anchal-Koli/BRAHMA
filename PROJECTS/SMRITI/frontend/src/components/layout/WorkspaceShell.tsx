import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useNoteStore } from '../../store/noteStore';
import { FolderTree } from '../../features/vault/FolderTree';
import { NoteWorkspace } from '../../features/notes/NoteWorkspace';
import './WorkspaceShell.css';

export const WorkspaceShell: React.FC = () => {
  const { user, logoutUser, loading } = useAuthStore();
  const { activeNote, createNote } = useNoteStore();
  
  // Collapse toggle states for side panels
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(false);
  
  // Sidebar navigation active state placeholder
  const [activeMenu, setActiveMenu] = useState<'folders' | 'tags' | 'documents' | 'trash'>('folders');

  const handleCreateNewNote = async () => {
    try {
      await createNote('Untitled Note', null);
    } catch (err) {
      // Handled by store
    }
  };

  return (
    <div className="workspace-shell animate-fade-in">
      {/* 1. Top Navigation Bar */}
      <header className="top-nav">
        <div className="nav-left">
          <button 
            className="sidebar-toggle-btn" 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            title="Toggle Sidebar"
          >
            ☰
          </button>
          <span className="app-logo">KnowledgeOS</span>
        </div>

        <div className="search-container">
          <input 
            type="text" 
            className="search-input" 
            placeholder="Search notes, documents, or tags..." 
          />
        </div>

        <div className="user-profile-menu">
          <span className="user-email">{user?.email}</span>
          <button 
            className="logout-icon-btn" 
            onClick={logoutUser} 
            disabled={loading}
          >
            {loading ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      </header>

      {/* 2. Main Workspace Layout */}
      <div className="main-container">
        {/* Left Collapsible Sidebar */}
        <aside className={`left-sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
          <div className="sidebar-section">
            <h3 className="sidebar-title">Vault</h3>
            <nav className="sidebar-menu" style={{ marginBottom: '16px' }}>
              <button 
                className={`menu-item ${activeMenu === 'folders' ? 'active' : ''}`}
                onClick={() => setActiveMenu('folders')}
              >
                📂 Folders Explorer
              </button>
              <button 
                className={`menu-item ${activeMenu === 'tags' ? 'active' : ''}`}
                onClick={() => setActiveMenu('tags')}
              >
                🏷️ Tags Collection
              </button>
              <button 
                className={`menu-item ${activeMenu === 'documents' ? 'active' : ''}`}
                onClick={() => setActiveMenu('documents')}
              >
                📁 Uploaded Files
              </button>
              <button 
                className={`menu-item ${activeMenu === 'trash' ? 'active' : ''}`}
                onClick={() => setActiveMenu('trash')}
              >
                🗑️ Trash Archive
              </button>
            </nav>

            {/* Render subcomponents dynamically based on active menu */}
            {activeMenu === 'folders' && <FolderTree />}
            {activeMenu === 'tags' && <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', paddingLeft: '8px' }}>Tags view placeholder</div>}
            {activeMenu === 'documents' && <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', paddingLeft: '8px' }}>Files view placeholder</div>}
            {activeMenu === 'trash' && <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', paddingLeft: '8px' }}>Trash view placeholder</div>}
          </div>

          <div className="sidebar-section" style={{ marginTop: 'auto', borderTop: '1px solid var(--border-color)', paddingBottom: '16px' }}>
            <button 
              className="menu-item"
              onClick={() => setIsRightPanelCollapsed(!isRightPanelCollapsed)}
              style={{ width: '100%' }}
            >
              ⚙️ {isRightPanelCollapsed ? 'Show Metadata' : 'Hide Metadata'}
            </button>
          </div>
        </aside>

        {/* Central Workspace (Notes Editor / Empty State) */}
        <main className="central-workspace">
          {activeNote ? (
            <NoteWorkspace />
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📝</div>
              <h2 className="empty-state-title">No Note Selected</h2>
              <p className="empty-state-description">
                Select a note from your sidebar folder directory, or create a new note to start drafting.
              </p>
              <button className="empty-state-btn" onClick={handleCreateNewNote}>
                + New Note
              </button>
            </div>
          )}
        </main>

        {/* Right Collapsible Metadata Properties Panel */}
        <aside className={`right-panel ${isRightPanelCollapsed ? 'collapsed' : ''}`}>
          <div className="panel-header">
            <h3 className="panel-title">Properties</h3>
            <button 
              className="panel-close-btn"
              onClick={() => setIsRightPanelCollapsed(true)}
            >
              &times;
            </button>
          </div>

          <hr style={{ border: '0', borderTop: '1px solid var(--border-color)' }} />

          <div className="metadata-list">
            <div className="metadata-item">
              <span className="metadata-label">File Type</span>
              <span className="metadata-value">Markdown rich-text</span>
            </div>
            <div className="metadata-item">
              <span className="metadata-label">Words Count</span>
              <span className="metadata-value">{activeNote?.word_count || 0} words</span>
            </div>
            <div className="metadata-item">
              <span className="metadata-label">Character Count</span>
              <span className="metadata-value">{activeNote?.content?.length || 0} chars</span>
            </div>
            <div className="metadata-item">
              <span className="metadata-label">Created At</span>
              <span className="metadata-value">
                {activeNote ? new Date(activeNote.created_at).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div className="metadata-item">
              <span className="metadata-label">Last Updated</span>
              <span className="metadata-value">
                {activeNote ? new Date(activeNote.updated_at).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
