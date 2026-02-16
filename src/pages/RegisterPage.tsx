import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserPlus } from 'lucide-react';
import { UserRole } from '../types';

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'employee' as 'admin' | 'employee',
    organization_name: '',
    organization_id: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // Prepare payload based on role as per guide
    const payload: any = {
      email: formData.email,
      password: formData.password,
      name: formData.name,
      role: formData.role,
    };

    if (formData.role === 'admin') {
      payload.organization_name = formData.organization_name;
    } else {
      payload.organization_id = formData.organization_id;
    }

    try {
      await register(payload);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <UserPlus size={24} color="#6366f1" />
          <h2 style={{ margin: 0 }}>Join WorkPulse</h2>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input 
              type="text" 
              value={formData.name} 
              onChange={(e) => setFormData({...formData, name: e.target.value})} 
              required 
            />
          </div>
          
          <div className="form-group">
            <label>Email Address</label>
            <input 
              type="email" 
              value={formData.email} 
              onChange={(e) => setFormData({...formData, email: e.target.value})} 
              required 
            />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              value={formData.password} 
              onChange={(e) => setFormData({...formData, password: e.target.value})} 
              required 
            />
          </div>

          <div className="form-group">
            <label>Role</label>
            <select 
              value={formData.role} 
              onChange={(e) => setFormData({...formData, role: e.target.value as UserRole})}
            >
              <option value="employee">Employee (Join Organization)</option>
              <option value="admin">Admin (Create Organization)</option>
            </select>
          </div>

          {formData.role === 'admin' ? (
            <div className="form-group">
              <label>Organization Name</label>
              <input 
                type="text" 
                value={formData.organization_name} 
                onChange={(e) => setFormData({...formData, organization_name: e.target.value})} 
                required 
              />
            </div>
          ) : (
            <div className="form-group">
              <label>Organization ID</label>
              <input 
                type="text" 
                value={formData.organization_id} 
                onChange={(e) => setFormData({...formData, organization_id: e.target.value})} 
                required 
              />
            </div>
          )}
          
          {error && <p style={{ color: 'var(--error)', fontSize: '0.875rem' }}>{error}</p>}
          
          <button className="btn" type="submit" disabled={loading}>
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>
        
        <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-dim)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary)' }}>Login</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
