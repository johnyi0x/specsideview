# Reset local ingest state (no UTF-8 BOM — safe for Python json)

$here = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $here

Remove-Item -Path "drafts\*.json" -ErrorAction SilentlyContinue

python -c @"
import json
from pathlib import Path
root = Path('.')
json.dump({'items': []}, open(root / 'recommendation_log.json', 'w', encoding='utf-8'), indent=2)
json.dump({'generatedAt': None, 'items': []}, open(root / 'pending_recommendations.json', 'w', encoding='utf-8'), indent=2)
print('Local ingest reset done.')
print('Next: python sync_catalog.py   (Neon works on your PC now)')
"@
