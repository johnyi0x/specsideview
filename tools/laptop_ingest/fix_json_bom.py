#!/usr/bin/env python3
"""Rewrite local JSON files without UTF-8 BOM (fixes PowerShell Set-Content issues)."""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent

for name in ("catalog.json", "recommendation_log.json", "pending_recommendations.json"):
    path = ROOT / name
    if not path.exists():
        continue
    data = json.loads(path.read_text(encoding="utf-8-sig"))
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Fixed: {name}")

for draft in (ROOT / "drafts").glob("*.json"):
    data = json.loads(draft.read_text(encoding="utf-8-sig"))
    draft.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Fixed: {draft.name}")

print("Done.")
