import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import './App.css';
import dashboardData from '../db/data.json';
import wmsData from '../db/wmsData.json';
import WmsDashboard from './WmsDashboard';
import EcommerceDetail from './EcommerceDetail';
import PosDetail from './PosDetail';

// ── Icons ─────────────────────────────────────────────────────────────────────
const Icons = {
  Store:    () => <svg className="icon-svg" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>,
  Cart:     () => <svg className="icon-svg" viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>,
  Truck:    () => <svg className="icon-svg" viewBox="0 0 24 24"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>,
  Card:     () => <svg className="icon-svg" viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>,
  Activity: () => <svg className="icon-svg" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>,
  Server:   () => <svg className="icon-svg" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect><rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect><line x1="6" y1="6" x2="6.01" y2="6"></line><line x1="6" y1="18" x2="6.01" y2="18"></line></svg>,
  Database: () => <svg className="icon-svg" viewBox="0 0 24 24"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>,
  Clock:    () => <svg className="icon-svg" style={{stroke:'var(--text-secondary)',width:'16px',height:'16px'}} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>,
  Maximize: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>,
  X:        () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>,
  Sun:      () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>,
  Moon:     () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>,
};

// ── Collect all critical items from both data sources ────────────────────────
function collectCriticals(data, wms) {
  const items = [];

  const KTLO_SEGS = [
    { key: 'ecommerce',      label: 'E-Commerce & Digital',    nameField: 'system'    },
    { key: 'pos',            label: 'Store Applications (POS)', nameField: 'application' },
    { key: 'logistics',      label: 'Distribution Centers (DCs)', nameField: 'location'  },
    { key: 'payments',       label: 'Payment Gateways',        nameField: 'provider'  },
    { key: 'databases',      label: 'Databases',               nameField: 'name'      },
  ];

  KTLO_SEGS.forEach(({ key, label, nameField }) => {
    (data[key] || []).filter(i => i.status === 'crit').forEach(i => {
      items.push({ name: i[nameField] || i.name || i.system, segment: label, source: 'ktlo', segKey: key });
    });
  });

  // Infrastructure — paired components (component1/status1, component2/status2)
  (data.infrastructure || []).forEach(row => {
    if (row.status1 === 'crit') items.push({ name: row.component1, segment: 'Core Infrastructure', source: 'ktlo', segKey: 'infrastructure' });
    if (row.status2 === 'crit') items.push({ name: row.component2, segment: 'Core Infrastructure', source: 'ktlo', segKey: 'infrastructure' });
  });

  // Health summary
  (data.healthSummary || []).filter(m => m.status === 'crit').forEach(m => {
    items.push({ name: m.label, segment: 'System Health', source: 'ktlo', segKey: 'health' });
  });

  // WMS — group by DC, list affected processes
  const wmsDCs = {};
  [...(wms.inbound || []), ...(wms.outbound || [])].forEach(proc => {
    (proc.kpiDetail?.dcData || []).filter(dc => dc.status === 'crit').forEach(dc => {
      const key = dc.code || dc.dc;
      if (!wmsDCs[key]) wmsDCs[key] = { name: dc.dc, code: dc.code, processes: [] };
      wmsDCs[key].processes.push(proc.process);
    });
  });
  Object.values(wmsDCs).forEach(dc => {
    items.push({
      name: `${dc.name}${dc.code ? ` (${dc.code})` : ''}`,
      segment: 'Distribution Centers (DCs)',
      source: 'wms',
      segKey: 'wms',
      detail: dc.processes.join(', '),
    });
  });

  return items;
}

