import React from 'react';
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
  const renderRows = (groupName, rows) => {
    return rows.map((row, idx) => (
      <tr key={`${groupName}-${idx}`} className={`row-${groupName.toLowerCase()}`}>
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
      <div className="widget-header" style={{ marginBottom: '30px' }}>
        <h3 className="widget-title" style={{ fontSize: '24px' }}>
          <svg className="icon-svg" style={{width: '28px', height: '28px'}} viewBox="0 0 24 24"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
          Warehouse Management Systems (WMS)
        </h3>
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
    </div>
  );
};

export default WmsDashboard;
