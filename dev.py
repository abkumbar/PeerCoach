import os
import sys
import subprocess
import threading
import shutil
import socket
from pathlib import Path
import shutil

ROOT = Path(__file__).parent.resolve()
VENV_DIR = ROOT / ".venv"
BACKEND_DIR = ROOT / "backend"
FRONTEND_DIR = ROOT / "frontend"


def run(cmd, cwd=None, env=None, prefix=""):
    proc = subprocess.Popen(
        cmd,
        cwd=cwd,
        env=env,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
    )

    def stream():
        for line in proc.stdout:  # type: ignore[attr-defined]
            sys.stdout.write(f"[{prefix}] {line}")

    t = threading.Thread(target=stream, daemon=True)
    t.start()
    return proc


def ensure_venv():
    if not VENV_DIR.exists():
        print("[dev] Creating Python venv...")
        subprocess.check_call([sys.executable, "-m", "venv", str(VENV_DIR)])
    # pip install
    pip = VENV_DIR / ("Scripts/pip.exe" if os.name == "nt" else "bin/pip")
    print("[dev] Installing backend requirements...")
    subprocess.check_call([str(pip), "install", "-r", str(BACKEND_DIR / "requirements.txt")])


def resolve_npm() -> str:
    # On Windows, npm is typically npm.cmd
    candidates = ["npm", "npm.cmd"] if os.name == "nt" else ["npm"]
    for c in candidates:
        found = shutil.which(c)
        if found:
            return found
    raise FileNotFoundError(
        "npm was not found on PATH. Please install Node.js 18+ from https://nodejs.org and ensure npm is available."
    )


def ensure_frontend(npm_path: str):
    print("[dev] Installing frontend dependencies (npm install)...")
    subprocess.check_call([npm_path, "install"], cwd=str(FRONTEND_DIR))


def find_free_port(start: int = 5173, limit: int = 20) -> int:
    for p in range(start, start + limit):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            try:
                s.bind(("127.0.0.1", p))
                return p
            except OSError:
                continue
    return 0


def free_port_windows(port: int) -> None:
    if os.name != "nt":
        return
    try:
        out = subprocess.check_output(
            [
                "cmd",
                "/c",
                f"netstat -ano | findstr LISTENING | findstr :{port}"
            ],
            text=True,
            stderr=subprocess.DEVNULL,
        )
        pids = set()
        for line in out.splitlines():
            parts = line.split()
            if parts:
                pids.add(parts[-1])
        for pid in pids:
            try:
                subprocess.run(["taskkill", "/PID", pid, "/F"], check=False, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            except Exception:
                pass
    except subprocess.CalledProcessError:
        pass


def main():
    os.chdir(ROOT)
    ensure_venv()
    try:
        npm_path = resolve_npm()
    except FileNotFoundError as e:
        print(f"[dev] ERROR: {e}")
        print("[dev] Tip: On Windows, installing Node.js adds npm; reopen terminal after install.")
        sys.exit(1)
    ensure_frontend(npm_path)

    py = VENV_DIR / ("Scripts/python.exe" if os.name == "nt" else "bin/python")
    env_backend = os.environ.copy()
    env_backend["PYTHONUNBUFFERED"] = "1"

    # Start backend (FastAPI with Uvicorn) on a free port to avoid Windows reserved ranges
    free_port_windows(8000)
    backend_port = find_free_port(8000, 50) or 8000
    backend_cmd = [
        str(py),
        "-m",
        "uvicorn",
        "backend.app:app",
        "--reload",
        "--host",
        "127.0.0.1",
        "--port",
        str(backend_port),
    ]
    p_backend = run(backend_cmd, cwd=str(ROOT), env=env_backend, prefix="backend")
    print(f"[dev] Backend:  http://127.0.0.1:{backend_port}")

    # Start frontend (Vite dev). Choose a free port to avoid conflicts.
    free_port_windows(5173)
    port = find_free_port(5173, 20)
    chosen_port = str(port if port else 5173)
    frontend_cmd = [npm_path, "run", "dev", "--", "--port", chosen_port]
    env_frontend = os.environ.copy()
    # Ensure the frontend points to the chosen backend port (bypasses Vite proxy if set)
    env_frontend["VITE_API_URL"] = f"http://localhost:{backend_port}"
    p_frontend = run(frontend_cmd, cwd=str(FRONTEND_DIR), env=env_frontend, prefix="frontend")
    print(f"[dev] Frontend: http://localhost:{chosen_port}")

    try:
        # Wait until either process exits
        while True:
            rb = p_backend.poll()
            rf = p_frontend.poll()
            if rb is not None or rf is not None:
                break
            threading.Event().wait(0.5)
    except KeyboardInterrupt:
        print("\n[dev] Shutting down...")
    finally:
        for p in (p_backend, p_frontend):
            if p.poll() is None:
                try:
                    p.terminate()
                except Exception:
                    pass


if __name__ == "__main__":
    main()
