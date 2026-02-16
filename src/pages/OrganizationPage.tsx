import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../api/users';
import { User } from '../types';
import { Users, Copy, CheckCircle, Mail, Shield } from 'lucide-react';

const OrganizationPage: React.FC = () => {
  const { user } = useAuth();
  const [copied, setCopied] = React.useState(false);
  const [teamMembers, setTeamMembers] = React.useState<User[]>([]);

  React.useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const data = await userService.getEmployees();
        // Sort: Admins first, then by name
        const sorted = (Array.isArray(data) ? data : []).sort((a, b) => {
          if (a.role === 'admin' && b.role !== 'admin') return -1;
          if (a.role !== 'admin' && b.role === 'admin') return 1;
          return a.name.localeCompare(b.name);
        });
        setTeamMembers(sorted);
      } catch (err) {
        console.error("Failed to fetch team members", err);
      }
    };

    fetchTeamMembers();
  }, []);

  const copyOrgId = () => {
    if (user?.organization_id) {
      navigator.clipboard.writeText(user.organization_id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="organization-container">
      <header className="header">
        <div>
          <h1 style={{ margin: 0 }}>Organization</h1>
          <p style={{ color: 'var(--text-dim)', margin: 0 }}>Manage your team and organization settings</p>
        </div>
      </header>

      <div className="grid" style={{ gridTemplateColumns: 'minmax(400px, 2fr) 1fr' }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
            <Users size={24} color="var(--primary)" />
            <h3 style={{ margin: 0 }}>Team Members</h3>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Mocking team list for now as per requirement for premium feel */}
            {/* Team List fetching from API */}
            {teamMembers.map((member, i) => (
              <div key={i} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                padding: '1rem', 
                background: 'rgba(255,255,255,0.03)', 
                borderRadius: '0.75rem',
                border: '1px solid var(--border)'
              }}>
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '10px', 
                  background: member.role === 'admin' ? 'var(--primary-light)' : 'rgba(255,255,255,0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '1rem'
                }}>
                  {member.role === 'admin' ? <Shield size={18} color="var(--primary)" /> : <Mail size={18} color="var(--text-dim)" />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600' }}>{member.name}</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-dim)' }}>{member.email}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', textTransform: 'capitalize', color: member.role === 'admin' ? 'var(--primary)' : 'var(--text-dim)' }}>
                    {member.role}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: member.status === 'Online' ? 'var(--success)' : 'var(--text-dim)' }}>
                    ● {member.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card">
            <h3 style={{ marginTop: 0 }}>Invite Team</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-dim)', marginBottom: '1.5rem' }}>
              Share this Organization ID with your employees so they can join your workspace.
            </p>
            
            <div style={{ 
              background: 'var(--bg-input)', 
              padding: '1rem', 
              borderRadius: '0.75rem', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              marginBottom: '1rem',
              border: '1px solid var(--border)'
            }}>
              <code style={{ fontSize: '0.875rem', color: 'var(--primary)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.organization_id || 'ID_NOT_FOUND'}
              </code>
              <button 
                onClick={copyOrgId} 
                style={{ background: 'none', border: 'none', color: 'var(--text-dim', cursor: 'pointer' }}
              >
                {copied ? <CheckCircle size={18} color="var(--success)" /> : <Copy size={18} />}
              </button>
            </div>
          </div>

          <div className="card" style={{ background: 'linear-gradient(135deg, var(--primary-light), transparent)' }}>
            <h3 style={{ marginTop: 0 }}>Organization Settings</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-dim)' }}>
              Configure workspace-wide rules for tracking and automated reporting.
            </p>
            <button className="btn btn-outline" style={{ width: '100%' }}>
              Change Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationPage;
