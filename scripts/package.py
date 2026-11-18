import os
import sys
import zipfile
import shutil
from pathlib import Path
import shutil
import subprocess

ROOT = Path(__file__).resolve().parents[1]
FRONTEND = ROOT / "frontend"
DIST_DIR = ROOT / "dist"
ZIP_PATH = DIST_DIR / "peer-guide-coach_beta.zip"

EXCLUDES = {
    ".git",
    ".venv",
    "node_modules",
    "__pycache__",
}


def should_exclude(path: Path) -> bool:
    parts = set(path.parts)
    # Exclude top-level dist only (not frontend/dist)
    if path.is_relative_to(ROOT / "dist"):
        return True
    if any(part in EXCLUDES for part in parts):
        return True
    if path.name.endswith(".pyc") or path.name == ".DS_Store":
        return True
    return False


def resolve_npm() -> str:
    candidates = ["npm", "npm.cmd"] if os.name == "nt" else ["npm"]
    for c in candidates:
        found = shutil.which(c)
        if found:
            return found
    raise FileNotFoundError(
        "npm was not found on PATH. Please install Node.js 18+ and try again."
    )


def ensure_frontend_build():
    print("[package] Ensuring frontend build...")
    npm_path = resolve_npm()
    subprocess.check_call([npm_path, "install"], cwd=str(FRONTEND))
    subprocess.check_call([npm_path, "run", "build"], cwd=str(FRONTEND))


def make_zip():
    DIST_DIR.mkdir(parents=True, exist_ok=True)
    if ZIP_PATH.exists():
        ZIP_PATH.unlink()
    base = ROOT
    with zipfile.ZipFile(ZIP_PATH, "w", compression=zipfile.ZIP_DEFLATED) as z:
        for path in base.rglob("*"):
            if should_exclude(path):
                continue
            if path.is_dir():
                continue
            rel = path.relative_to(base)
            z.write(path, rel.as_posix())
    print(f"[package] Wrote {ZIP_PATH}")


def main():
    os.chdir(ROOT)
    ensure_frontend_build()
    make_zip()


if __name__ == "__main__":
    main()
