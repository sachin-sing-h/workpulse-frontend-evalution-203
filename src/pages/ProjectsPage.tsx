import React, { useEffect, useState } from 'react';
import { projectService } from '../api/reports';
import { Project } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { FolderKanban, Plus, MoreVertical, Clock, CheckCircle } from 'lucide-react';

const ProjectsPage: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });

  const fetchProjects = async () => {
    try {
      const data = await projectService.getProjects();
      setProjects(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch projects', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.name) return;
    
    try {
      await projectService.createProject(newProject);
      setNewProject({ name: '', description: '' });
      setShowAddModal(false);
      fetchProjects();
    } catch (err) {
      alert('Failed to create project');
    }
  };

  return (
    <div className="projects-container">
      <header className="header">
        <div>
          <h1 style={{ margin: 0 }}>Projects</h1>
          <p style={{ color: 'var(--text-dim)', margin: 0 }}>Manage and organize your team's workflow</p>
        </div>
        {user?.role === 'admin' && (
          <button onClick={() => setShowAddModal(true)} className="btn">
            <Plus size={20} />
            Create Project
          </button>
        )}
      </header>

      {loading ? (
        <div className="loading" style={{ height: '50vh' }}>Loading projects...</div>
      ) : (
        <div className="grid">
          {projects.map(project => (
            <div key={project.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '10px', 
                  background: 'var(--primary-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <FolderKanban size={20} color="var(--primary)" />
                </div>
                <button style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
                  <MoreVertical size={20} />
                </button>
              </div>
              
              <h3 style={{ margin: '0 0 0.5rem 0' }}>{project.name}</h3>
              <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem', marginBottom: '1.5rem', minHeight: '3rem' }}>
                {project.description || 'No description provided for this project.'}
              </p>
              
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                paddingTop: '1rem',
                borderTop: '1px solid var(--border)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-dim)', fontSize: '0.75rem' }}>
                  <Clock size={14} />
                  Created {new Date(project.created_at).toLocaleDateString()}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)', fontSize: '0.75rem' }}>
                  <CheckCircle size={14} />
                  Active
                </div>
              </div>
            </div>
          ))}
          
          {projects.length === 0 && (
            <div style={{ 
              gridColumn: '1 / -1', 
              padding: '4rem', 
              textAlign: 'center', 
              background: 'rgba(255,255,255,0.02)', 
              borderRadius: '1.5rem',
              border: '2px dashed var(--border)'
            }}>
              <FolderKanban size={48} color="var(--text-dim)" style={{ marginBottom: '1rem', opacity: 0.3 }} />
              <h3 style={{ color: 'var(--text-dim)' }}>No projects found</h3>
              {user?.role === 'admin' && <p>Create your first project to start tracking time.</p>}
            </div>
          )}
        </div>
      )}

      {showAddModal && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          background: 'rgba(0,0,0,0.8)', 
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="card" style={{ maxWidth: '400px', width: '90%' }}>
            <h2>New Project</h2>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Project Name</label>
                <input 
                  autoFocus
                  type="text" 
                  value={newProject.name} 
                  onChange={e => setNewProject({...newProject, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description (Optional)</label>
                <textarea 
                  value={newProject.description} 
                  onChange={e => setNewProject({...newProject, description: e.target.value})}
                  style={{ 
                    width: '100%', 
                    background: 'var(--bg-input)', 
                    border: '1px solid var(--border)', 
                    borderRadius: '0.75rem',
                    padding: '0.75rem',
                    color: '#fff',
                    minHeight: '100px'
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-outline" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn" style={{ flex: 1 }}>
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;
