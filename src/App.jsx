import React, { useState, useEffect } from 'react';
import './App.css';
import dashboardData from './data.json';
import WmsDashboard from './WmsDashboard';

// Simple Inline SVG Icons
const Icons = {
  Store: () => <svg className="icon-svg" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>,
  Cart: () => <svg className="icon-svg" viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>,
  Truck: () => <svg className="icon-svg" viewBox="0 0 24 24"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>,
  Card: () => <svg className="icon-svg" viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>,
  Activity: () => <svg className="icon-svg" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>,
  Server: () => <svg className="icon-svg" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect><rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect><line x1="6" y1="6" x2="6.01" y2="6"></line><line x1="6" y1="18" x2="6.01" y2="18"></line></svg>,
  Database: () => <svg className="icon-svg" viewBox="0 0 24 24"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>,
  Clock: () => <svg className="icon-svg" style={{stroke: "var(--text-secondary)", width: "16px", height: "16px"}} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>,
  Maximize: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>,
  X: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>,
  Sun: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>,
  Moon: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
};

const StatusIcon = ({ status }) => {
  if (status === 'ok') return <svg style={{width:'16px',height:'16px',stroke:'var(--status-ok)',strokeWidth:'3',fill:'none',strokeLinecap:'round',strokeLinejoin:'round'}} viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>;
  if (status === 'warn') return <svg style={{width:'16px',height:'16px',stroke:'var(--status-warn)',strokeWidth:'2',fill:'none',strokeLinecap:'round',strokeLinejoin:'round'}} viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>;
  if (status === 'crit') return <svg style={{width:'16px',height:'16px',stroke:'var(--status-crit)',strokeWidth:'2',fill:'none',strokeLinecap:'round',strokeLinejoin:'round'}} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>;
  return null;
};

const Widget = ({ title, icon: Icon, children, className = '', delay = 0, onExpand, onClose, isExpanded }) => (
  <div className={`glass-panel widget ${className}`} style={{ animationDelay: `${delay}s` }}>
    <div className="widget-header">
      <h3 className="widget-title">
        {Icon && <Icon />}
        {title}
      </h3>
      {onExpand && !isExpanded && (
        <button className="expand-btn" onClick={onExpand} title="Expand Widget">
          <Icons.Maximize />
        </button>
      )}
      {isExpanded && onClose && (
        <button className="expand-btn" onClick={onClose} title="Close Expanded View">
          <Icons.X />
        </button>
      )}
    </div>
    <div className="widget-body">
      {children}
    </div>
  </div>
);

