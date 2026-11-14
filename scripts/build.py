#!/usr/bin/env python3
"""Build both the offline file and the static website using Python's standard library."""
from pathlib import Path
import hashlib
import json
import os
import subprocess
import sys

ROOT = Path(__file__).resolve().parent.parent

def main():
    config = json.loads((ROOT / 'project.json').read_text(encoding='utf-8'))
    baseline = ROOT / config['build_base']
    if not baseline.is_file():
        raise SystemExit(f'Missing required build base: {baseline}')
    for key in ('offline_filename', 'canonical_filename'):
        if Path(config[key]).name != config[key] or not config[key].endswith('.html'):
            raise SystemExit(f'{key} must be a simple .html filename')
    environment = dict(os.environ, PYTHONUTF8='1')
    subprocess.run([sys.executable, str(ROOT / 'math-gallery/revise_semantics.py')], cwd=ROOT, env=environment, check=True)
    payload = (ROOT / 'dist/index.html').read_bytes()
    assert payload == (ROOT / 'dist' / config['offline_filename']).read_bytes()
    print('Website: dist/index.html')
    print('Offline: dist/' + config['offline_filename'])
    print('SHA256: ' + hashlib.sha256(payload).hexdigest())

if __name__ == '__main__':
    main()
