import React from 'react';
import type { NBAAction } from '../crm/CRMApp';

export default function NBAList({ actions, onOpen }: { actions: NBAAction[]; onOpen: (a: NBAAction) => void }) {
  if (!actions?.length) return <div className="muted">No suggested actions right now.</div>;
  return (
    <div className="nba-list">
      {actions.map((a) => (
        <button key={a.id} className="nba-button" onClick={() => onOpen(a)}>
          {a.label}
        </button>
      ))}
    </div>
  );
}

