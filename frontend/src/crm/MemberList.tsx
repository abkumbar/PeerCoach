import React from 'react';
import type { Member } from './CRMApp';

export default function MemberList({
  members,
  selectedId,
  onSelect,
}: {
  members: Member[];
  selectedId: number | null;
  onSelect: (id: number) => void;
}) {
  return (
    <div>
      {members.map((m) => (
        <div
          key={m.id}
          className={['member-item', selectedId === m.id ? 'active' : ''].join(' ')}
          onClick={() => onSelect(m.id)}
        >
          <div style={{ fontWeight: 600 }}>{m.name}</div>
          <div className="muted" style={{ fontSize: 12 }}>
            {m.pronouns ? `${m.pronouns} · ` : ''}
            {m.tags?.join(', ')}
          </div>
        </div>
      ))}
    </div>
  );
}