// ── Critical Alert Bar ────────────────────────────────────────────────────────
const CriticalAlertBar = ({ criticals }) => {
  const [open, setOpen] = useState(false);
  if (!criticals.length) return null;

  // Group by segment for the modal
  const grouped = criticals.reduce((acc, item) => {
    if (!acc[item.segment]) acc[item.segment] = [];
    acc[item.segment].push(item);
    return acc;
  }, {});

  return (
    <>
      {/* Alert banner */}
      <div
        onClick={() => setOpen(true)}
        style={{
          background: 'rgba(239,68,68,0.09)',
          borderBottom: '2px solid rgba(239,68,68,0.30)',
          padding: '14px 32px',
          display: 'flex', alignItems: 'center', gap: '18px',
          cursor: 'pointer',
          userSelect: 'none',
          transition: 'background 0.2s ease',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.14)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.09)'}
      >
        {/* Pulsing dot */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 8px #ef4444' }} />
          <div style={{ position: 'absolute', inset: '-4px', borderRadius: '50%', border: '2px solid rgba(239,68,68,0.40)', animation: 'ping 1.4s ease-in-out infinite' }} />
        </div>

        <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', flexShrink: 0 }}>
          Priority Escalations
        </span>

        {/* Count badge */}
        <span style={{
          background: 'rgba(239,68,68,0.18)', border: '1px solid rgba(239,68,68,0.40)',
          borderRadius: '20px', padding: '4px 14px',
          fontSize: '14px', fontWeight: 800, color: '#dc2626', flexShrink: 0,
        }}>
          {criticals.length}
        </span>

        <div style={{ flex: 1 }} />

        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', flexShrink: 0 }}>View All →</span>
      </div>

      {/* Modal */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--glass-bg)', backdropFilter: 'blur(20px)',
              border: '1px solid rgba(239,68,68,0.28)',
              borderRadius: '16px', width: '100%', maxWidth: '960px',
              height: '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden',
            }}
          >
            {/* Modal header */}
            <div style={{
              background: 'rgba(239,68,68,0.07)', padding: '18px 24px',
              borderBottom: '1px solid rgba(239,68,68,0.20)',
              display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0,
            }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 10px #ef4444', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: '16px', color: '#dc2626' }}>Priority Escalations</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {criticals.length} component{criticals.length !== 1 ? 's' : ''} requiring immediate attention across {Object.keys(grouped).length} segment{Object.keys(grouped).length !== 1 ? 's' : ''}
                </div>
              </div>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '20px', lineHeight: 1 }}>✕</button>
            </div>

            {/* Grouped list */}
            <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
              {Object.entries(grouped).map(([segment, segItems]) => (
                <div key={segment}>
                  {/* Segment header */}
                  <div style={{
                    fontSize: '9px', fontWeight: 700, letterSpacing: '1.2px',
                    textTransform: 'uppercase', color: 'var(--text-secondary)',
                    marginBottom: '10px', paddingBottom: '6px',
                    borderBottom: '1px solid var(--glass-border)',
                    display: 'flex', justifyContent: 'space-between',
                  }}>
                    <span>{segment}</span>
                    <span style={{ color: '#dc2626' }}>{segItems.length} critical</span>
                  </div>

                  {/* Items */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {segItems.map((item, i) => (
                      <div key={i} style={{
                        background: 'var(--widget-bg)',
                        border: '1px solid var(--glass-border)',
                        borderLeft: '4px solid #ef4444',
                        borderRadius: '8px', padding: '11px 14px',
                        display: 'flex', alignItems: 'center', gap: '12px',
                      }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 7px #ef4444', flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)' }}>{item.name}</div>
                          {item.detail && (
                            <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '3px' }}>
                              Affected processes: {item.detail}
                            </div>
                          )}
                        </div>
                        <span style={{
                          fontSize: '10px', fontWeight: 700, letterSpacing: '0.3px',
                          background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.28)',
                          borderRadius: '20px', padding: '3px 10px', color: '#dc2626', flexShrink: 0,
                        }}>
                          Critical
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const StatusIcon = ({ status }) => {
  if (status === 'ok')   return <svg style={{width:'16px',height:'16px',stroke:'var(--status-ok)',strokeWidth:'3',fill:'none',strokeLinecap:'round',strokeLinejoin:'round'}} viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>;
  if (status === 'warn') return <svg style={{width:'16px',height:'16px',stroke:'var(--status-warn)',strokeWidth:'2',fill:'none',strokeLinecap:'round',strokeLinejoin:'round'}} viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>;
  if (status === 'crit') return <svg style={{width:'16px',height:'16px',stroke:'var(--status-crit)',strokeWidth:'2',fill:'none',strokeLinecap:'round',strokeLinejoin:'round'}} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>;
  return null;
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const SC = {
  ok:   { bg: 'rgba(34,197,94,0.10)',  border: 'rgba(34,197,94,0.28)',  text: '#16a34a', dot: '#22c55e' },
  warn: { bg: 'rgba(234,179,8,0.10)',  border: 'rgba(234,179,8,0.28)',  text: '#ca8a04', dot: '#eab308' },
  crit: { bg: 'rgba(239,68,68,0.10)',  border: 'rgba(239,68,68,0.28)',  text: '#dc2626', dot: '#ef4444' },
};

const worstStatus = (metrics = []) => {
  if (metrics.some(m => m.status === 'crit')) return 'crit';
  if (metrics.some(m => m.status === 'warn')) return 'warn';
  return 'ok';
};

// Badge shown on the card — single line, no metrics
const BADGE = {
  crit: { label: 'Needs Attention',     bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.35)',  text: '#dc2626', pulse: true  },
  warn: { label: 'Under Observation',   bg: 'rgba(234,179,8,0.10)',  border: 'rgba(234,179,8,0.32)',  text: '#ca8a04', pulse: false },
  ok:   { label: 'Running Smoothly',    bg: 'rgba(34,197,94,0.10)',  border: 'rgba(34,197,94,0.28)',  text: '#16a34a', pulse: false },
};

const OverallStatusBadge = ({ level }) => {
  const b = BADGE[level] || BADGE.ok;
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: '7px',
      background: b.bg, border: `1px solid ${b.border}`,
      borderRadius: '20px', padding: '4px 12px', marginBottom: '12px',
    }}>
      <span style={{
        width: '7px', height: '7px', borderRadius: '50%',
        background: b.text, flexShrink: 0,
        boxShadow: b.pulse ? `0 0 0 2px ${b.border}` : 'none',
      }} />
      <span style={{ fontSize: '11px', fontWeight: 700, color: b.text, letterSpacing: '0.3px' }}>
        {b.label}
      </span>
    </div>
  );
};

// ── Big metric card (in expanded modal) ───────────────────────────────────────
const BigMetricCard = ({ label, value, status }) => {
  const s = SC[status] || SC.ok;
  return (
    <div style={{
      background: s.bg, border: `1px solid ${s.border}`,
      borderRadius: '12px', padding: '20px 24px',
      display: 'flex', flexDirection: 'column', gap: '6px',
      flex: '1 1 160px',
    }}>
      <span style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
        {label}
      </span>
      <span style={{ fontSize: '32px', fontWeight: 800, color: s.text, lineHeight: 1 }}>
        {value}
      </span>
    </div>
  );
};

// ── Flagged issue row (in expanded modal) ─────────────────────────────────────
const FlaggedItem = ({ name, subtitle, status, badMetrics }) => {
  const s = SC[status] || SC.warn;
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: '12px',
      background: s.bg, border: `1px solid ${s.border}`,
      borderRadius: '8px', padding: '10px 14px',
    }}>
      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.text, flexShrink: 0, marginTop: '4px', boxShadow: `0 0 6px ${s.text}` }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)' }}>{name}</div>
        {subtitle && <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '1px' }}>{subtitle}</div>}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
          {badMetrics.map((m, i) => (
            <span key={i} style={{ fontSize: '11px', color: s.text, fontWeight: 600, background: 'var(--widget-bg)', border: `1px solid ${s.border}`, borderRadius: '4px', padding: '2px 8px' }}>
              {m.label}: {m.value}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── Per-item detail card (in expanded modal) ──────────────────────────────────
const parseNum = str => parseFloat(String(str).replace(/[^0-9.]/g, '')) || 0;

// ── Detect metric unit type ───────────────────────────────────────────────────
const metricType = val => {
  const v = String(val);
  if (v.includes('%'))                          return 'percent';
  if (v.includes('ms'))                         return 'ms';
  if (/[\d.]+\s*s$/.test(v.trim()))            return 'seconds';
  return 'count';
};

// ── Arc gauge — for percentages (0–100%) ──────────────────────────────────────
const ArcGauge = ({ value, label, status }) => {
  const pct = Math.min(Math.max(parseNum(value), 0), 100);
  const c = SC[status] || SC.ok;
  const R = 48, cx = 60, cy = 58;
  const toRad = deg => (deg * Math.PI) / 180;
  const pt = deg => ({
    x: cx + R * Math.cos(toRad(deg)),
    y: cy + R * Math.sin(toRad(deg)),
  });
  // arc from 210° to 330° = 120° sweep; filled portion scales with pct
  const startDeg = 210, totalDeg = 120;
  const filledDeg = (pct / 100) * totalDeg;
  const endDeg = startDeg + filledDeg;
  const s1 = pt(startDeg), e1 = pt(startDeg + totalDeg);
  const sf = pt(startDeg), ef = pt(endDeg);
  const lg1 = totalDeg > 180 ? 1 : 0;
  const lg2 = filledDeg > 180 ? 1 : 0;

  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'4px' }}>
      <svg width="120" height="80" viewBox="0 0 120 80">
        {/* track */}
        <path d={`M ${s1.x} ${s1.y} A ${R} ${R} 0 ${lg1} 1 ${e1.x} ${e1.y}`}
          fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="9" strokeLinecap="round" />
        {/* filled */}
        {pct > 0 && (
          <path d={`M ${sf.x} ${sf.y} A ${R} ${R} 0 ${lg2} 1 ${ef.x} ${ef.y}`}
            fill="none" stroke={c.dot} strokeWidth="9" strokeLinecap="round" />
        )}
        <text x={cx} y={cy + 4} textAnchor="middle" fontSize="15" fontWeight="800" fill={c.text}>{value}</text>
      </svg>
      <div style={{ fontSize:'10px', color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'0.5px', textAlign:'center' }}>{label}</div>
    </div>
  );
};

