import React from 'react';

export default function RiskBanner({
  risk,
  reasons,
  onRefresh,
}: {
  risk: 'green' | 'amber' | 'red' | string;
  reasons: string[];
  onRefresh: () => void;
}) {
  const cls = risk === 'red' ? 'risk-red' : risk === 'amber' ? 'risk-amber' : 'risk-green';
  const title = risk === 'red' ? 'High Risk' : risk === 'amber' ? 'Moderate Risk' : 'Low Risk';
  return (
    <div className={`risk-banner ${cls}`}>
      <div style={{ fontWeight: 700 }}>
        {title}
      </div>
      <div style={{ fontSize: 12, color: '#cbd5e1' }}>{reasons?.join(' • ') || '—'}</div>
      <div style={{ marginLeft: 'auto' }}>
        <button onClick={onRefresh} style={{ background: 'transparent', color: '#5eead4', border: '1px solid #243145', padding: '4px 8px', borderRadius: 6, cursor: 'pointer' }}>Refresh</button>
      </div>
    </div>
  );
}

