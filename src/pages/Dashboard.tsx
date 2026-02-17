import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useSession } from "../hooks/useSession";
import { useHeartbeat } from "../hooks/useHeartbeat";
import { useWebSockets } from "../hooks/useWebSockets";
import { projectService, reportService } from "../api/reports";
import { Project, OrganizationReportItem } from "../types";
import {
  Play,
  Square,
  LogOut,
  Wifi,
  WifiOff,
  FolderKanban,
} from "lucide-react";

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { activeSession, startSession, stopSession, checkActiveSession } =
    useSession();
  const { isOnline } = useHeartbeat(activeSession?.id);
  useWebSockets();

  const [projects, setProjects] = useState<Project[]>([]);
  const [orgReports, setOrgReports] = useState<OrganizationReportItem[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [elapsedTime, setElapsedTime] = useState(0);

  const fetchProjects = async () => {
    try {
      const data = await projectService.getProjects();
      setProjects(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch projects", err);
    }
  };

  const fetchOrgReports = async () => {
    if (user?.role !== 'admin') return;
    try {
      const data = await reportService.getOrgReport();
      setOrgReports(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch org reports", err);
    }
  };

  useEffect(() => {
    checkActiveSession();
    fetchProjects();
    if (user?.role === 'admin') {
      fetchOrgReports();
    }
  }, [checkActiveSession, user?.role]);

  useEffect(() => {
    let interval: any;
    if (activeSession) {
      const startTime = new Date(activeSession.start_time).getTime();
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    } else {
      setElapsedTime(0);
    }
    return () => clearInterval(interval);
  }, [activeSession]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleStart = async () => {
    try {
      await startSession(selectedProjectId || undefined);
    } catch (err) {
      alert("Failed to start session");
    }
  };

  const handleStop = async () => {
    try {
      await stopSession();
    } catch (err) {
      alert("Failed to stop session");
    }
  };

  return (
    <div>
      <header className="header">
        <div>
          <h1 style={{ margin: 0 }}>
            Welcome back, {user?.name?.split(" ")[0] || "User"}!
          </h1>
          <p style={{ color: "var(--text-dim)", margin: 0 }}>
            Monitor your real-time productivity
          </p>
        </div>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <div className={`status-badge ${!isOnline ? "offline" : ""}`}>
            {isOnline ? (
              <Wifi size={14} style={{ marginRight: 4 }} />
            ) : (
              <WifiOff size={14} style={{ marginRight: 4 }} />
            )}
            {isOnline ? "Online" : "Offline"}
          </div>
          <button
            onClick={logout}
            className="btn btn-outline"
            style={{ width: "auto" }}
          >
            <LogOut size={18} style={{ marginRight: 8 }} />
            Logout
          </button>
        </div>
      </header>

      {user?.role === "employee" && (
        <div
          className="card"
          style={{
            marginBottom: "2rem",
            padding: "3rem",
            textAlign: "center",
            background:
              "linear-gradient(135deg, rgba(99, 102, 241, 0.1), transparent)",
          }}
        >
          <div
            style={{
              color: "var(--text-dim)",
              marginBottom: "1rem",
              fontWeight: "600",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              fontSize: "0.875rem",
            }}
          >
            {activeSession ? "Session in Progress" : "Ready to Start"}
          </div>
          <div className="timer-display">{formatTime(elapsedTime)}</div>

          {activeSession && (
            <div
              style={{
                marginTop: "1rem",
                color: "var(--primary)",
                fontWeight: "500",
              }}
            >
              <FolderKanban
                size={16}
                style={{ verticalAlign: "middle", marginRight: "6px" }}
              />
              {projects.find((p) => p.id === activeSession.project_id)?.name ||
                "General Task"}
            </div>
          )}

          <div
            style={{
              marginTop: "2.5rem",
              display: "flex",
              justifyContent: "center",
              gap: "1rem",
            }}
          >
            {!activeSession ? (
              <div
                style={{
                  display: "flex",
                  gap: "1rem",
                  width: "100%",
                  maxWidth: "400px",
                }}
              >
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  style={{ flex: 1 }}
                >
                  <option value="">Select Project</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <button onClick={handleStart} className="btn">
                  <Play size={18} fill="currentColor" />
                  Start Session
                </button>
              </div>
            ) : (
              <button
                onClick={handleStop}
                className="btn"
                style={{ background: "var(--error)", width: "200px" }}
              >
                <Square size={18} fill="currentColor" />
                Stop Session
              </button>
            )}
          </div>
        </div>
      )}

      {user?.role === "admin" && (
        <div className="card" style={{ marginBottom: "2rem" }}>
          <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--border)" }}>
            <h3 style={{ margin: 0 }}>Organization Report</h3>
          </div>
          <div className="table-container">
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: "1rem", borderBottom: "1px solid var(--border)", color: "var(--text-dim)" }}>User</th>
                  <th style={{ textAlign: "left", padding: "1rem", borderBottom: "1px solid var(--border)", color: "var(--text-dim)" }}>Status</th>
                  <th style={{ textAlign: "right", padding: "1rem", borderBottom: "1px solid var(--border)", color: "var(--text-dim)" }}>Total Work</th>
                  <th style={{ textAlign: "right", padding: "1rem", borderBottom: "1px solid var(--border)", color: "var(--text-dim)" }}>Active</th>
                  <th style={{ textAlign: "right", padding: "1rem", borderBottom: "1px solid var(--border)", color: "var(--text-dim)" }}>Idle</th>
                  <th style={{ textAlign: "right", padding: "1rem", borderBottom: "1px solid var(--border)", color: "var(--text-dim)" }}>Productivity</th>
                </tr>
              </thead>
              <tbody>
                {orgReports.map((report) => (
                  <tr key={report.id}>
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
                      {Math.round(report.total_work_seconds / 3600)}h {Math.round((report.total_work_seconds % 3600) / 60)}m
                    </td>
                    <td style={{ textAlign: "right", padding: "1rem", borderBottom: "1px solid var(--border)" }}>
                      {Math.round(report.active_seconds / 3600)}h {Math.round((report.active_seconds % 3600) / 60)}m
                    </td>
                    <td style={{ textAlign: "right", padding: "1rem", borderBottom: "1px solid var(--border)" }}>
                       {Math.round(report.idle_seconds / 60)}m
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
                {orgReports.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ padding: "3rem", textAlign: "center", color: "var(--text-dim)" }}>
                      No data available for today
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="grid">
        {/* {user?.role=== "employee" && (
          <>
        <div className="card stat-card">
          <div style={{ color: "var(--text-dim)", fontSize: "0.875rem" }}>
            Daily Progress
          </div>
          <div className="stat-value">6h 45m</div>
          <div
            style={{
              fontSize: "0.75rem",
              color: "var(--success)",
              marginTop: "0.5rem",
            }}
          >
            +12% from yesterday
          </div>
        </div>
        <div className="card stat-card">
          <div style={{ color: "var(--text-dim)", fontSize: "0.875rem" }}>
            Today's Idle Time
          </div>
          <div className="stat-value" style={{ color: "var(--error)" }}>
            24m
          </div>
          <div
            style={{
              fontSize: "0.75rem",
              color: "var(--text-dim)",
              marginTop: "0.5rem",
            }}
          >
            Within targets
          </div>
        </div>
        </>
        )} */}
        <div 
          className="card stat-card" 
          onClick={() => navigate('/projects')}
          style={{ cursor: 'pointer' }}
        >
          <div style={{ color: "var(--text-dim)", fontSize: "0.875rem" }}>
            Active Projects
          </div>
          <div className="stat-value">{projects.length}</div>
          <div
            style={{
              fontSize: "0.75rem",
              color: "var(--primary)",
              marginTop: "0.5rem",
            }}
          >
            {projects.length} focus sessions
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