// ── Horizontal bar gauge — for time values (ms / seconds) ────────────────────
const TimeGauge = ({ value, label, status }) => {
  const c = SC[status] || SC.ok;
  const num = parseNum(value);
  const isMs = String(value).includes('ms');
  // contextual max: 2000 ms or 15 s
  const max = isMs ? 2000 : 15;
  const pct = Math.min((num / max) * 100, 100);
  const thresholds = isMs
    ? [{ at: 30, label:'300ms' }, { at: 60, label:'1200ms' }]
    : [{ at: 20, label:'3s' },   { at: 60, label:'9s' }];

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
        <span style={{ fontSize:'10px', color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'0.5px' }}>{label}</span>
        <span style={{ fontSize:'18px', fontWeight:'800', color:c.text }}>{value}</span>
      </div>
      {/* bar */}
      <div style={{ position:'relative', height:'10px', background:'rgba(255,255,255,0.08)', borderRadius:'6px', overflow:'visible' }}>
        <div style={{ width:`${pct}%`, height:'100%', background:c.dot, borderRadius:'6px', transition:'width 0.4s' }} />
        {/* threshold ticks */}
        {thresholds.map((t, i) => (
          <div key={i} style={{ position:'absolute', top:'-4px', left:`${t.at}%`, width:'2px', height:'18px', background:'rgba(255,255,255,0.25)', borderRadius:'1px' }}>
            <span style={{ position:'absolute', top:'20px', left:'-10px', fontSize:'8px', color:'var(--text-secondary)', whiteSpace:'nowrap' }}>{t.label}</span>
          </div>
        ))}
      </div>
      <div style={{ display:'flex', justifyContent:'space-between', fontSize:'8px', color:'var(--text-secondary)', marginTop:'8px' }}>
        <span>0</span><span style={{ color:'#22c55e' }}>Good</span><span style={{ color:'#eab308' }}>Warn</span><span style={{ color:'#ef4444' }}>Critical</span>
      </div>
    </div>
  );
};

