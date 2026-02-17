import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { reportService } from '../api/reports';
import { TrendingUp, Zap, Clock } from 'lucide-react';

const ReportsPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any>(null); // DailyReport | OrganizationReportItem[]
  const [selectedUser, setSelectedUser] = useState<any>(null); // User details for admin drill-down
  const [userReport, setUserReport] = useState<any>(null); // Specific user report (DailyReport structure)

  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      try {
        if (user?.role === 'admin') {
          // Admin sees Org Report by default
          const data = await reportService.getOrgReport();
          setReportData(Array.isArray(data) ? data : []);
        } else {
          // Employee sees Daily Report
          const data = await reportService.getDailyReport(date);
          // Handle if API returns array (common in some endpoints) or object
          const report = Array.isArray(data) ? (data.length > 0 ? data[0] : null) : data;
          setReportData(report);
        }
      } catch (err) {
        console.error('Failed to fetch report', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [user, date]);

  const handleUserClick = async (userId: string) => {
    setLoading(true);
    try {
      const data = await reportService.getUserReport(userId);
      // API might return array or single object. Handle both.
      // If array, take first or aggregate? User example showed single object.
      // If array of length 1, take first.
      const report = Array.isArray(data) && data.length > 0 ? data[0] : (Array.isArray(data) ? null : data);
      setUserReport(report);
      
      const selectedInfo = (reportData as any[]).find((r: any) => r.user.id === userId);
      setSelectedUser(selectedInfo?.user || { id: userId, name: 'User' });
    } catch (err) {
      console.error('Failed to fetch user report', err);
    } finally {
      setLoading(false);
    }
  };

  const formatSeconds = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  const AppUsageTable = ({ usage }: { usage: any[] }) => (
    <div className="card" style={{ marginTop: '2rem' }}>
      <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
        <h3 style={{ margin: 0 }}>App Usage Analysis</h3>
      </div>
      <div className="table-container">
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: "1rem", borderBottom: "1px solid var(--border)", color: "var(--text-dim)" }}>Application</th>
              <th style={{ textAlign: "right", padding: "1rem", borderBottom: "1px solid var(--border)", color: "var(--text-dim)" }}>Active</th>
              <th style={{ textAlign: "right", padding: "1rem", borderBottom: "1px solid var(--border)", color: "var(--text-dim)" }}>Idle</th>
              <th style={{ textAlign: "right", padding: "1rem", borderBottom: "1px solid var(--border)", color: "var(--text-dim)" }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {(usage || []).map((app, idx) => (
              <tr key={idx}>
                <td style={{ padding: "1rem", borderBottom: "1px solid var(--border)", fontWeight: "500" }}>
                  {app.app}
                </td>
                <td style={{ textAlign: "right", padding: "1rem", borderBottom: "1px solid var(--border)", color: "var(--success)" }}>
                  {formatSeconds(app.active_seconds)}
                </td>
                <td style={{ textAlign: "right", padding: "1rem", borderBottom: "1px solid var(--border)", color: "var(--error)" }}>
                  {formatSeconds(app.idle_seconds)}
                </td>
                <td style={{ textAlign: "right", padding: "1rem", borderBottom: "1px solid var(--border)" }}>
                  {formatSeconds(app.total_seconds)}
                </td>
              </tr>
            ))}
            {(!usage || usage.length === 0) && (
              <tr>
                <td colSpan={4} style={{ padding: "3rem", textAlign: "center", color: "var(--text-dim)" }}>
                  No app activity recorded
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
  if (loading && !reportData) {
     return <div className="loading" style={{ height: '50vh' }}>Loading reports...</div>;
  }

  // Admin Drill-down View
  if (selectedUser) {
    return (
      <div>
        <header className="header">
          <div>
            <button 
              onClick={() => setSelectedUser(null)}
              className="btn btn-outline"
              style={{ marginBottom: '1rem', padding: '0.5rem 1rem' }}
            >
              ← Back to Organization
            </button>
            <h1 style={{ margin: 0 }}>{selectedUser.name}'s Report</h1>
            <p style={{ color: 'var(--text-dim)', margin: 0 }}>Detailed activity analysis</p>
          </div>
        </header>
        
        <div className="card">
           {!userReport ? (
             <p style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '2rem' }}>
               No activity data found for this user today.
             </p>
           ) : (
             <>
             <div className="grid">
                <div className="stat-card" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div style={{ background: 'var(--primary-light)', padding: '0.5rem', borderRadius: '8px' }}>
                      <Clock size={18} color="var(--primary)" />
                    </div>
                    <span style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-dim)' }}>Total Work</span>
                  </div>
                  <div className="stat-value" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{formatSeconds(userReport.total_work_seconds || 0)}</div>
                </div>

                <div className="stat-card" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div style={{ background: 'rgba(52, 211, 153, 0.1)', padding: '0.5rem', borderRadius: '8px' }}>
                      <TrendingUp size={18} color="var(--success)" />
                    </div>
                    <span style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-dim)' }}>Active Time</span>
                  </div>
                  <div className="stat-value" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{formatSeconds(userReport.active_seconds || 0)}</div>
                </div>

                <div className="stat-card" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div style={{ background: 'rgba(244, 63, 94, 0.1)', padding: '0.5rem', borderRadius: '8px' }}>
                      <Clock size={18} color="var(--error)" />
                    </div>
                    <span style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-dim)' }}>Idle Time</span>
                  </div>
                  <div className="stat-value" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{formatSeconds(userReport.idle_seconds || 0)}</div>
                </div>

                <div className="stat-card" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div style={{ background: 'var(--primary-light)', padding: '0.5rem', borderRadius: '8px' }}>
                      <Zap size={18} color="var(--primary)" />
                    </div>
                    <span style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-dim)' }}>Productivity</span>
                  </div>
                  <div className="stat-value" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: parseFloat(userReport.productivity_score) >= 50 ? 'var(--success)' : 'var(--warning)' }}>
                    {userReport.productivity_score}%
                  </div>
                </div>
             </div>
              
              <AppUsageTable usage={userReport.app_usage} />
            </>
           )}
        </div>
      </div>
    );
  }

  // Admin Organization View
  if (user?.role === 'admin') {
    return (
      <div>
        <header className="header">
          <div>
            <h1 style={{ margin: 0 }}>Organization Overview</h1>
             <p style={{ color: 'var(--text-dim)', margin: 0 }}>Team productivity insights</p>
          </div>
        </header>
        
        <div className="card">
          <div className="table-container">
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: "1rem", borderBottom: "1px solid var(--border)", color: "var(--text-dim)" }}>User</th>
                  <th style={{ textAlign: "left", padding: "1rem", borderBottom: "1px solid var(--border)", color: "var(--text-dim)" }}>Status</th>
                  <th style={{ textAlign: "right", padding: "1rem", borderBottom: "1px solid var(--border)", color: "var(--text-dim)" }}>Total Work</th>
                  <th style={{ textAlign: "right", padding: "1rem", borderBottom: "1px solid var(--border)", color: "var(--text-dim)" }}>Active</th>
                  <th style={{ textAlign: "right", padding: "1rem", borderBottom: "1px solid var(--border)", color: "var(--text-dim)" }}>Productivity</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(reportData) && reportData.map((report: any) => (
                  <tr 
                    key={report.id} 
                    onClick={() => handleUserClick(report.user_id)}
                    style={{ cursor: 'pointer', transition: 'background 0.2s' }}
                    className="table-row-hover"
                  >
                    <td style={{ padding: "1rem", borderBottom: "1px solid var(--border)" }}>
                      <div style={{ fontWeight: "500" }}>{report.user.name}</div>
                      <div style={{ fontSize: "0.875rem", color: "var(--text-dim)" }}>{report.user.email}</div>
                    </td>
                    <td style={{ padding: "1rem", borderBottom: "1px solid var(--border)" }}>
                      <span className={`status-badge ${report.user.status === 'offline' ? 'offline' : ''}`}>
                         {report.user.status === 'active' ? 'Online' : 'Offline'}
                      </span>
                    </td>
                    <td style={{ textAlign: "right", padding: "1rem", borderBottom: "1px solid var(--border)" }}>
                      {formatSeconds(report.total_work_seconds)}
                    </td>
                    <td style={{ textAlign: "right", padding: "1rem", borderBottom: "1px solid var(--border)" }}>
                      {formatSeconds(report.active_seconds)}
                    </td>
                    <td style={{ textAlign: "right", padding: "1rem", borderBottom: "1px solid var(--border)" }}>
                      <span style={{ 
                        color: parseFloat(report.productivity_score) >= 80 ? 'var(--success)' : 
                               parseFloat(report.productivity_score) >= 50 ? 'var(--warning)' : 'var(--error)' 
                      }}>
                        {report.productivity_score}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // Employee Daily View
  return (
    <div>
      <header className="header">
        <div>
          <h1 style={{ margin: 0 }}>My Productivity</h1>
          <p style={{ color: 'var(--text-dim)', margin: 0 }}>Daily insights</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div className="form-group" style={{ marginBottom: 0, width: '180px' }}>
            <input 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)}
              style={{ marginBottom: 0 }}
            />
          </div>
        </div>
      </header>

      {/* Handle "No data" case for employees (api returns null) */}
      {!reportData ? (
         <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-dim)' }}>
            <div style={{ marginBottom: '1rem' }}>
              <Clock size={48} style={{ opacity: 0.2 }} />
            </div>
            <h3>No data available for this date</h3>
            <p>Start a session to track your productivity.</p>
         </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="grid">
            <div className="card stat-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ background: 'var(--primary-light)', padding: '0.5rem', borderRadius: '8px' }}>
                  <TrendingUp size={18} color="var(--primary)" />
                </div>
                <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>Active Time</span>
              </div>
              <div className="stat-value">{formatSeconds(reportData.active_seconds || 0)}</div>
            </div>

            <div className="card stat-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ background: 'rgba(244, 63, 94, 0.1)', padding: '0.5rem', borderRadius: '8px' }}>
                  <Clock size={18} color="var(--error)" />
                </div>
                <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>Idle Time</span>
              </div>
              <div className="stat-value">{formatSeconds(reportData.idle_seconds || 0)}</div>
            </div>

            <div className="card stat-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ background: 'var(--primary-light)', padding: '0.5rem', borderRadius: '8px' }}>
                  <Zap size={18} color="var(--primary)" />
                </div>
                <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>Productivity Score</span>
              </div>
              {/* Calculate score if not provided directly, or use a placeholder/derived value */}
                <span style={{ 
                  color: parseFloat(reportData.productivity_score) >= 80 ? 'var(--success)' : 
                         parseFloat(reportData.productivity_score) >= 50 ? 'var(--warning)' : 'var(--error)' 
                }}>
                  {reportData.productivity_score}%
                </span>
            </div>
          </div>
          
          <AppUsageTable usage={reportData.app_usage} />
        </div>
      )}
    </div>
  );
};

export default ReportsPage;

