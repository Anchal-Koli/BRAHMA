import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import './WorkspaceShell.css';

export const WorkspaceShell: React.FC = () => {
  const { user, logoutUser, loading } = useAuthStore();
  
  // Collapse toggle states for side panels
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(false);
  
  // Sidebar navigation active state placeholder
  const [activeMenu, setActiveMenu] = useState<'folders' | 'tags' | 'documents' | 'trash'>('folders');

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
            <nav className="sidebar-menu">
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
          </div>

          {/* Collapsed items context mapping can go here in future */}
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

        {/* Central Notes Area */}
        <main className="central-workspace">
          <div className="empty-state">
            <div className="empty-state-icon">📝</div>
            <h2 className="empty-state-title">No Note Selected</h2>
            <p className="empty-state-description">
              Select a note from your sidebar folder directory, or create a new note to start drafting.
            </p>
            <button className="empty-state-btn">
              + New Note
            </button>
          </div>
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
              <span className="metadata-value">0 words</span>
            </div>
            <div className="metadata-item">
              <span className="metadata-label">Character Count</span>
              <span className="metadata-value">0 characters</span>
            </div>
            <div className="metadata-item">
              <span className="metadata-label">Associated Tags</span>
              <span className="metadata-value" style={{ color: 'var(--text-muted)' }}>None</span>
            </div>
            <div className="metadata-item">
              <span className="metadata-label">Storage Location</span>
              <span className="metadata-value" style={{ color: 'var(--text-muted)' }}>Root folder</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
