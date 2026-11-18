import React, { useState } from 'react';
import RiskBanner from './RiskBanner';
import NBAList from './NBAList';
import WidgetApp from './WidgetApp';
import type { NBAAction } from '../crm/CRMApp';
import ChatBox from './ChatBox';

export default function WidgetFrame({
  member,
  nba,
  onRefresh,
  onComposeNote,
  onSelectAction,
}: {
  member: any;
  nba: any;
  onRefresh: () => void;
  onComposeNote: (text: string) => void;
  onSelectAction: (action: NBAAction) => void;
}) {
  const [activeAction, setActiveAction] = useState<NBAAction | null>(null);

  if (!member) return <div className="muted">Select a member to view guidance.</div>;

  return (
    <div>
      <RiskBanner risk={nba?.risk_level || 'green'} reasons={nba?.reasons || []} onRefresh={onRefresh} />

      {!activeAction && (
        <NBAList
          actions={nba?.actions || []}
          onOpen={(a) => {
            setActiveAction(a);
            onSelectAction(a);
          }}
        />
      )}

      {activeAction && (
        <WidgetApp
          member={member}
          action={activeAction}
          onBack={() => setActiveAction(null)}
          onComposeNote={onComposeNote}
        />
      )}

      {/* Chat with Coach */}
      <ChatBox memberId={member?.id} onUseSuggestion={(text) => onComposeNote(text)} />
    </div>
  );
}
