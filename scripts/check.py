#!/usr/bin/env python3
"""Build and run the retained Node-based checks from any current directory."""
from pathlib import Path
import argparse
from datetime import datetime, timezone
import json
import os
import shutil
import subprocess
import sys
import time

ROOT = Path(__file__).resolve().parent.parent
CHECKS = ('verify_qr_links.cjs', 'verify_footer_navigation.cjs', 'verify_lower_parameters.cjs', 'verify_p111_clockwise.cjs', 'verify_review_ui.cjs', 'verify_semantics.cjs', 'verify_numeric_parameters.cjs', 'verify_equation_integration.cjs')

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--skip-build', action='store_true', help='Check the already-built HTML')
    parser.add_argument('--node', default=os.environ.get('NODE_BINARY', 'node'), help='Node executable, defaults to NODE_BINARY or node on PATH')
    args = parser.parse_args()
    node = shutil.which(args.node)
    if not node:
        raise SystemExit('Node.js not found. Install Node 20+ or pass --node /path/to/node.')
    version = subprocess.check_output([node, '--version'], text=True).strip()
    if int(version.lstrip('v').split('.')[0]) < 20:
        raise SystemExit('Node.js 20+ is required; found ' + version)
    if not args.skip_build:
        subprocess.run([sys.executable, str(ROOT / 'scripts/build.py')], cwd=ROOT, check=True)
    logs = ROOT / 'tmp/check-logs'
    logs.mkdir(parents=True, exist_ok=True)
    results = []
    for check in CHECKS:
        start = time.monotonic()
        proc = subprocess.run([node, check], cwd=ROOT / 'math-gallery', stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, encoding='utf-8')
        (logs / (check + '.log')).write_text(proc.stdout, encoding='utf-8')
        result = {'check': check, 'exit_code': proc.returncode, 'seconds': round(time.monotonic() - start, 2), 'log': 'tmp/check-logs/' + check + '.log'}
        results.append(result)
        print(('PASS ' if proc.returncode == 0 else 'FAIL ') + check, flush=True)
        if proc.returncode:
            print(proc.stdout[-6000:], flush=True)
    report = {'checked_at_utc': datetime.now(timezone.utc).isoformat(), 'node': version, 'checks': results}
    (ROOT / 'tmp/check-results.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print('Report: tmp/check-results.json')
    return int(any(item['exit_code'] for item in results))

if __name__ == '__main__':
    raise SystemExit(main())
