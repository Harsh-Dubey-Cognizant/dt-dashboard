import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
} from 'recharts';
import dashboardData from '../db/data.json';

// ── Palette ───────────────────────────────────────────────────────────────────
const C = {
  ok:   { fill: '#22c55e', bg: 'rgba(34,197,94,0.10)',  border: 'rgba(34,197,94,0.30)',  text: '#16a34a' },
  warn: { fill: '#eab308', bg: 'rgba(234,179,8,0.10)',  border: 'rgba(234,179,8,0.30)',  text: '#ca8a04' },
  crit: { fill: '#ef4444', bg: 'rgba(239,68,68,0.10)',  border: 'rgba(239,68,68,0.30)',  text: '#dc2626' },
};
const col = s => (C[s] || C.ok).fill;

// ── SVG Gauge (speedometer) ───────────────────────────────────────────────────
// pct: 0–100, status: ok/warn/crit
const Gauge = ({ pct, label, value, status }) => {
  const r = 54, cx = 70, cy = 68;
  const startAngle = Math.PI;       // 180° (left)
  const endAngle   = 0;             // 0°  (right)
  const sweep = startAngle - endAngle; // π
  const filled = sweep * (pct / 100);
  const angle  = Math.PI - filled;   // current tip angle

  const arc = (a1, a2, colour) => {
    const x1 = cx + r * Math.cos(a1), y1 = cy - r * Math.sin(a1);
    const x2 = cx + r * Math.cos(a2), y2 = cy - r * Math.sin(a2);
    const large = Math.abs(a1 - a2) > Math.PI ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 0 ${x2} ${y2}`;
  };

  const tipX = cx + (r - 6) * Math.cos(angle);
  const tipY = cy - (r - 6) * Math.sin(angle);

  const fillColour = col(status);
  const trackColour = 'rgba(255,255,255,0.08)';

  return (
    <div style={{ textAlign: 'center' }}>
      <svg width="140" height="86" viewBox="0 0 140 86">
        {/* track */}
        <path d={arc(Math.PI, 0, trackColour)} fill="none" stroke={trackColour} strokeWidth="10" strokeLinecap="round" />
        {/* filled arc */}
        {pct > 0 && (
          <path d={arc(Math.PI, angle, fillColour)} fill="none" stroke={fillColour} strokeWidth="10" strokeLinecap="round" />
        )}
        {/* needle */}
        <line x1={cx} y1={cy} x2={tipX} y2={tipY} stroke={fillColour} strokeWidth="2.5" strokeLinecap="round" />
        <circle cx={cx} cy={cy} r="5" fill={fillColour} />
        {/* value */}
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
        <div key={i} style={{ fontSize: '13px', fontWeight: 700, color: p.fill || 'var(--text-primary)' }}>
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

// ── Section header ────────────────────────────────────────────────────────────
const SectionHeader = ({ title }) => (
  <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase', color: 'var(--text-secondary)', paddingBottom: '8px', borderBottom: '1px solid var(--glass-border)', marginBottom: '16px' }}>
    {title}
  </div>
);

export default function EcommerceDetail() {
  const navigate = useNavigate();
  const items = dashboardData.ecommerce;
  const summary = dashboardData.ecommerceSummary;

  // Gauge data — map summary metrics to 0-100 pct
  const gaugeData = [
    { label: 'Avg Page Load', value: '1.2 s',   pct: 28,  status: 'ok'   },
    { label: 'Error Rate',    value: '0.06%',    pct: 6,   status: 'ok'   },
    { label: 'Active Sessions', value: '62.8K', pct: 63,  status: 'ok'   },
    { label: 'Uptime',        value: '99.7%',    pct: 100, status: 'ok'   },
    { label: 'Mobile Load',   value: '3.8 s',    pct: 76,  status: 'warn' },
    { label: 'Tx / hr',       value: '4.2K',     pct: 42,  status: 'ok'   },
  ];

  // Bar chart — sessions per system
  const sessionsBar = items.map(i => ({ name: i.system.replace('DT ', '').replace('Dollar', 'DT'), sessions: parseInt(i.sessions?.replace(/,/g, '') || 0), status: i.status }));

  // Bar chart — uptime per system
  const uptimeBar = items.map(i => ({ name: i.system.replace('DollarTree', 'DT').replace('.com', ''), uptime: parseFloat(i.uptime?.replace('%', '') || 100), status: i.status }));

  // Bar chart — per-metric breakdown (avg response / error rate per system)
  const metricBar = items.map(i => {
    const load  = i.metrics?.find(m => m.label.includes('Load') || m.label.includes('Page'))?.value?.replace(/[^\d.]/g, '') || 0;
    const error = i.metrics?.find(m => m.label.includes('Error'))?.value?.replace(/[^.\d]/g, '') || 0;
    return { name: i.system.replace('DollarTree', 'DT').replace('.com', ''), load: parseFloat(load), error: parseFloat(error) * 100, status: i.status };
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
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>E-Commerce & Digital — Deep Dive</h1>
          <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
            {items.length} systems monitored · {items.filter(i => i.status === 'ok').length} healthy · {items.filter(i => i.status === 'warn').length} degraded · {items.filter(i => i.status === 'crit').length} critical
          </p>
        </div>
      </div>

      <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '1400px', margin: '0 auto' }}>

        {/* ── Summary metric cards ─────────────────────────────────────────── */}
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

        {/* ── Sessions bar chart ───────────────────────────────────────────── */}
        <div className="glass-panel" style={{ padding: '20px 24px' }}>
          <SectionHeader title="Active Sessions by System" />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={sessionsBar} margin={{ top: 4, right: 16, left: 0, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="name" tick={axisStyle} angle={-20} textAnchor="end" interval={0} />
              <YAxis tick={axisStyle} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="sessions" name="Sessions" radius={[4, 4, 0, 0]}>
                {sessionsBar.map((e, i) => <Cell key={i} fill={col(e.status)} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ── Uptime bar chart ─────────────────────────────────────────────── */}
        <div className="glass-panel" style={{ padding: '20px 24px' }}>
          <SectionHeader title="Uptime % by System" />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={uptimeBar} margin={{ top: 4, right: 16, left: 0, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="name" tick={axisStyle} angle={-20} textAnchor="end" interval={0} />
              <YAxis tick={axisStyle} domain={[97, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="uptime" name="Uptime %" radius={[4, 4, 0, 0]}>
                {uptimeBar.map((e, i) => <Cell key={i} fill={col(e.status)} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ── Page load + error rate bar chart ─────────────────────────────── */}
        <div className="glass-panel" style={{ padding: '20px 24px' }}>
          <SectionHeader title="Page Load Time (s) vs Error Rate (×100) by System" />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={metricBar} margin={{ top: 4, right: 16, left: 0, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="name" tick={axisStyle} angle={-20} textAnchor="end" interval={0} />
              <YAxis tick={axisStyle} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="load"  name="Load Time (s)"   radius={[4, 4, 0, 0]} fill="#3b82f6" />
              <Bar dataKey="error" name="Error Rate ×100" radius={[4, 4, 0, 0]} fill="#f97316" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ── Per-system detail cards ──────────────────────────────────────── */}
        <div>
          <SectionHeader title="System-Level Breakdown" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {items.map((item, idx) => {
              const s = C[item.status] || C.ok;
              return (
                <div key={idx} style={{ border: `1px solid ${s.border}`, borderRadius: '12px', overflow: 'hidden', background: 'var(--widget-bg)' }}>
                  <div style={{ background: s.bg, padding: '12px 16px', borderBottom: `1px solid ${s.border}`, display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: s.fill, flexShrink: 0, boxShadow: item.status !== 'ok' ? `0 0 6px ${s.fill}` : 'none' }} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>{item.system}</div>
                      <div style={{ fontSize: '11px', color: s.text, marginTop: '1px' }}>{item.statusText}</div>
                    </div>
                    <div style={{ marginLeft: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Uptime</span>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: s.text }}>{item.uptime}</span>
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
