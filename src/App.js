import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

function App() {
  const [file, setFile] = useState(null);
  const [email, setEmail] = useState('');
  const [result, setResult] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [filters, setFilters] = useState({ ip: '', from: '', to: '' });
  const [showPastAlerts, setShowPastAlerts] = useState(false);

  const fetchAlerts = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:5000/alerts', {
        params: filters,
      });
      setAlerts(response.data.alerts);
    } catch (err) {
      console.error(err);
    }
  }, [filters]);

  const handleUpload = async () => {
    if (!file || !email) {
      toast.error('Please select a log file and enter your email');
      return;
    }

    const formData = new FormData();
    formData.append('logfile', file);
    formData.append('email', email); // ✅ send email

    try {
      const response = await axios.post('http://localhost:5000/upload-log', formData);
      setResult(response.data);
      toast.success('✅ Log uploaded and analyzed');
      fetchAlerts();
    } catch (error) {
      toast.error('❌ Upload failed');
      console.error(error);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = () => {
    fetchAlerts();
  };

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">
        <span role="img" aria-label="shield">🛡️</span> LogSentinel Dashboard
      </h2>

      <div className="d-flex flex-column align-items-center gap-2 mb-3">
        <input
          type="email"
          className="form-control"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ maxWidth: '400px' }}
        />
        <div className="d-flex gap-2">
          <input type="file" onChange={(e) => setFile(e.target.files[0])} />
          <button onClick={handleUpload} className="btn btn-primary">Upload Log</button>
        </div>
      </div>

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
              <input type="text" className="form-control" placeholder="Search IP" name="ip" onChange={handleFilterChange} />
            </div>
            <div className="col-md-3">
              <input type="date" className="form-control" name="from" onChange={handleFilterChange} />
            </div>
            <div className="col-md-3">
              <input type="date" className="form-control" name="to" onChange={handleFilterChange} />
            </div>
            <div className="col-md-3">
              <button className="btn btn-secondary w-100" onClick={handleSearch}>Search</button>
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

      <ToastContainer />
    </div>
  );
}

export default App;
