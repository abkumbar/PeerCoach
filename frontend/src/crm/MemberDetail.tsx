import React from 'react';
import type { Member } from './CRMApp';

export default function MemberDetail({
  member,
  note,
  onNoteChange,
}: {
  member: Member | null;
  note: string;
  onNoteChange: (v: string) => void;
}) {
  if (!member) return <div className="muted">Select a member to view details.</div>;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ fontSize: 18, fontWeight: 700 }}>{member.name}</div>
        {member.pronouns && <span className="badge">{member.pronouns}</span>}
        <div className="tags">
          {member.tags?.map((t) => (
            <span key={t} className="badge">
              {t}
            </span>
          ))}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div>
          <div className="muted" style={{ fontSize: 12 }}>
            Phone
          </div>
          <div>{member.phone || '—'}</div>
        </div>
        <div>
          <div className="muted" style={{ fontSize: 12 }}>
            Email
          </div>
          <div>{member.email || '—'}</div>
        </div>
      </div>

      <div>
        <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>
          CRM Note
        </div>
        <textarea className="note-editor" value={note} onChange={(e) => onNoteChange(e.target.value)} />
      </div>
    </div>
  );
}

