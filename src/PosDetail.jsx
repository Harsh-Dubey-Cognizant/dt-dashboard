import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line, Legend,
} from 'recharts';
import dashboardData from '../db/data.json';

// ── Palette ───────────────────────────────────────────────────────────────────
const C = {
  ok:   { fill: '#22c55e', bg: 'rgba(34,197,94,0.10)',  border: 'rgba(34,197,94,0.30)',  text: '#16a34a' },
  warn: { fill: '#eab308', bg: 'rgba(234,179,8,0.10)',  border: 'rgba(234,179,8,0.30)',  text: '#ca8a04' },
  crit: { fill: '#ef4444', bg: 'rgba(239,68,68,0.10)',  border: 'rgba(239,68,68,0.30)',  text: '#dc2626' },
};
const col = s => (C[s] || C.ok).fill;

// ── SVG Gauge ─────────────────────────────────────────────────────────────────
const Gauge = ({ pct, label, value, status }) => {
  const r = 54, cx = 70, cy = 68;
  const sweep = Math.PI;
  const filled = sweep * (pct / 100);
  const angle  = Math.PI - filled;

  const arc = (a1, a2) => {
    const x1 = cx + r * Math.cos(a1), y1 = cy - r * Math.sin(a1);
    const x2 = cx + r * Math.cos(a2), y2 = cy - r * Math.sin(a2);
    const large = Math.abs(a1 - a2) > Math.PI ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 0 ${x2} ${y2}`;
  };

  const tipX = cx + (r - 6) * Math.cos(angle);
  const tipY = cy - (r - 6) * Math.sin(angle);
  const fillColour = col(status);

  return (
    <div style={{ textAlign: 'center' }}>
      <svg width="140" height="86" viewBox="0 0 140 86">
        <path d={arc(Math.PI, 0)} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" strokeLinecap="round" />
        {pct > 0 && (
          <path d={arc(Math.PI, angle)} fill="none" stroke={fillColour} strokeWidth="10" strokeLinecap="round" />
        )}
        <line x1={cx} y1={cy} x2={tipX} y2={tipY} stroke={fillColour} strokeWidth="2.5" strokeLinecap="round" />
        <circle cx={cx} cy={cy} r="5" fill={fillColour} />
        <text x={cx} y={cy + 16} textAnchor="middle" fontSize="14" fontWeight="800" fill={fillColour}>{value}</text>
      </svg>
      <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '-4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
    </div>
  );
};

// ── Custom tooltip ────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '8px', padding: '8px 12px', backdropFilter: 'blur(12px)' }}>
      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ fontSize: '13px', fontWeight: 700, color: p.fill || p.stroke || 'var(--text-primary)' }}>
          {p.name}: {p.value}
        </div>
      ))}
    </div>
  );
};

// ── Metric card ───────────────────────────────────────────────────────────────
const MetCard = ({ label, value, status }) => {
  const s = C[status] || C.ok;
  return (
    <div style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: '10px', padding: '14px 16px' }}>
      <div style={{ fontSize: '9px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '6px' }}>{label}</div>
      <div style={{ fontSize: '22px', fontWeight: 800, color: s.text }}>{value}</div>
    </div>
  );
};

const SectionHeader = ({ title }) => (
  <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase', color: 'var(--text-secondary)', paddingBottom: '8px', borderBottom: '1px solid var(--glass-border)', marginBottom: '16px' }}>
    {title}
  </div>
);

export default function PosDetail() {
  const navigate = useNavigate();
  const items   = dashboardData.pos;
  const summary = dashboardData.posSummary;

  // Gauges — healthy ranges inverted where lower = better
  const gaugeData = [
    { label: 'Total Offline', value: '206',    pct: 68, status: 'crit' },
    { label: 'Best Sync Lag', value: '0.5 s',  pct: 15, status: 'ok'   },
    { label: 'Worst Sync Lag',value: '12.8 s', pct: 92, status: 'crit' },
    { label: 'Tx Success (E)', value: '99.4%', pct: 99, status: 'ok'   },
    { label: 'Tx Success (S)', value: '96.8%', pct: 62, status: 'warn' },
    { label: 'FD POS Outage', value: '142 off',pct: 100,status: 'crit' },
  ];

  // Offline stores bar
  const offlineBar = items.map(i => ({
    name:    `${i.application.replace(' Core', '')} (${i.region.substring(0, 3)})`,
    offline: parseInt(i.offline?.replace(/,/g, '') || 0),
    status:  i.status,
  }));

  // Sync lag bar
  const syncBar = items.map(i => {
    const lag = i.metrics?.find(m => m.label.includes('Sync') || m.label.includes('Lag'));
    return {
      name:   `${i.application.replace(' Core', '')} (${i.region.substring(0, 3)})`,
      lag:    parseFloat(lag?.value?.replace(/[^\d.]/g, '') || 0),
      status: i.status,
    };
  });

  // Tx success bar
  const txBar = items.map(i => {
    const tx = i.metrics?.find(m => m.label.includes('Tx') && m.label.includes('Success'));
    return {
      name:    `${i.application.replace(' Core', '')} (${i.region.substring(0, 3)})`,
      success: parseFloat(tx?.value?.replace(/[^\d.]/g, '') || 0),
      status:  i.status,
    };
  });

  const axisStyle = { fill: 'var(--text-secondary)', fontSize: 10 };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)', overflowY: 'auto' }}>
      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <div style={{ padding: '20px 32px', borderBottom: '1px solid var(--glass-border)', background: 'var(--glass-bg)', backdropFilter: 'blur(16px)', position: 'sticky', top: 0, zIndex: 10, display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'var(--widget-bg)', border: '1px solid var(--glass-border)', borderRadius: '8px', padding: '6px 14px', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          ← Back
        </button>
        <div>
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>Store Applications (POS) — Deep Dive</h1>
          <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
            {items.length} applications monitored · {items.filter(i => i.status === 'ok').length} healthy · {items.filter(i => i.status === 'warn').length} degraded · {items.filter(i => i.status === 'crit').length} critical
          </p>
        </div>
        {/* Critical banner */}
        {items.some(i => i.status === 'crit') && (
          <div style={{ marginLeft: 'auto', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.35)', borderRadius: '8px', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 8px #ef4444' }} />
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#dc2626' }}>Active Outage Detected</span>
          </div>
        )}
      </div>

      <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '1400px', margin: '0 auto' }}>

        {/* ── Summary KPIs ─────────────────────────────────────────────────── */}
        <div>
          <SectionHeader title="Key Performance Indicators" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px' }}>
            {summary.map((m, i) => <MetCard key={i} label={m.label} value={m.value} status={m.status} />)}
          </div>
        </div>

        {/* ── Gauges ──────────────────────────────────────────────────────── */}
        <div className="glass-panel" style={{ padding: '20px 24px' }}>
          <SectionHeader title="Health Gauges" />
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'space-around' }}>
            {gaugeData.map((g, i) => <Gauge key={i} {...g} />)}
          </div>
        </div>

        {/* ── Offline stores ────────────────────────────────────────────────── */}
        <div className="glass-panel" style={{ padding: '20px 24px' }}>
          <SectionHeader title="Offline Stores by Application / Region" />
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={offlineBar} margin={{ top: 4, right: 16, left: 0, bottom: 50 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="name" tick={axisStyle} angle={-25} textAnchor="end" interval={0} />
              <YAxis tick={axisStyle} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="offline" name="Offline Stores" radius={[4, 4, 0, 0]}>
                {offlineBar.map((e, i) => <Cell key={i} fill={col(e.status)} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ── Sync lag ─────────────────────────────────────────────────────── */}
        <div className="glass-panel" style={{ padding: '20px 24px' }}>
          <SectionHeader title="Sync Lag (seconds) — lower is better" />
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={syncBar} margin={{ top: 4, right: 16, left: 0, bottom: 50 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="name" tick={axisStyle} angle={-25} textAnchor="end" interval={0} />
              <YAxis tick={axisStyle} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="lag" name="Sync Lag (s)" radius={[4, 4, 0, 0]}>
                {syncBar.map((e, i) => <Cell key={i} fill={col(e.status)} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ── Tx success ────────────────────────────────────────────────────── */}
        <div className="glass-panel" style={{ padding: '20px 24px' }}>
          <SectionHeader title="Transaction Success Rate (%)" />
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={txBar} margin={{ top: 4, right: 16, left: 0, bottom: 50 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="name" tick={axisStyle} angle={-25} textAnchor="end" interval={0} />
              <YAxis tick={axisStyle} domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="success" name="Tx Success %" radius={[4, 4, 0, 0]}>
                {txBar.map((e, i) => <Cell key={i} fill={col(e.status)} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ── Per-application detail cards ─────────────────────────────────── */}
        <div>
          <SectionHeader title="Application-Level Breakdown" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {items.map((item, idx) => {
              const s = C[item.status] || C.ok;
              return (
                <div key={idx} style={{ border: `1px solid ${s.border}`, borderRadius: '12px', overflow: 'hidden', background: 'var(--widget-bg)' }}>
                  <div style={{ background: s.bg, padding: '12px 16px', borderBottom: `1px solid ${s.border}`, display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: s.fill, flexShrink: 0, boxShadow: item.status !== 'ok' ? `0 0 6px ${s.fill}` : 'none' }} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>{item.application}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '1px' }}>{item.region}</div>
                    </div>
                    <div style={{ marginLeft: 'auto' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: s.text }}>{item.statusText}</span>
                    </div>
                  </div>
                  <div style={{ padding: '12px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {(item.metrics || []).map((m, i) => {
                      const ms = C[m.status] || C.ok;
                      return (
                        <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ fontSize: '9px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{m.label}</span>
                          <span style={{ fontSize: '16px', fontWeight: 700, color: ms.text }}>{m.value}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