function App() {
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  const [data] = useState(dashboardData); 
  const [expandedId, setExpandedId] = useState(null);
  const [currentPage, setCurrentPage] = useState('ktlo');
  
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const renderEcommerceTable = () => (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>System</th>
            <th>Status</th>
            <th>Uptime</th>
            <th>Active Sessions</th>
          </tr>
        </thead>
        <tbody>
          {data.ecommerce.map((item, idx) => (
            <tr key={idx}>
              <td>{item.system}</td>
              <td className="status-cell">
                <StatusIcon status={item.status}/> {item.statusText}
              </td>
              <td>{item.uptime}</td>
              <td className={item.highlightSessions ? 'text-warn' : ''}>{item.sessions}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderPosTable = () => (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Application</th>
            <th>Region</th>
            <th>Status</th>
            <th>Offline Stores</th>
          </tr>
        </thead>
        <tbody>
          {data.pos.map((item, idx) => (
            <tr key={idx}>
              <td>{item.application}</td>
              <td>{item.region}</td>
              <td className="status-cell">
                <StatusIcon status={item.status}/> {item.statusText}
              </td>
              <td className={item.highlightOffline ? 'text-crit' : ''}>{item.offline}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderLogisticsTable = () => (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Location</th>
            <th>WMS Status</th>
            <th>Queue</th>
          </tr>
        </thead>
        <tbody>
          {data.logistics.map((item, idx) => (
            <tr key={idx}>
              <td>{item.location}</td>
              <td className="status-cell">
                <StatusIcon status={item.status}/> {item.statusText}
              </td>
              <td className={item.highlightQueue ? 'text-warn' : ''}>{item.queue}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderPaymentsTable = () => (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Provider</th>
            <th>Latency (ms)</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {data.payments.map((item, idx) => (
            <tr key={idx}>
              <td>{item.provider}</td>
              <td className={item.highlightLatency ? 'text-warn' : ''}>{item.latency}</td>
              <td className="status-cell">
                <StatusIcon status={item.status}/> {item.statusText}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderSystemHealth = () => (
    <div className="metric-grid">
      <div className="metric-card">
        <span className="metric-label">Avg Auth Time</span>
        <span className="metric-value">{data.health.authTime}</span>
      </div>
      <div className="metric-card">
        <span className="metric-label">API Error Rate</span>
        <span className="metric-value text-warn">{data.health.apiError}</span>
      </div>
      <div className="metric-card">
        <span className="metric-label">Active Incidents</span>
        <span className="metric-value text-crit">{data.health.incidents}</span>
      </div>
      <div className="metric-card">
        <span className="metric-label">DB Load</span>
        <span className="metric-value">{data.health.dbLoad}</span>
      </div>
    </div>
  );

  const renderInfrastructureTable = () => (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Component</th>
            <th>Health</th>
            <th>Component</th>
            <th>Health</th>
          </tr>
        </thead>
        <tbody>
          {data.infrastructure.map((item, idx) => (
            <tr key={idx}>
              <td>{item.component1}</td>
              <td className="status-cell"><StatusIcon status={item.status1}/></td>
              <td>{item.component2}</td>
              <td className="status-cell"><StatusIcon status={item.status2}/></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderDatabasesTable = () => (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Database</th>
            <th>Type</th>
            <th>Status</th>
            <th>Replication Lag</th>
          </tr>
        </thead>
        <tbody>
          {data.databases.map((item, idx) => (
            <tr key={idx}>
              <td>{item.name}</td>
              <td>{item.type}</td>
              <td className="status-cell">
                <StatusIcon status={item.status}/> {item.statusText}
              </td>
              <td className={item.highlightLag ? 'text-warn' : ''}>{item.lag}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderExpandedWidget = () => {
    if (!expandedId) return null;

    let content, title, icon;
    switch (expandedId) {
      case 'ecommerce':
        content = renderEcommerceTable(); title = "E-Commerce & Digital"; icon = Icons.Cart; break;
      case 'pos':
        content = renderPosTable(); title = "Store Applications (POS)"; icon = Icons.Store; break;
      case 'logistics':
        content = renderLogisticsTable(); title = "Distribution Centers (DCs)"; icon = Icons.Truck; break;
      case 'payments':
        content = renderPaymentsTable(); title = "Payment Gateways"; icon = Icons.Card; break;
      case 'health':
        content = renderSystemHealth(); title = "System Health"; icon = Icons.Activity; break;
      case 'infrastructure':
        content = renderInfrastructureTable(); title = "Core Infrastructure"; icon = Icons.Server; break;
      case 'databases':
        content = renderDatabasesTable(); title = "Databases"; icon = Icons.Database; break;
      default: return null;
    }

    return (
      <div className="modal-overlay" onClick={() => setExpandedId(null)}>
        <div style={{ width: '100%', maxWidth: '1200px', height: '80vh', display: 'flex' }} onClick={e => e.stopPropagation()}>
          <Widget title={title} icon={icon} isExpanded={true} onClose={() => setExpandedId(null)} className="widget-full">
            {content}
          </Widget>
        </div>
      </div>
    );
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="header-brand">
          <svg style={{width:'32px',height:'32px',stroke:'var(--dt-light-green)',strokeWidth:'2',fill:'none',strokeLinecap:'round',strokeLinejoin:'round'}} viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          <div className="brand-group">
            <h1 className="brand-title">Dollar Tree Enterprise</h1>
            <nav className="nav-tabs">
              <button className={`nav-tab ${currentPage === 'ktlo' ? 'active' : ''}`} onClick={() => setCurrentPage('ktlo')}>KTLO Status</button>
              <button className={`nav-tab ${currentPage === 'wms' ? 'active' : ''}`} onClick={() => setCurrentPage('wms')}>WMS Dashboard</button>
            </nav>
          </div>
        </div>
        <div className="header-status">
          <button className="theme-toggle" onClick={toggleTheme} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
            {theme === 'dark' ? <Icons.Sun /> : <Icons.Moon />}
          </button>
          <div className="status-pill">
            <div className="indicator ok"></div>
            All Systems Operational
          </div>
          <div className="time-pill">
            <Icons.Clock />
            {time}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      {currentPage === 'ktlo' ? (
        <main className="dashboard-content">
          <Widget title="E-Commerce & Digital" icon={Icons.Cart} className="widget-half" delay={0.1} onExpand={() => setExpandedId('ecommerce')}>
            {renderEcommerceTable()}
          </Widget>

          <Widget title="Store Applications (POS)" icon={Icons.Store} className="widget-half" delay={0.2} onExpand={() => setExpandedId('pos')}>
            {renderPosTable()}
          </Widget>

          <Widget title="Distribution Centers (DCs)" icon={Icons.Truck} className="widget-third" delay={0.3} onExpand={() => setExpandedId('logistics')}>
            {renderLogisticsTable()}
          </Widget>

          <Widget title="Payment Gateways" icon={Icons.Card} className="widget-third" delay={0.4} onExpand={() => setExpandedId('payments')}>
            {renderPaymentsTable()}
          </Widget>

          <Widget title="System Health" icon={Icons.Activity} className="widget-third" delay={0.5} onExpand={() => setExpandedId('health')}>
            {renderSystemHealth()}
          </Widget>

          <Widget title="Core Infrastructure" icon={Icons.Server} className="widget-half" delay={0.6} onExpand={() => setExpandedId('infrastructure')}>
            {renderInfrastructureTable()}
          </Widget>

          <Widget title="Databases" icon={Icons.Database} className="widget-half" delay={0.7} onExpand={() => setExpandedId('databases')}>
            {renderDatabasesTable()}
          </Widget>
        </main>
      ) : (
        <main className="dashboard-content" style={{ display: 'flex' }}>
          <WmsDashboard />
        </main>
      )}

      {/* Render Expanded Widget Overlay (Only for KTLO) */}
      {currentPage === 'ktlo' && renderExpandedWidget()}

    </div>
  );
}

export default App;
