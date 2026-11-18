from __future__ import annotations
import time
from pathlib import Path
from typing import Any, Dict, List

import orjson
from fastapi import FastAPI, HTTPException, APIRouter
import os
import re
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .models import Member, NBARequest, NBAResponse, Rule, NBAAction, LogEvent

# --- Chat with Coach feature ---
router = APIRouter()


class ChatRequest(BaseModel):
    # Accept either numeric or string IDs from the frontend
    memberId: int | str
    message: str


class ChatReply(BaseModel):
    reply: str
    suggestedActions: list


KEYWORDS = {
    "suicide": ["suicide", "not wanting to live", "end my life", "kill myself", "hopeless"],
    "meds": ["insulin", "refill", "med", "medicine", "pharmacy", "pickup"],
    "followup": ["follow up", "fuh", "after hospital", "discharge", "7 day", "appointment"],
    "housing": ["housing", "eviction", "room", "shelter", "homeless"],
    "food": ["food", "hungry", "groceries", "food bank"],
}


def match_keywords(text: str):
    t = (text or "").lower()
    hits = []
    for k, words in KEYWORDS.items():
        if any(w in t for w in words):
            hits.append(k)
    return hits


def format_actions(nba_payload: NBAResponse):
    acts = getattr(nba_payload, "actions", []) or []
    return [{"id": a.id, "label": a.label} for a in acts][:5]


def _clean_text(s: str) -> str:
    # Normalize common curly quotes, bullets, dashes, and replacement chars to ASCII
    replacements = {
        "\u2018": "'",  # left single quote
        "\u2019": "'",  # right single quote / apostrophe
        "\u201B": "'",  # single high-reversed-9 quote
        "\u201C": '"',  # left double quote
        "\u201D": '"',  # right double quote
        "\u2013": "-",  # en dash
        "\u2014": "-",  # em dash
        "\u2022": "-",  # bullet
        "\u2023": "-",  # triangular bullet
        "\u2043": "-",  # hyphen bullet
        "\uFFFD": "-",  # replacement character
    }
    for k, v in replacements.items():
        s = s.replace(k, v)
    return s


@router.post("/api/chat", response_model=ChatReply)
def chat_with_coach(req: ChatRequest):
    # Lookup member
    members = load_members()
    member = next((m for m in members if str(m.id) == str(req.memberId)), None)
    if not member:
        return ChatReply(reply="I couldn't find that member. Try selecting a member first.", suggestedActions=[])

    # Reuse existing NBA logic, augmenting with the chat message as note text
    nba = apply_rules(member, note_text=req.message)
    actions = format_actions(nba)

    # Simple intent mapping from message
    intents = match_keywords(req.message)

    # Natural Q&A style response aligned to NBAs and flags
    lines: List[str] = []
    flags = getattr(member, "context", None).flags if getattr(member, "context", None) else None

    if ("suicide" in intents) or (getattr(flags, "cssrs_recent_positive", False)):
        lines.append("I’m detecting possible suicide risk. Next steps within peer scope:")
        lines.append("• Run the brief C-SSRS screen; escalate to clinician/988 on any positive.")
        lines.append("• Confirm or create a Safety Plan with the member.")

    if ("followup" in intents) or (
        getattr(flags, "recent_discharge_within_30d", False) and not getattr(flags, "fuh7_done", False)
    ):
        lines.append("They’re recently discharged without a completed 7-day FUH. Suggest:")
        lines.append("• Schedule the 7-day follow-up; confirm reminders and transportation.")

    if ("meds" in intents) or getattr(flags, "med_adherence_issue", False):
        lines.append("There may be a medication access/adherence issue:")
        lines.append("• Confirm refill pickup and pharmacy; address barriers (transport/pharmacy hours).")

    if ("housing" in intents) or getattr(flags, "sdoh_housing_insecure", False):
        lines.append("Housing stability is a concern:")
        lines.append("• Offer a warm referral to housing resources; set a small benefits task.")

    if ("food" in intents) or getattr(flags, "sdoh_food_insecure", False):
        lines.append("Food insecurity present:")
        lines.append("• Provide local food support resources; consider reminder setup.")

    if not lines:
        lines.append("Here are suggested next best actions based on the current context.")

    reply_text = "\n".join(lines)
    reply_text = _clean_text(reply_text)
    return ChatReply(reply=reply_text, suggestedActions=actions)


BASE_DIR = Path(__file__).resolve().parent.parent
BACKEND_DIR = Path(__file__).resolve().parent
RULES_PATH = BASE_DIR / "rules.json"
SEED_MEMBERS_PATH = BACKEND_DIR / "seed_members.json"


def read_json(path: Path) -> Any:
    with path.open("rb") as f:
        return orjson.loads(f.read())


def load_members() -> List[Member]:
    data = read_json(SEED_MEMBERS_PATH)
    return [Member.model_validate(m) for m in data["members"]]


def load_rules() -> List[Rule]:
    data = read_json(RULES_PATH)
    return [Rule.model_validate(r) for r in data["rules"]]


def get_value(obj: Any, path: str) -> Any:
    cur = obj
    for part in path.split('.'):
        if isinstance(cur, dict):
            cur = cur.get(part)
        else:
            cur = getattr(cur, part, None)
    return cur


