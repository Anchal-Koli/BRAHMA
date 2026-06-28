import React, { useEffect, useState, useRef } from 'react';
import { useVaultStore } from '../../store/vaultStore';
import './DocumentManager.css';

export const DocumentManager: React.FC = () => {
  const { 
    documents, 
    fetchDocuments, 
    uploadDocument, 
    renameDocument, 
    deleteDocument, 
    uploadProgress, 
    error, 
    clearError,
    loading
  } = useVaultStore();

  const [isDragActive, setIsDragActive] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Drag & Drop event wrappers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files);
      for (const file of files) {
        try {
          await uploadDocument(file);
        } catch (err) {
          // Store manages error logs
        }
      }
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const files = Array.from(e.target.files);
      for (const file of files) {
        try {
          await uploadDocument(file);
        } catch (err) {
          // Handled
        }
      }
    }
  };

  const handleRenameSubmit = async (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (!newName.trim()) {
      setEditingId(null);
      return;
    }
    try {
      await renameDocument(id, newName.trim());
      setEditingId(null);
    } catch (err) {
      // Store error logs
    }
  };

  const handleDeleteClick = async (id: string, name: string) => {
    if (window.confirm(`Delete document "${name}" permanently?`)) {
      try {
        await deleteDocument(id);
      } catch (err) {
        // Handled
      }
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case 'pdf': return '📕';
      case 'image': return '🖼️';
      case 'audio': return '🎵';
      case 'video': return '🎥';
      case 'markdown': return '📝';
      default: return '📄';
    }
  };


  const activeUploads = Object.entries(uploadProgress);

  return (
    <div className="doc-manager-container animate-fade-in">
      <h1 className="doc-manager-title">Documents Workspace</h1>

      {error && (
        <div className="auth-error animate-fade-in" style={{ margin: 0 }}>
          <span>{error}</span>
          <button className="auth-error-close" onClick={clearError}>&times;</button>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        multiple
      />

      {/* Drag & Drop Upload Zone */}
      <div 
        className={`upload-dropzone ${isDragActive ? 'active' : ''}`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={triggerFileSelect}
      >
        <span className="upload-icon">📤</span>
        <p className="upload-text">
          Drag and drop files here, or <span>browse files</span>
        </p>
        <p className="upload-text-sub">Supported files up to 20MB</p>
      </div>

      {/* Live Upload Progress Lists */}
      {activeUploads.length > 0 && (
        <div className="upload-progress-list animate-fade-in">
          <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>Uploading Files</h3>
          {activeUploads.map(([filename, progress]) => (
            <div key={filename} className="progress-item">
              <div className="progress-info">
                <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '80%' }}>
                  {filename}
                </span>
                <span>{progress}%</span>
              </div>
              <div className="progress-bar-bg">
                <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Uploaded Documents Grid/Table */}
      <div className="doc-table-wrapper">
        {loading && documents.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <span className="spinner" style={{ margin: '0 auto 12px auto' }}></span>
            <p>Loading your documents...</p>
          </div>
        ) : documents.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '12px' }}>📁</span>
            <p>No documents uploaded yet. Drag files above to get started.</p>
          </div>
        ) : (
          <table className="doc-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Date Added</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr key={doc.id}>
                  <td>
                    <div className="doc-name-cell">
                      <span className="doc-icon">{getFileIcon(doc.file_type)}</span>
                      {editingId === doc.id ? (
                        <form onSubmit={(e) => handleRenameSubmit(e, doc.id)} style={{ flex: 1 }}>
                          <input
                            type="text"
                            className="folder-inline-input"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            onBlur={(e) => handleRenameSubmit(e, doc.id)}
                            autoFocus
                            required
                          />
                        </form>
                      ) : (
                        <span className="doc-name">{doc.file_name}</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={`type-badge ${doc.file_type.toLowerCase()}`}>
                      {doc.file_type}
                    </span>
                  </td>
                  <td>
                    {new Date(doc.created_at).toLocaleDateString()}
                  </td>
                  <td>
                    <span style={{ 
                      fontSize: '0.8rem', 
                      fontWeight: 600, 
                      color: doc.status === 'COMPLETED' ? 'var(--accent-success)' : 'var(--accent-warning)' 
                    }}>
                      {doc.status}
                    </span>
                  </td>
                  <td>
                    <div className="doc-actions-cell" style={{ justifyContent: 'flex-end' }}>
                      {editingId !== doc.id && (
                        <>
                          <button 
                            className="doc-action-btn"
                            onClick={() => { setEditingId(doc.id); setNewName(doc.file_name); }}
                          >
                            Rename
                          </button>
                          <button 
                            className="doc-action-btn delete"
                            onClick={() => handleDeleteClick(doc.id, doc.file_name)}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
