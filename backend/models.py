from __future__ import annotations
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class ContextFlags(BaseModel):
    cssrs_recent_positive: bool = False
    recent_discharge_within_30d: bool = False
    fuh7_done: bool = False
    low_risk: bool = False


class MemberContext(BaseModel):
    notes: str = ""
    flags: ContextFlags = Field(default_factory=ContextFlags)


class Member(BaseModel):
    id: int
    name: str
    age: Optional[int] = None
    pronouns: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    context: MemberContext = Field(default_factory=MemberContext)


class NBAAction(BaseModel):
    id: str
    label: str
    priority: int


class Rule(BaseModel):
    id: str
    if_all: Optional[List[str]] = None
    if_any: Optional[List[str]] = None
    risk: str
    actions: List[NBAAction]


class NBARequest(BaseModel):
    member_id: int
    note_text: Optional[str] = None
    context_override: Optional[Dict[str, Any]] = None


class NBAResponse(BaseModel):
    member_id: int
    risk_level: str
    reasons: List[str]
    actions: List[NBAAction]


class LogEvent(BaseModel):
    member_id: int
    action_id: str
    action_label: str
    note_text: Optional[str] = None
    ts: Optional[float] = None