// ── Count display — for session counts, store counts, etc. ────────────────────
const CountDisplay = ({ value, label, status }) => {
  const c = SC[status] || SC.ok;
  return (
    <div style={{ background:c.bg, border:`1px solid ${c.border}`, borderRadius:'10px', padding:'14px 16px', display:'flex', flexDirection:'column', gap:'6px' }}>
      <span style={{ fontSize:'10px', color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'0.5px' }}>{label}</span>
      <span style={{ fontSize:'28px', fontWeight:'800', color:c.text, lineHeight:1 }}>{value}</span>
    </div>
  );
};

// ── Per-metric visualisation picker ──────────────────────────────────────────
const MetricViz = ({ label, value, status }) => {
  const type = metricType(value);
  if (type === 'percent')  return <ArcGauge  label={label} value={value} status={status} />;
  if (type === 'ms' || type === 'seconds') return <TimeGauge label={label} value={value} status={status} />;
  return <CountDisplay label={label} value={value} status={status} />;
};

// ── Deep-drill chart modal (E-Commerce & POS only) ────────────────────────────
const ItemDetailModal = ({ item, onClose }) => {
  if (!item) return null;
  const { name, subtitle, overallStatus, metrics = [] } = item;
  const s = SC[overallStatus] || SC.ok;

  // separate by type so layout can be tailored
  const pctMetrics   = metrics.filter(m => metricType(m.value) === 'percent');
  const timeMetrics  = metrics.filter(m => metricType(m.value) === 'ms' || metricType(m.value) === 'seconds');
  const countMetrics = metrics.filter(m => metricType(m.value) === 'count');

  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:200, background:'rgba(0,0,0,0.65)', display:'flex', alignItems:'center', justifyContent:'center', padding:'32px' }}>
      <div onClick={e => e.stopPropagation()} style={{ background:'var(--glass-bg)', backdropFilter:'blur(20px)', border:`1px solid ${s.border}`, borderRadius:'16px', width:'100%', maxWidth:'700px', maxHeight:'90vh', display:'flex', flexDirection:'column', overflow:'hidden' }}>

        {/* Header */}
        <div style={{ background:s.bg, padding:'16px 20px', borderBottom:`1px solid ${s.border}`, display:'flex', alignItems:'center', gap:'10px', flexShrink:0 }}>
          <div style={{ width:'10px', height:'10px', borderRadius:'50%', background:s.dot, boxShadow:`0 0 8px ${s.dot}` }} />
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:700, fontSize:'15px', color:'var(--text-primary)' }}>{name}</div>
            {subtitle && <div style={{ fontSize:'11px', color:'var(--text-secondary)', marginTop:'2px' }}>{subtitle}</div>}
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'var(--text-secondary)', cursor:'pointer', fontSize:'20px', lineHeight:1 }}>✕</button>
        </div>

        {/* Scrollable body */}
        <div style={{ overflowY:'auto', padding:'20px', display:'flex', flexDirection:'column', gap:'24px' }}>

          {/* Percentage gauges row */}
          {pctMetrics.length > 0 && (
            <div>
              <div style={{ fontSize:'9px', fontWeight:700, letterSpacing:'1px', textTransform:'uppercase', color:'var(--text-secondary)', marginBottom:'14px' }}>Percentage Metrics</div>
              <div style={{ display:'flex', gap:'8px', flexWrap:'wrap', justifyContent:'space-around' }}>
                {pctMetrics.map((m, i) => <ArcGauge key={i} label={m.label} value={m.value} status={m.status} />)}
              </div>
            </div>
          )}

          {/* Time gauges — each on its own row */}
          {timeMetrics.length > 0 && (
            <div>
              <div style={{ fontSize:'9px', fontWeight:700, letterSpacing:'1px', textTransform:'uppercase', color:'var(--text-secondary)', marginBottom:'14px' }}>Time Metrics</div>
              <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>
                {timeMetrics.map((m, i) => (
                  <div key={i} style={{ background:'var(--widget-bg)', border:'1px solid var(--glass-border)', borderRadius:'10px', padding:'14px 16px' }}>
                    <TimeGauge label={m.label} value={m.value} status={m.status} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Count cards */}
          {countMetrics.length > 0 && (
            <div>
              <div style={{ fontSize:'9px', fontWeight:700, letterSpacing:'1px', textTransform:'uppercase', color:'var(--text-secondary)', marginBottom:'14px' }}>Count Metrics</div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(140px, 1fr))', gap:'10px' }}>
                {countMetrics.map((m, i) => <CountDisplay key={i} label={m.label} value={m.value} status={m.status} />)}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

// ── Item card — plain (no chart), used for segments 3-7 ──────────────────────
const ItemCard = ({ name, subtitle, overallStatus, metrics, onSelect }) => {
  const s = SC[overallStatus] || SC.ok;
  const clickable = !!onSelect;
  return (
    <div
      onClick={onSelect}
      style={{ border:`1px solid ${s.border}`, borderRadius:'10px', overflow:'hidden', background:'var(--widget-bg)', cursor: clickable ? 'pointer' : 'default', transition:'transform 0.18s ease, box-shadow 0.18s ease' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = clickable ? `0 8px 24px rgba(0,0,0,0.3), 0 0 0 2px ${s.border}` : '0 8px 24px rgba(0,0,0,0.25)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      <div style={{ background:s.bg, padding:'10px 14px', borderBottom:`1px solid ${s.border}`, display:'flex', alignItems:'center', gap:'8px' }}>
        <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:s.dot, flexShrink:0, boxShadow: overallStatus !== 'ok' ? `0 0 6px ${s.dot}` : 'none' }} />
        <div style={{ flex:1 }}>
          <div style={{ fontWeight:700, fontSize:'13px', color:'var(--text-primary)' }}>{name}</div>
          {subtitle && <div style={{ fontSize:'11px', color:'var(--text-secondary)', marginTop:'1px' }}>{subtitle}</div>}
        </div>
        {clickable && <span style={{ fontSize:'10px', color:'var(--text-secondary)', letterSpacing:'0.2px' }}>details →</span>}
      </div>
      <div style={{ padding:'12px 14px', display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(110px, 1fr))', gap:'8px' }}>
        {(metrics || []).map((m, i) => {
          const ms = SC[m.status] || SC.ok;
          return (
            <div key={i} style={{ display:'flex', flexDirection:'column', gap:'2px' }}>
              <span style={{ fontSize:'9px', color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'0.4px' }}>{m.label}</span>
              <span style={{ fontSize:'16px', fontWeight:'700', color:ms.text }}>{m.value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Widget card ───────────────────────────────────────────────────────────────
const Widget = ({ title, icon: Icon, children, className = '', delay = 0, onExpand, alertLevel }) => (
  <div className={`glass-panel widget ${className}`} style={{ animationDelay: `${delay}s` }}>
    <div className="widget-header">
      <h3 className="widget-title">
        {Icon && <Icon />}
        {title}
      </h3>
      {onExpand && (
        <button className="expand-btn" onClick={onExpand} title="Expand for details">
          <Icons.Maximize />
        </button>
      )}
    </div>
    <div className="widget-body">
      <OverallStatusBadge level={alertLevel || 'ok'} />
      {children}
    </div>
  </div>
);

// ── Table renderers ───────────────────────────────────────────────────────────
function KtloDashboard() {
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  const [data] = useState(dashboardData);
  const [expandedId, setExpandedId] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [currentPage, setCurrentPage] = useState('ktlo');
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  const criticals = collectCriticals(data, wmsData);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  const renderEcommerceTable = () => (
    <div className="table-container">
      <table className="data-table">
        <thead><tr><th>System</th><th>Status</th><th>Uptime</th><th>Sessions</th></tr></thead>
        <tbody>{data.ecommerce.map((item, idx) => (
          <tr key={idx}>
            <td>{item.system}</td>
            <td className="status-cell"><StatusIcon status={item.status}/> {item.statusText}</td>
            <td>{item.uptime}</td>
            <td className={item.highlightSessions ? 'text-warn' : ''}>{item.sessions}</td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  );

  const renderPosTable = () => (
    <div className="table-container">
      <table className="data-table">
        <thead><tr><th>Application</th><th>Region</th><th>Status</th><th>Offline</th></tr></thead>
        <tbody>{data.pos.map((item, idx) => (
          <tr key={idx}>
            <td>{item.application}</td>
            <td>{item.region}</td>
            <td className="status-cell"><StatusIcon status={item.status}/> {item.statusText}</td>
            <td className={item.highlightOffline ? 'text-crit' : ''}>{item.offline}</td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  );

  const renderLogisticsTable = () => (
    <div className="table-container">
      <table className="data-table">
        <thead><tr><th>Location</th><th>WMS Status</th><th>Queue</th></tr></thead>
        <tbody>{data.logistics.map((item, idx) => (
          <tr key={idx}>
            <td>{item.location}</td>
            <td className="status-cell"><StatusIcon status={item.status}/> {item.statusText}</td>
            <td className={item.highlightQueue ? 'text-warn' : ''}>{item.queue}</td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  );

  const renderPaymentsTable = () => (
    <div className="table-container">
      <table className="data-table">
        <thead><tr><th>Provider</th><th>Latency</th><th>Status</th></tr></thead>
        <tbody>{data.payments.map((item, idx) => (
          <tr key={idx}>
            <td>{item.provider}</td>
            <td className={item.highlightLatency ? 'text-warn' : ''}>{item.latency}</td>
            <td className="status-cell"><StatusIcon status={item.status}/> {item.statusText}</td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  );

  const renderInfraTable = () => (
    <div className="table-container">
      <table className="data-table">
        <thead><tr><th>Component</th><th>Health</th><th>Component</th><th>Health</th></tr></thead>
        <tbody>{data.infrastructure.map((item, idx) => (
          <tr key={idx}>
            <td>{item.component1}</td>
            <td className="status-cell"><StatusIcon status={item.status1}/></td>
            <td>{item.component2}</td>
            <td className="status-cell"><StatusIcon status={item.status2}/></td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  );

  const renderDatabasesTable = () => (
    <div className="table-container">
      <table className="data-table">
        <thead><tr><th>Database</th><th>Type</th><th>Status</th><th>Replication Lag</th></tr></thead>
        <tbody>{data.databases.map((item, idx) => (
          <tr key={idx}>
            <td>{item.name}</td>
            <td>{item.type}</td>
            <td className="status-cell"><StatusIcon status={item.status}/> {item.statusText}</td>
            <td className={item.highlightLag ? 'text-warn' : ''}>{item.lag}</td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  );

  // ── Expanded modal config ─────────────────────────────────────────────────
  const MODAL_CONFIG = {
    ecommerce: {
      title: 'E-Commerce & Digital', Icon: Icons.Cart,
      summary: data.ecommerceSummary,
      items: data.ecommerce.map(i => ({ name: i.system, subtitle: i.statusText, overallStatus: i.status, metrics: i.metrics })),
    },
    pos: {
      title: 'Store Applications (POS)', Icon: Icons.Store,
      summary: data.posSummary,
      items: data.pos.map(i => ({ name: `${i.application} – ${i.region}`, subtitle: i.statusText, overallStatus: i.status, metrics: i.metrics })),
    },
    logistics: {
      title: 'Distribution Centers (DCs)', Icon: Icons.Truck,
      summary: data.logisticsSummary,
      items: data.logistics.map(i => ({ name: i.location, subtitle: i.statusText, overallStatus: i.status, metrics: i.metrics })),
    },
    payments: {
      title: 'Payment Gateways', Icon: Icons.Card,
      summary: data.paymentsSummary,
      items: data.payments.map(i => ({ name: i.provider, subtitle: i.statusText, overallStatus: i.status, metrics: i.metrics })),
    },
    health: {
      title: 'System Health', Icon: Icons.Activity,
      summary: data.healthSummary,
      items: data.healthItems,
    },
    infrastructure: {
      title: 'Core Infrastructure', Icon: Icons.Server,
      summary: data.infrastructureSummary,
      items: data.infrastructureItems,
    },
    databases: {
      title: 'Databases', Icon: Icons.Database,
      summary: data.databasesSummary,
      items: data.databases.map(i => ({ name: i.name, subtitle: i.type, overallStatus: i.status, metrics: i.metrics })),
    },
  };

  const renderExpandedModal = () => {
    if (!expandedId) return null;
    const cfg = MODAL_CONFIG[expandedId];
    if (!cfg) return null;
    const { title, Icon, summary, items } = cfg;

    const overallLevel = worstStatus(summary);
    const badge = BADGE[overallLevel];

    // Flagged items — crit first, then warn
    const flagged = items
      .filter(it => it.overallStatus === 'crit' || it.overallStatus === 'warn')
      .map(it => ({
        ...it,
        badMetrics: (it.metrics || []).filter(m => m.status === 'crit' || m.status === 'warn'),
      }));

    return (
      <div className="modal-overlay" onClick={() => setExpandedId(null)} style={{ padding: 0, alignItems: 'stretch' }}>
        <div
          onClick={e => e.stopPropagation()}
          style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: 'var(--glass-bg)', backdropFilter: 'blur(20px)' }}
        >
          {/* ── Modal header ──────────────────────────────────────────────── */}
          <div style={{ padding: '20px 28px 16px', borderBottom: '1px solid var(--glass-border)', flexShrink: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Icon />
                {title}
              </h2>
              <button className="expand-btn" onClick={() => setExpandedId(null)}><Icons.X /></button>
            </div>

            {/* Overall status banner */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              background: badge.bg, border: `1px solid ${badge.border}`,
              borderRadius: '10px', padding: '10px 16px', marginBottom: '16px',
            }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: badge.text, flexShrink: 0, boxShadow: `0 0 8px ${badge.text}` }} />
              <span style={{ fontSize: '15px', fontWeight: 700, color: badge.text }}>{badge.label}</span>
              {overallLevel !== 'ok' && (
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginLeft: 4 }}>
                  — {flagged.filter(f => f.overallStatus === 'crit').length} critical · {flagged.filter(f => f.overallStatus === 'warn').length} warnings detected
                </span>
              )}
            </div>

            {/* Big bold summary metrics */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {(summary || []).map((m, i) => <BigMetricCard key={i} label={m.label} value={m.value} status={m.status} />)}
            </div>
          </div>

          {/* ── Scrollable body ───────────────────────────────────────────── */}
          <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '24px 28px' }}>

            {/* Flagged issues block */}
            {flagged.length > 0 && (
              <div style={{ marginBottom: '28px' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '10px', paddingBottom: '6px', borderBottom: '1px solid var(--glass-border)' }}>
                  {flagged.some(f => f.overallStatus === 'crit') ? '🔴 Immediate Attention Required' : '🟡 Items Requiring Review'}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {flagged
                    .sort((a, b) => (a.overallStatus === 'crit' ? -1 : 1))
                    .map((item, i) => (
                      <FlaggedItem key={i} name={item.name} subtitle={item.subtitle} status={item.overallStatus} badMetrics={item.badMetrics} />
                    ))}
                </div>
              </div>
            )}

            {/* All item cards */}
            {items.length > 0 && (
              <div>
                <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '12px', paddingBottom: '6px', borderBottom: '1px solid var(--glass-border)' }}>
                  All Components
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '14px' }}>
                  {items.map((item, i) => (
                    <ItemCard key={i} name={item.name} subtitle={item.subtitle} overallStatus={item.overallStatus} metrics={item.metrics} onSelect={(expandedId === 'ecommerce' || expandedId === 'pos') ? () => setSelectedItem(item) : undefined} />
                  ))}
                </div>
              </div>
            )}

            {/* System Health fallback (no items array) */}
            {items.length === 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', maxWidth: '900px' }}>
                {(summary || []).map((m, i) => {
                  const s = SC[m.status] || SC.ok;
                  return (
                    <div key={i} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: '10px', padding: '20px 24px' }}>
                      <div style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>{m.label}</div>
                      <div style={{ fontSize: '36px', fontWeight: 800, color: s.text }}>{m.value}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-brand">
          <img src={`${import.meta.env.BASE_URL}dt-logo.png`} alt="Dollar Tree" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
          <div className="brand-group">
            <h1 className="brand-title">Dollar Tree Enterprise</h1>
            <nav className="nav-tabs">
              <button className={`nav-tab ${currentPage === 'ktlo' ? 'active' : ''}`} onClick={() => setCurrentPage('ktlo')}>Roots Observability Dashboard</button>
              <button className={`nav-tab ${currentPage === 'wms'  ? 'active' : ''}`} onClick={() => setCurrentPage('wms')}>Distribution Center Management System</button>
            </nav>
          </div>
        </div>
        <div className="header-status">
          <button className="theme-toggle" onClick={() => setTheme(p => p === 'dark' ? 'light' : 'dark')} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
            {theme === 'dark' ? <Icons.Sun /> : <Icons.Moon />}
          </button>
          <div className="status-pill"><div className="indicator ok"></div>All Systems Operational</div>
          <div className="time-pill"><Icons.Clock />{time}</div>
        </div>
      </header>

      {currentPage === 'ktlo' && <CriticalAlertBar criticals={criticals} />}

      {currentPage === 'ktlo' ? (
        <main className="dashboard-content">
          <Widget title="E-Commerce & Digital"      icon={Icons.Cart}     className="widget-half"  delay={0.1} alertLevel={worstStatus(data.ecommerceSummary)}      onExpand={() => setExpandedId('ecommerce')}>
            {renderEcommerceTable()}
          </Widget>
          <Widget title="Store Applications (POS)"  icon={Icons.Store}    className="widget-half"  delay={0.2} alertLevel={worstStatus(data.posSummary)}             onExpand={() => setExpandedId('pos')}>
            {renderPosTable()}
          </Widget>
          <Widget title="Distribution Centers (DCs)" icon={Icons.Truck}   className="widget-third" delay={0.3} alertLevel={worstStatus(data.logisticsSummary)}       onExpand={() => setExpandedId('logistics')}>
            {renderLogisticsTable()}
          </Widget>
          <Widget title="Payment Gateways"           icon={Icons.Card}    className="widget-third" delay={0.4} alertLevel={worstStatus(data.paymentsSummary)}        onExpand={() => setExpandedId('payments')}>
            {renderPaymentsTable()}
          </Widget>
          <Widget title="System Health"              icon={Icons.Activity} className="widget-third" delay={0.5} alertLevel={worstStatus(data.healthSummary)}          onExpand={() => setExpandedId('health')}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '4px' }}>
              {data.healthSummary.map((m, i) => {
                const s = SC[m.status] || SC.ok;
                return (
                  <div key={i} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: '8px', padding: '10px 12px' }}>
                    <div style={{ fontSize: '9px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>{m.label}</div>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: s.text, lineHeight: 1 }}>{m.value}</div>
                  </div>
                );
              })}
            </div>
          </Widget>
          <Widget title="Core Infrastructure"        icon={Icons.Server}  className="widget-half"  delay={0.6} alertLevel={worstStatus(data.infrastructureSummary)}  onExpand={() => setExpandedId('infrastructure')}>
            {renderInfraTable()}
          </Widget>
          <Widget title="Databases"                  icon={Icons.Database} className="widget-half"  delay={0.7} alertLevel={worstStatus(data.databasesSummary)}       onExpand={() => setExpandedId('databases')}>
            {renderDatabasesTable()}
          </Widget>
        </main>
      ) : (
        <main className="dashboard-content" style={{ display: 'flex' }}>
          <WmsDashboard />
        </main>
      )}

      {currentPage === 'ktlo' && renderExpandedModal()}
      <ItemDetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/"           element={<KtloDashboard />} />
      <Route path="/ecommerce"  element={<EcommerceDetail />} />
      <Route path="/pos"        element={<PosDetail />} />
      <Route path="*"           element={<KtloDashboard />} />
    </Routes>
  );
}

export default App;
