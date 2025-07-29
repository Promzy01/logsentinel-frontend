import React, { useState, useEffect, useCallback, useContext } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import { AuthContext } from './AuthContext';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

const API_BASE = 'https://logsentinel-backend.onrender.com';

function App() {
  const { token, login, logout } = useContext(AuthContext);
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({ email: '', password: '' });

  const [file, setFile] = useState(null);
  const [email, setEmail] = useState('');
  const [result, setResult] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [filters, setFilters] = useState({ ip: '', from: '', to: '' });
  const [showPastAlerts, setShowPastAlerts] = useState(false);

  const fetchAlerts = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE}/alerts`, {
        headers: { Authorization: `Bearer ${token}` },
        params: filters,
      });
      setAlerts(response.data.alerts);
    } catch (err) {
      console.error(err);
    }
  }, [filters, token]);

  const handleUpload = async () => {
    if (!file || !email) {
      toast.error('Please select a log file and enter your email');
      return;
    }

    const formData = new FormData();
    formData.append('logfile', file);
    formData.append('email', email);

    try {
      const response = await axios.post(`${API_BASE}/upload-log`, formData);
      setResult(response.data);
      toast.success('✅ Log uploaded and analyzed');
      if (token) fetchAlerts();
    } catch (error) {
      toast.error('❌ Upload failed');
      console.error(error);
    }
  };

  const handleAuth = async () => {
    const endpoint = authMode === 'login' ? 'login' : 'register';
    try {
      const res = await axios.post(`${API_BASE}/auth/${endpoint}`, authForm);
      login(res.data.token);
      toast.success(`✅ ${authMode} successful`);
    } catch (err) {
      toast.error(`❌ ${authMode} failed`);
    }
  };

  useEffect(() => {
    if (token) fetchAlerts();
  }, [fetchAlerts, token]);

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>🛡️ LogSentinel</h2>
        {token && (
          <button className="btn btn-danger btn-sm" onClick={logout}>
            Logout
          </button>
        )}
      </div>

      {!token && (
        <div className="card p-3 mb-4">
          <h4 className="text-center">{authMode === 'login' ? 'Login' : 'Register'}</h4>
          <input
            type="email"
            placeholder="Email"
            value={authForm.email}
            onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
            className="form-control my-2"
          />
          <input
            type="password"
            placeholder="Password"
            value={authForm.password}
            onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
            className="form-control my-2"
          />
          <button className="btn btn-primary mb-2" onClick={handleAuth}>
            {authMode === 'login' ? 'Login' : 'Register'}
          </button>
          <button className="btn btn-link" onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}>
            {authMode === 'login' ? 'Create account' : 'Back to login'}
          </button>
        </div>
      )}

      {/* Upload */}
      <div className="d-flex flex-column align-items-center gap-2 mb-3">
        <input
          type="email"
          className="form-control"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ maxWidth: '400px' }}
        />
        <div className="d-flex gap-2">
          <input type="file" onChange={(e) => setFile(e.target.files[0])} />
          <button onClick={handleUpload} className="btn btn-primary">Upload Log</button>
        </div>
      </div>

      {/* Upload result */}
      {result && (
        <div className="card-box">
          <h4>Result for: <strong>{result.filename}</strong></h4>
          <p><strong>Total Lines:</strong> {result.totalLines}</p>
          <h5>Preview:</h5>
          <pre className="bg-light p-3">{result.preview.join('\n')}</pre>

          <h5 className="mt-3">Suspicious IPs:</h5>
          {result.suspiciousIPs.length === 0 ? (
            <p>No suspicious activity found.</p>
          ) : (
            <ul className="list-group">
              {result.suspiciousIPs.map((ipObj, idx) => (
                <li key={idx} className="list-group-item d-flex justify-content-between align-items-center">
                  <strong>{ipObj.ip}</strong>
                  <span className={`badge-risk ${ipObj.failedAttempts >= 10
                    ? 'risk-high'
                    : ipObj.failedAttempts >= 5
                      ? 'risk-medium'
                      : 'risk-low'
                  }`}>
                    {ipObj.failedAttempts} failed attempts in {ipObj.withinSeconds}s
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Alerts - only if logged in */}
      {token && (
        <>
          <hr className="my-5" />
          <button
            className="btn btn-outline-dark mb-3"
            onClick={() => setShowPastAlerts(!showPastAlerts)}
          >
            {showPastAlerts ? 'Hide Past Alerts' : 'Show Past Alerts'}
          </button>

          {showPastAlerts && (
            <>
              <h4>📜 Past Alerts</h4>
              <div className="row mb-3">
                <div className="col-md-3">
                  <input type="text" className="form-control" placeholder="Search IP" name="ip" onChange={(e) => setFilters({ ...filters, ip: e.target.value })} />
                </div>
                <div className="col-md-3">
                  <input type="date" className="form-control" name="from" onChange={(e) => setFilters({ ...filters, from: e.target.value })} />
                </div>
                <div className="col-md-3">
                  <input type="date" className="form-control" name="to" onChange={(e) => setFilters({ ...filters, to: e.target.value })} />
                </div>
                <div className="col-md-3">
                  <button className="btn btn-secondary w-100" onClick={fetchAlerts}>Search</button>
                </div>
              </div>
              <ul className="list-group mb-5">
                {alerts.map((a, idx) => (
                  <li key={idx} className="list-group-item d-flex justify-content-between align-items-center">
                    <span><strong>{a.ip}</strong></span>
                    <span className="text-muted small">
                      {new Date(a.timestamp).toLocaleString()} — {a.failedAttempts} attempts in {a.withinSeconds}s
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      )}
      <ToastContainer />
    </div>
  );
}

export default App;
