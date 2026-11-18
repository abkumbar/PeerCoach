import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from fastapi.testclient import TestClient
from backend.app import app

client = TestClient(app)

bodies = [
    {},
    {"memberId": 1},
    {"message": "hi"},
    {"memberId": 1, "message": "hi"},
    {"memberId": "1", "message": "hi"},
]

for body in bodies:
    r = client.post('/api/chat', json=body)
    print('body:', body, '->', r.status_code)
    print(r.json())
