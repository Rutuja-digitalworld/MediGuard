import React from 'react';
import { useLanguage } from '../LanguageContext';

const severityMap = { 'Low Risk': 1, 'Medium Risk': 2, 'High Risk': 3 };
const colorMap = { 'Low Risk': '#34d399', 'Medium Risk': '#fbbf24', 'High Risk': '#f87171' };

const titleText = {
  en: 'Risk History Overview',
  hi: 'जोखिम इतिहास अवलोकन',
  mr: 'जोखीम इतिहास आढावा',
};

const yAxisLabel = {
  en: { high: 'High', medium: 'Medium', low: 'Low' },
  hi: { high: 'उच्च', medium: 'मध्यम', low: 'कम' },
  mr: { high: 'उच्च', medium: 'मध्यम', low: 'कमी' },
};

function RiskBarChart({ history }) {
  const { lang } = useLanguage();
  const labels = yAxisLabel[lang] || yAxisLabel.en;

  const data = [...history].reverse(); // oldest -> newest, left to right
  if (data.length === 0) return null;

  const leftAxisWidth = 64;
  const barSlot = 80;
  const chartWidth = Math.max(420, data.length * barSlot);
  const width = chartWidth + leftAxisWidth;
  const height = 280;
  const topPad = 24;
  const bottomPad = 58;
  const baseline = height - bottomPad;

  const highY = topPad + 14;
  const medY = topPad + 70;
  const lowY = baseline - 14;

  const heightFor = (risk) => {
    const sev = severityMap[risk] || 1;
    return sev === 3 ? baseline - highY : sev === 2 ? baseline - medY : baseline - lowY;
  };

  const barWidth = Math.min(40, barSlot * 0.55);

  return (
    <div className="card fade-in" style={{ marginBottom: '20px', overflow: 'hidden', background: '#0b1220', border: '1px solid #1e2a3d', padding: '28px' }}>
      <h3 style={{
        display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1rem',
        fontWeight: '800', color: '#e2e8f0', marginBottom: '16px'
      }}>
        <span style={{
          width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(52,211,153,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="20" x2="12" y2="10" />
            <line x1="18" y1="20" x2="18" y2="4" />
            <line x1="6" y1="20" x2="6" y2="16" />
          </svg>
        </span>
        {titleText[lang] || titleText.en}
      </h3>

      <div style={{ position: 'relative' }}>
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" style={{ display: 'block' }}>
          <defs>
            <pattern id="barGrid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#162132" strokeWidth="1" />
            </pattern>
          </defs>

          {/* Background grid */}
          <rect x={leftAxisWidth} y="0" width={chartWidth} height={height} fill="url(#barGrid)" />

          {/* Risk zone tints */}
          <rect x={leftAxisWidth} y={topPad} width={chartWidth} height={medY - topPad} fill="#f87171" opacity="0.05" />
          <rect x={leftAxisWidth} y={medY} width={chartWidth} height={baseline - medY} fill="#fbbf24" opacity="0.04" />

          {/* Y axis */}
          <line x1={leftAxisWidth} y1={topPad} x2={leftAxisWidth} y2={baseline} stroke="#2a3a52" strokeWidth="1.5" />
          {[[highY, labels.high, '#f87171'], [medY, labels.medium, '#fbbf24'], [lowY, labels.low, '#34d399']].map(([y, label, color]) => (
            <g key={label}>
              <line x1={leftAxisWidth - 5} y1={y} x2={leftAxisWidth} y2={y} stroke={color} strokeWidth="1.5" />
              <text x={leftAxisWidth - 12} y={y + 4} textAnchor="end" fontSize="13" fill={color} fontFamily="Inter, sans-serif" fontWeight="700">
                {label}
              </text>
            </g>
          ))}

          {/* X axis */}
          <line x1={leftAxisWidth} y1={baseline} x2={width} y2={baseline} stroke="#2a3a52" strokeWidth="1.5" />

          {/* Bars */}
          {data.map((d, i) => {
            const cx = leftAxisWidth + barSlot * (i + 0.5);
            const barH = heightFor(d.risk);
            const color = colorMap[d.risk] || '#94a3b8';
            return (
              <g key={i}>
                <rect
                  x={cx - barWidth / 2}
                  y={baseline - barH}
                  width={barWidth}
                  height={barH}
                  rx="6"
                  fill={color}
                  opacity="0.9"
                  style={{ filter: `drop-shadow(0 0 6px ${color}90)` }}
                />
                <title>{`${d.date} — ${d.risk}`}</title>
                <text x={cx} y={baseline + 26} textAnchor="middle" fontSize="13" fill="#a8b3c4" fontFamily="Inter, sans-serif" fontWeight="600">
                  {d.date}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '16px', marginTop: '10px', flexWrap: 'wrap' }}>
        {[['Low Risk', '#34d399'], ['Medium Risk', '#fbbf24'], ['High Risk', '#f87171']].map(([label, color]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: color, boxShadow: `0 0 6px ${color}` }} />
            <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: '600' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RiskBarChart;