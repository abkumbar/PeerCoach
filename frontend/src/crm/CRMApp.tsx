import React, { useEffect, useMemo, useState } from 'react';
import MemberList from './MemberList';
import MemberDetail from './MemberDetail';
import WidgetFrame from '../widget/WidgetFrame';
import { fetchMembers, fetchMember, requestNBA, logAction } from '../widget/api';

export type Member = {
  id: number;
  name: string;
  age?: number;
  pronouns?: string;
  phone?: string;
  email?: string;
  tags: string[];
  context: {
    notes: string;
    flags: {
      cssrs_recent_positive: boolean;
      recent_discharge_within_30d: boolean;
      fuh7_done: boolean;
      low_risk: boolean;
    };
  };
};

export type NBAAction = { id: string; label: string; priority: number };
export type NBAResponse = {
  member_id: number;
  risk_level: 'green' | 'amber' | 'red' | string;
  reasons: string[];
  actions: NBAAction[];
};

export default function CRMApp() {
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [note, setNote] = useState('');
  const [nba, setNba] = useState<NBAResponse | null>(null);

  useEffect(() => {
    fetchMembers().then((ms) => {
      setMembers(ms);
      if (ms.length) setSelectedId(ms[0].id);
    });
  }, []);

  useEffect(() => {
    if (selectedId == null) return;
    fetchMember(selectedId).then((m) => {
      setSelectedMember(m);
      setNote(m?.context?.notes || '');
      requestNBA({ member_id: m.id, note_text: m?.context?.notes || '' }).then(setNba);
    });
  }, [selectedId]);

  const onComposeNote = (text: string) => {
    setNote((prev) => prev + (prev ? '\n' : '') + text);
  };

  const onSelectAction = (action: NBAAction) => {
    if (!selectedMember) return;
    logAction({ member_id: selectedMember.id, action_id: action.id, action_label: action.label, note_text: note });
  };

  return (
    <div className="crm-shell">
      <div className="panel">
        <h2>Members</h2>
        <div className="panel-content">
          <MemberList members={members} selectedId={selectedId} onSelect={setSelectedId} />
        </div>
      </div>
      <div className="panel">
        <h2>Member Detail</h2>
        <div className="panel-content">
          <MemberDetail member={selectedMember} note={note} onNoteChange={setNote} />
        </div>
      </div>
      <div className="panel">
        <h2>Peer Guide Coach</h2>
        <div className="panel-content">
          <WidgetFrame
            member={selectedMember}
            nba={nba}
            onRefresh={() => selectedMember && requestNBA({ member_id: selectedMember.id, note_text: note }).then(setNba)}
            onComposeNote={onComposeNote}
            onSelectAction={onSelectAction}
          />
        </div>
      </div>
    </div>
  );
}