def eval_predicate(member: Member, note_text: str | None, pred: str) -> bool:
    # supports:
    #   - "context.flags.X == true/false"
    #   - "context.notes.contains('term')"
    #   - "context.notes.toLowerCase().includes('term')" (compat with rules.json)
    pred = pred.strip()
    if ".contains(" in pred or ".includes(" in pred:
        # Normalize includes/contains and handle optional toLowerCase()
        func = ".includes(" if ".includes(" in pred else ".contains("
        idx = pred.find(func)
        left = pred[:idx]
        args = pred[idx + len(func):]
        # strip toLowerCase() from accessor if present
        left = left.strip()
        if left.endswith(".toLowerCase()"):
            left = left[: -len(".toLowerCase()")]
        left = left.rstrip(".")
        args = args.strip()
        if not (args.startswith("(") and args.endswith(")")):
            return False
        term = args[1:-1].strip().strip("'\"")
        value = get_value(member, left)
        text = str(value or "")
        if note_text:
            text = text + "\n" + note_text
        return term.lower() in text.lower()
    # equality check
    if "==" in pred:
        left, right = [p.strip() for p in pred.split("==", 1)]
        value = get_value(member, left)
        if right.lower() in ("true", "false"):
            expected = right.lower() == "true"
            return bool(value) is expected
        # string literal
        right_val = right.strip("'\"")
        return str(value) == right_val
    if "!=" in pred:
        left, right = [p.strip() for p in pred.split("!=", 1)]
        value = get_value(member, left)
        if right.lower() in ("true", "false"):
            expected = right.lower() == "true"
            return bool(value) is not expected
        right_val = right.strip("'\"")
        return str(value) != right_val
    return False


RISK_SCORE = {"green": 1, "amber": 2, "red": 3}
RULE_REASON = {
    "risk_cssrs_positive_flag": "Recent positive C-SSRS or suicidal ideation noted",
    "post_discharge_no_fuh7": "Recent discharge without 7-day FUH",
    "low_risk_recovery": "Low risk; focus on recovery goals",
    "med_adherence_issue": "Medication access/adherence concern",
    "sdoh_housing_food": "Housing/food insecurity flagged",
    "primary_care_coord": "Primary care coordination needed post-discharge"
}


def apply_rules(member: Member, note_text: str | None) -> NBAResponse:
    rules = load_rules()
    matched: List[Rule] = []
    for rule in rules:
        ok_all = True
        ok_any = False
        if rule.if_all:
            ok_all = all(eval_predicate(member, note_text, p) for p in rule.if_all)
        if rule.if_any:
            ok_any = any(eval_predicate(member, note_text, p) for p in rule.if_any)
        # If both are present, require both to hold (if_all True and if_any True)
        if rule.if_all and rule.if_any:
            if ok_all and ok_any:
                matched.append(rule)
        elif rule.if_all:
            if ok_all:
                matched.append(rule)
        elif rule.if_any:
            if ok_any:
                matched.append(rule)

    if not matched:
        # default safe baseline
        actions = [
            NBAAction(id="act_barriers", label="Check barriers (transport/pharmacy)", priority=3),
        ]
        return NBAResponse(member_id=member.id, risk_level="green", reasons=["No specific rules matched"], actions=actions)

    # Determine highest risk and aggregate actions
    top_risk = max((r.risk for r in matched), key=lambda r: RISK_SCORE.get(r, 0))
    reasons = [RULE_REASON.get(r.id, f"Rule matched: {r.id}") for r in matched]
    all_actions: Dict[str, NBAAction] = {}
    for r in matched:
        for a in r.actions:
            # Keep min priority if duplicates
            if a.id in all_actions:
                if a.priority < all_actions[a.id].priority:
                    all_actions[a.id] = a
            else:
                all_actions[a.id] = a
    actions_sorted = sorted(all_actions.values(), key=lambda a: a.priority)

    return NBAResponse(member_id=member.id, risk_level=top_risk, reasons=reasons, actions=actions_sorted)


app = FastAPI(title="Peer Guide Coach API", version="0.1.0")

frontend_origins = [o.strip() for o in os.getenv("FRONTEND_ORIGINS", "").split(",") if o.strip()]
origin_regex = os.getenv(
    "FRONTEND_ORIGIN_REGEX",
    r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$|^https?://([a-zA-Z0-9-]+\.)*onrender\.com$",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=frontend_origins,
    allow_origin_regex=origin_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


EVENT_LOG: List[Dict[str, Any]] = []


@app.get("/api/health")
def health():
    return {"ok": True}


# Mount chat router
app.include_router(router)

@app.get("/api/members")
def list_members():
    return {"members": [m.model_dump() for m in load_members()]}


@app.get("/api/members/{member_id}")
def get_member(member_id: int):
    members = load_members()
    for m in members:
        if m.id == member_id:
            return m.model_dump()
    raise HTTPException(status_code=404, detail="Member not found")


@app.post("/api/nba", response_model=NBAResponse)
def post_nba(body: NBARequest):
    members = load_members()
    member = next((m for m in members if m.id == body.member_id), None)
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    # Apply optional context override
    if body.context_override:
        # Very simple merge into member.context.flags and notes if provided
        if "flags" in body.context_override:
            for k, v in dict(body.context_override["flags"]).items():
                if hasattr(member.context.flags, k):
                    setattr(member.context.flags, k, bool(v))
        if "notes" in body.context_override:
            member.context.notes = str(body.context_override["notes"])
    return apply_rules(member, body.note_text)


@app.post("/api/log")
def post_log(event: LogEvent):
    d = event.model_dump()
    d["ts"] = d.get("ts") or time.time()
    EVENT_LOG.append(d)
    # keep in-memory log bounded
    if len(EVENT_LOG) > 1000:
        del EVENT_LOG[:200]
    return {"ok": True}
