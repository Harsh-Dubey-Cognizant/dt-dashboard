import React, { useState } from 'react';
import wmsData from '../db/wmsData.json';

// ── Status dot in the table ───────────────────────────────────────────────────
const WmsStatusIcon = ({ status }) => {
  if (status === 'Ok')       return <div className="status-dot ok"   title="Operational"></div>;
  if (status === 'Critical') return <div className="status-dot crit" title="Down"></div>;
  if (status === 'Warning')  return <div className="status-dot warn" title="Degraded"></div>;
  if (status === 'Info')     return <div className="status-dot info" title="Advisory"></div>;
  if (status === 'N/A')      return <span style={{ color: 'var(--text-secondary)' }}>⊘</span>;
  if (status === 'Phase 2')  return <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Phase 2</span>;
  if (!status || status === '') return null;
  return null;
};

// ── Colour tokens ────────────────────────────────────────────────────────────
const SC = {
  ok:     { bg: 'rgba(34,197,94,0.10)',  border: 'rgba(34,197,94,0.30)',  text: '#16a34a', dot: '#22c55e' },
  warn:   { bg: 'rgba(234,179,8,0.10)',  border: 'rgba(234,179,8,0.30)',  text: '#ca8a04', dot: '#eab308' },
  crit:   { bg: 'rgba(239,68,68,0.10)',  border: 'rgba(239,68,68,0.30)',  text: '#dc2626', dot: '#ef4444' },
  na:     { bg: 'rgba(100,116,139,0.08)',border: 'rgba(100,116,139,0.20)',text: '#64748b', dot: '#94a3b8' },
  phase2: { bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.20)', text: '#4338ca', dot: '#6366f1' },
};
const getStyle = s => SC[s] || SC.na;

