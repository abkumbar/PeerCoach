import React from 'react';
import type { NBAAction } from '../crm/CRMApp';
import CSSRSQuick from './flows/CSSRSQuick';
import SafetyPlan from './flows/SafetyPlan';
import FollowUpNudge from './flows/FollowUpNudge';
import BarrierSolver from './flows/BarrierSolver';

export default function WidgetApp({
  member,
  action,
  onBack,
  onComposeNote,
}: {
  member: any;
  action: NBAAction;
  onBack: () => void;
  onComposeNote: (text: string) => void;
}) {
  const renderFlow = () => {
    switch (action.id) {
      case 'act_cssrs':
        return <CSSRSQuick member={member} onComposeNote={onComposeNote} />;
      case 'act_safety_plan':
        return <SafetyPlan member={member} onComposeNote={onComposeNote} />;
      case 'act_followup':
        return <FollowUpNudge member={member} onComposeNote={onComposeNote} />;
      case 'act_barriers':
      case 'act_recovery':
        return <BarrierSolver member={member} mode={action.id === 'act_recovery' ? 'recovery' : 'barriers'} onComposeNote={onComposeNote} />;
      default:
        return <div>Coming soon.</div>;
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
        <button onClick={onBack} style={{ background: 'transparent', color: '#93c5fd', border: '1px solid #243145', padding: '4px 8px', borderRadius: 6, cursor: 'pointer' }}>{'←'} Back</button>
        <div style={{ marginLeft: 8, fontWeight: 700 }}>{action.label}</div>
      </div>
      <div className="flow">{renderFlow()}</div>
    </div>
  );
}

