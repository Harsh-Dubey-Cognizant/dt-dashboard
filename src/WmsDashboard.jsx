import React, { useState } from 'react';
import wmsData from './wmsData.json';

const WmsStatusIcon = ({ status }) => {
  if (status === 'Ok') return <div className="status-dot ok" title="Operational"></div>;
  if (status === 'Critical') return <div className="status-dot crit" title="Down"></div>;
  if (status === 'Warning') return <div className="status-dot warn" title="Degraded"></div>;
  if (status === 'Info') return <div className="status-dot info" title="Advisory"></div>;
  if (status === 'N/A') return <span style={{color: 'var(--text-secondary)'}}>⊘</span>;
  if (status === 'Phase 2') return <span style={{color: 'var(--text-secondary)', fontSize: '12px'}}>Phase 2</span>;
  return null;
};

const WmsDashboard = () => {
  const [selectedRow, setSelectedRow] = useState(null);

  const handleRowClick = (groupName, row) => {
    setSelectedRow({ groupName, ...row });
  };

  const renderRows = (groupName, rows) => {
    return rows.map((row, idx) => (
      <tr 
        key={`${groupName}-${idx}`} 
        className={`row-${groupName.toLowerCase()} clickable-row`}
        onClick={() => handleRowClick(groupName, row)}
      >
        {idx === 0 && (
          <td rowSpan={rows.length} className={`group-cell group-${groupName.toLowerCase()}`}>
            {groupName}
          </td>
        )}
        <td className="process-cell">{row.process}</td>
        {row.statuses.map((status, sIdx) => (
          <td key={sIdx} className="wms-status-cell">
            <WmsStatusIcon status={status} />
          </td>
        ))}
      </tr>
    ));
  };

  return (
    <div className="glass-panel widget widget-full" style={{ animationDelay: '0.1s', maxHeight: 'none', height: '100%' }}>
      <div className="widget-header" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 className="widget-title" style={{ fontSize: '24px', marginBottom: '16px' }}>
            <svg className="icon-svg" style={{width: '28px', height: '28px'}} viewBox="0 0 24 24"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
            Warehouse Management Systems (WMS)
          </h3>
          <div className="wms-legend" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {wmsData.legend.map((leg, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                <WmsStatusIcon status={leg.status} />
                <span>{leg.description}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="widget-body" style={{ overflow: 'auto' }}>
        <div className="table-container" style={{ maxHeight: 'none' }}>
          <table className="data-table wms-table">
            <thead>
              <tr>
                <th style={{ textAlign: 'center', backgroundColor: 'var(--table-header-bg)', width: '100px', borderLeft: '6px solid var(--glass-border)' }}>Group</th>
                <th style={{ textAlign: 'left', backgroundColor: 'var(--table-header-bg)', width: '160px', paddingLeft: '20px' }}>Process</th>
                {wmsData.columns.map((col, idx) => (
                  <th key={idx} style={{ textAlign: 'center' }}>
                    DC {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {renderRows('Inbound', wmsData.inbound)}
              {renderRows('Outbound', wmsData.outbound)}
              {renderRows('Inventory', wmsData.inventory)}
            </tbody>
          </table>
        </div>
      </div>

      {/* Row Details Modal */}
      {selectedRow && (
        <div className="modal-overlay" onClick={() => setSelectedRow(null)}>
          <div className="glass-panel widget" onClick={e => e.stopPropagation()} style={{ width: '600px', maxWidth: '90%', padding: '32px 40px', animation: 'fadeIn 0.2s ease-out forwards' }}>
            <div className="widget-header">
              <h3 className="widget-title">
                {selectedRow.groupName} / {selectedRow.process}
              </h3>
              <button className="expand-btn" onClick={() => setSelectedRow(null)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            <div className="widget-body">
              <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: '1.6', fontSize: '15px' }}>
                <strong>Description:</strong> {selectedRow.description}
              </p>
              <h4 style={{ color: 'var(--text-primary)', marginBottom: '12px', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Distribution Center Status
              </h4>
              <div className="table-container" style={{ maxHeight: '400px' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ backgroundColor: 'var(--table-header-bg)' }}>DC Location</th>
                      <th style={{ backgroundColor: 'var(--table-header-bg)', textAlign: 'left', paddingLeft: '24px' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedRow.statuses.map((status, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 500 }}>DC {wmsData.columns[idx]}</td>
                        <td style={{ textAlign: 'left', paddingLeft: '24px' }}>
                           <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '10px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                             <WmsStatusIcon status={status} />
                             <span>{status}</span>
                           </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WmsDashboard;