// ── DC detail modal — opens when a DC card is clicked ────────────────────────
const DCDetailModal = ({ dc, kpiName, onClose }) => {
  if (!dc) return null;
  const { dc: name, code, wmsType, status, metrics = [] } = dc;
  const s = getStyle(status);

  const issues  = metrics.filter(m => m.status === 'crit' || m.status === 'warn');
  const healthy = metrics.filter(m => m.status !== 'crit' && m.status !== 'warn');

  const statusLabel = status === 'crit' ? 'Critical' : status === 'warn' ? 'Warning' : status === 'ok' ? 'Operational' : status;

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(20px)', border: `1px solid ${s.border}`, borderRadius: '16px', width: '100%', maxWidth: '580px', height: '100%', maxHeight: '80vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ background: s.bg, padding: '16px 20px', borderBottom: `1px solid ${s.border}`, display: 'flex', alignItems: 'flex-start', gap: '12px', flexShrink: 0 }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: s.dot, flexShrink: 0, marginTop: '4px', boxShadow: `0 0 8px ${s.dot}` }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: '16px', color: 'var(--text-primary)' }}>{name} {code ? `(${code})` : ''}</div>
            {wmsType && <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>WMS Type: {wmsType}</div>}
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>KPI: {kpiName}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: s.text }}>{statusLabel}</span>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '18px', lineHeight: 1 }}>✕</button>
          </div>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Issues section */}
          {issues.length > 0 && (
            <div>
              <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '10px', paddingBottom: '6px', borderBottom: '1px solid var(--glass-border)' }}>
                {issues.some(m => m.status === 'crit') ? '🔴 Issues Detected' : '🟡 Warnings'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {issues.map((m, i) => {
                  const ms = getStyle(m.status);
                  return (
                    <div key={i} style={{
                      background: 'var(--widget-bg)',
                      border: '1px solid var(--glass-border)',
                      borderLeft: `4px solid ${ms.dot}`,
                      borderRadius: '8px',
                      padding: '12px 14px',
                      display: 'flex', alignItems: 'center', gap: '14px',
                    }}>
                      {/* Glowing dot */}
                      <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: ms.dot, flexShrink: 0, boxShadow: `0 0 8px ${ms.dot}` }} />

                      {/* Label + value */}
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '3px' }}>{m.label}</div>
                        <div style={{ fontSize: '20px', fontWeight: 800, color: ms.text, lineHeight: 1 }}>{m.value}</div>
                      </div>

                      {/* Status badge — tinted pill */}
                      <span style={{
                        fontSize: '10px', fontWeight: 700, letterSpacing: '0.4px',
                        color: ms.text,
                        background: ms.bg,
                        border: `1px solid ${ms.border}`,
                        borderRadius: '20px',
                        padding: '3px 10px',
                        textTransform: 'uppercase',
                        flexShrink: 0,
                      }}>
                        {m.status === 'crit' ? 'Critical' : 'Warning'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* All clear banner when no issues */}
          {issues.length === 0 && (
            <div style={{ background: SC.ok.bg, border: `1px solid ${SC.ok.border}`, borderRadius: '8px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: SC.ok.dot }} />
              <span style={{ fontSize: '13px', fontWeight: 600, color: SC.ok.text }}>No issues detected — all metrics healthy</span>
            </div>
          )}

          {/* Healthy metrics */}
          {healthy.length > 0 && (
            <div>
              <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '10px', paddingBottom: '6px', borderBottom: '1px solid var(--glass-border)' }}>
                Healthy Metrics
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px' }}>
                {healthy.map((m, i) => {
                  const ms = getStyle(m.status);
                  return (
                    <div key={i} style={{ background: ms.bg, border: `1px solid ${ms.border}`, borderRadius: '8px', padding: '10px 12px' }}>
                      <div style={{ fontSize: '9px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '4px' }}>{m.label}</div>
                      <div style={{ fontSize: '16px', fontWeight: 700, color: ms.text }}>{m.value}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

// ── Single DC card shown inside the KPI modal ─────────────────────────────────
const DCCard = ({ dc, wmsType, status, metrics, onSelect }) => {
  const s = getStyle(status);
  const isBlank = status === 'na' || status === 'phase2';
  const clickable = !isBlank && onSelect;

  const issueCount = (metrics || []).filter(m => m.status === 'crit' || m.status === 'warn').length;

  return (
    <div
      onClick={clickable ? onSelect : undefined}
      style={{ border: `1px solid ${s.border}`, borderRadius: '10px', overflow: 'hidden', background: 'var(--widget-bg)', cursor: clickable ? 'pointer' : 'default', transition: 'transform 0.18s ease, box-shadow 0.18s ease' }}
      onMouseEnter={e => { if (clickable) { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 8px 24px rgba(0,0,0,0.3), 0 0 0 2px ${s.border}`; } }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      {/* Card header */}
      <div style={{ background: s.bg, padding: '10px 14px', borderBottom: `1px solid ${s.border}`, display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: s.dot, flexShrink: 0, boxShadow: !isBlank ? `0 0 6px ${s.dot}` : 'none' }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)' }}>{dc}</div>
          {wmsType && <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '1px' }}>{wmsType}</div>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {issueCount > 0 && (
            <span style={{ fontSize: '9px', fontWeight: 700, color: status === 'crit' ? '#dc2626' : '#ca8a04', background: status === 'crit' ? 'rgba(239,68,68,0.12)' : 'rgba(234,179,8,0.12)', border: `1px solid ${s.border}`, borderRadius: '4px', padding: '1px 6px' }}>
              {issueCount} issue{issueCount > 1 ? 's' : ''}
            </span>
          )}
          <div style={{ fontSize: '11px', fontWeight: 600, color: s.text, textTransform: 'capitalize' }}>
            {status === 'na' ? 'N/A' : status === 'phase2' ? 'Phase 2' : status.charAt(0).toUpperCase() + status.slice(1)}
          </div>
          {clickable && <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>details →</span>}
        </div>
      </div>

      {/* Metrics body */}
      <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {isBlank ? (
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
            {status === 'phase2' ? 'Planned for Phase 2 — not yet live' : 'Not applicable at this DC'}
          </div>
        ) : (
          <>
            {/* Issue metrics — prominent rows */}
            {(metrics || []).filter(m => m.status === 'crit' || m.status === 'warn').length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ fontSize: '8px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                  {(metrics || []).some(m => m.status === 'crit') ? '🔴 Issues' : '🟡 Warnings'}
                </div>
                {(metrics || []).filter(m => m.status === 'crit' || m.status === 'warn').map((m, i) => {
                  const ms = getStyle(m.status);
                  return (
                    <div key={i} style={{ background: ms.bg, border: `1px solid ${ms.border}`, borderRadius: '6px', padding: '6px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{m.label}</span>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: ms.text }}>{m.value}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Healthy metrics — color-coded tiles */}
            {(metrics || []).filter(m => m.status !== 'crit' && m.status !== 'warn').length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '8px' }}>
                {(metrics || []).filter(m => m.status !== 'crit' && m.status !== 'warn').map((m, i) => {
                  const ms = getStyle(m.status);
                  return (
                    <div key={i} style={{ background: ms.bg, border: `1px solid ${ms.border}`, borderRadius: '6px', padding: '8px 10px' }}>
                      <div style={{ fontSize: '9px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '4px' }}>{m.label}</div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: ms.text }}>{m.value}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// ── KPI drill-down modal (full screen) ────────────────────────────────────────
const KPIModal = ({ kpiDetail, onClose }) => {
  const [selectedDC, setSelectedDC] = useState(null);
  const { kpiId, kpiName, primaryKPI, secondaryKPI, monitoringItem, layer, priority, dcData } = kpiDetail;

  const priorityColor = priority === 'Critical' ? '#dc2626' : priority === 'High' ? '#d97706' : '#2563eb';

  return (
    <div className="modal-overlay" onClick={onClose} style={{ padding: 0, alignItems: 'stretch' }}>
      <div onClick={e => e.stopPropagation()} style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: 'var(--glass-bg)', backdropFilter: 'blur(20px)' }}>

        {/* Header */}
        <div style={{ padding: '20px 28px 16px', borderBottom: '1px solid var(--glass-border)', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <span style={{ background: priorityColor, color: '#fff', fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', letterSpacing: '0.6px' }}>
                  KPI {kpiId}
                </span>
                <span style={{ fontSize: '10px', color: priorityColor, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                  {priority}
                </span>
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px' }}>{kpiName}</h2>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>{monitoringItem}</p>
            </div>
            <button className="expand-btn" onClick={onClose}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          {/* Meta pills */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '14px' }}>
            {[
              { label: 'Primary KPI',   value: primaryKPI },
              { label: 'Secondary KPI', value: secondaryKPI },
            ].map((p, i) => (
              <div key={i} style={{ background: 'var(--widget-bg)', border: '1px solid var(--glass-border)', borderRadius: '6px', padding: '5px 12px' }}>
                <div style={{ fontSize: '9px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{p.label}</div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>{p.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* DC cards grid — scrollable */}
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '24px 28px' }}>

          {/* ── Flagged DCs summary ─────────────────────────────────────── */}
          {(() => {
            const flagged = dcData.filter(dc => dc.status === 'crit');
            if (!flagged.length) return null;
            const hasCrit = flagged.some(dc => dc.status === 'crit');
            const critCol = { bg: 'rgba(239,68,68,0.10)', border: 'rgba(239,68,68,0.30)', text: '#dc2626', dot: '#ef4444' };
            const warnCol = { bg: 'rgba(234,179,8,0.10)',  border: 'rgba(234,179,8,0.30)',  text: '#ca8a04', dot: '#eab308' };
            return (
              <div style={{ marginBottom: '28px' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '10px', paddingBottom: '6px', borderBottom: '1px solid var(--glass-border)' }}>
                  {hasCrit ? '🔴 Immediate Attention Required' : '🟡 DCs Requiring Review'}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {flagged.sort((a, b) => a.status === 'crit' ? -1 : 1).map((dc, i) => {
                    const c = dc.status === 'crit' ? critCol : warnCol;
                    const badMetrics = (dc.metrics || []).filter(m => m.status === 'crit' || m.status === 'warn');
                    return (
                      <div key={i} style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: '8px', padding: '10px 14px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: c.dot, flexShrink: 0, marginTop: '4px', boxShadow: `0 0 6px ${c.dot}` }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)' }}>{dc.dc}</div>
                          {dc.wmsType && <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '1px' }}>{dc.wmsType}</div>}
                          {badMetrics.length > 0 && (
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                              {badMetrics.map((m, j) => (
                                <span key={j} style={{ fontSize: '11px', color: c.text, fontWeight: 600, background: 'var(--widget-bg)', border: `1px solid ${c.border}`, borderRadius: '4px', padding: '2px 8px' }}>
                                  {m.label}: {m.value}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: c.text, textTransform: 'capitalize', flexShrink: 0 }}>
                          {dc.status === 'crit' ? 'Critical' : 'Warning'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* ── All DC cards ────────────────────────────────────────────── */}
          <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '16px', paddingBottom: '6px', borderBottom: '1px solid var(--glass-border)' }}>
            All Distribution Centers ({dcData.length}) — click a card for more details
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
            {dcData.map((dc, i) => (
              <DCCard
                key={i}
                dc={dc.dc} wmsType={dc.wmsType} status={dc.status} metrics={dc.metrics || []}
                onSelect={() => setSelectedDC(dc)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* DC detail modal — rendered on top of KPI modal */}
      {selectedDC && (
        <DCDetailModal
          dc={selectedDC}
          kpiName={kpiName}
          onClose={() => setSelectedDC(null)}
        />
      )}
    </div>
  );
};

// ── Main dashboard ────────────────────────────────────────────────────────────
const WmsDashboard = () => {
  const [activeKPI, setActiveKPI] = useState(null);

  const handleDoubleClick = (row) => {
    if (row.kpiDetail) setActiveKPI(row.kpiDetail);
  };

  const renderRows = (groupName, rows) => {
    return rows.map((row, idx) => {
      const hasKPI = !!row.kpiDetail;
      return (
        <tr
          key={`${groupName}-${idx}`}
          className={`row-${groupName.toLowerCase()} ${hasKPI ? 'clickable-row' : ''}`}
          onDoubleClick={() => handleDoubleClick(row)}
          title={hasKPI ? `KPI — double-click to drill down` : undefined}
          style={{ cursor: hasKPI ? 'pointer' : 'default' }}
        >
          {idx === 0 && (
            <td rowSpan={rows.length} className={`group-cell group-${groupName.toLowerCase()}`}>
              {groupName}
            </td>
          )}
          <td className="process-cell">
            {row.process}
            {hasKPI && (
              <span style={{
                marginLeft: '8px', fontSize: '9px', fontWeight: 700,
                background: 'var(--glass-border)', color: 'var(--text-secondary)',
                borderRadius: '3px', padding: '1px 5px', letterSpacing: '0.3px',
              }}>
                KPI
              </span>
            )}
          </td>
          {row.statuses.map((status, sIdx) => (
            <td key={sIdx} className="wms-status-cell">
              <WmsStatusIcon status={status} />
            </td>
          ))}
        </tr>
      );
    });
  };

  return (
    <div className="glass-panel widget widget-full" style={{ animationDelay: '0.1s', maxHeight: 'none', height: '100%' }}>
      <div className="widget-header" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 className="widget-title" style={{ fontSize: '24px', marginBottom: '16px' }}>
            <svg className="icon-svg" style={{ width: '28px', height: '28px' }} viewBox="0 0 24 24">
              <rect x="1" y="3" width="15" height="13"></rect>
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
              <circle cx="5.5" cy="18.5" r="2.5"></circle>
              <circle cx="18.5" cy="18.5" r="2.5"></circle>
            </svg>
            Distribution Center Management System
          </h3>
          <div className="wms-legend" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
            {wmsData.legend.map((leg, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                <WmsStatusIcon status={leg.status} />
                <span>{leg.description}</span>
              </div>
            ))}
            <div style={{ borderLeft: '1px solid var(--glass-border)', paddingLeft: '14px', fontSize: '12px', color: 'var(--text-secondary)' }}>
              <span style={{ background: 'var(--glass-border)', padding: '1px 5px', borderRadius: '3px', fontSize: '9px', fontWeight: 700, marginRight: '6px' }}>KPI n</span>
              Double-click to drill into DC-level metrics
            </div>
          </div>
        </div>
      </div>

      <div className="widget-body" style={{ overflow: 'auto' }}>
        <div className="table-container" style={{ maxHeight: 'none' }}>
          <table className="data-table wms-table">
            <thead>
              <tr>
                <th style={{ textAlign: 'center', backgroundColor: 'var(--table-header-bg)', width: '100px', borderLeft: '6px solid var(--glass-border)' }}>Group</th>
                <th style={{ textAlign: 'left', backgroundColor: 'var(--table-header-bg)', width: '180px', paddingLeft: '20px' }}>Process</th>
                {wmsData.columns.map((col, idx) => (
                  <th key={idx} style={{ textAlign: 'center' }}>{col}</th>
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

      {activeKPI && <KPIModal kpiDetail={activeKPI} onClose={() => setActiveKPI(null)} />}
    </div>
  );
};

export default WmsDashboard;
