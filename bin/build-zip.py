#!/usr/bin/env python3
"""Build the distributable plugin ZIP from the files tracked by git.

Usage:  python3 bin/build-zip.py [--out dist/]

- Only git-tracked files are packaged (no local junk, no node_modules).
- Paths listed in .distignore are excluded (tests, replica docs, build tooling).
- Every entry sits under a top-level `nexus-lead-suite/` folder, which is the
  folder name WordPress expects for this plugin.
- Entry timestamps are fixed to the commit date so the same commit always
  produces a byte-identical ZIP; a .sha256 file is written next to it.
"""
import fnmatch
import hashlib
import os
import re
import subprocess
import sys
import time
import zipfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SLUG = 'nexus-lead-suite'


def run(*cmd):
    return subprocess.check_output(cmd, cwd=ROOT).decode().strip()


def load_ignores():
    out = []
    with open(os.path.join(ROOT, '.distignore'), encoding='utf-8') as fh:
        for line in fh:
            line = line.strip()
            if line and not line.startswith('#'):
                out.append(line.rstrip('/'))
    return out


def ignored(path, patterns):
    for p in patterns:
        if path == p or path.startswith(p + '/') or fnmatch.fnmatch(path, p):
            return True
    return False


def main():
    out_dir = os.path.join(ROOT, 'dist')
    if '--out' in sys.argv:
        out_dir = os.path.abspath(sys.argv[sys.argv.index('--out') + 1])
    os.makedirs(out_dir, exist_ok=True)

    with open(os.path.join(ROOT, SLUG + '.php'), encoding='utf-8') as fh:
        m = re.search(r'^\s*\*\s*Version:\s*([0-9A-Za-z.\-+]+)', fh.read(), re.M)
    version = m.group(1) if m else '0.0.0'
    sha = run('git', 'rev-parse', '--short', 'HEAD')
    commit_ts = int(run('git', 'log', '-1', '--format=%ct'))
    dirty = run('git', 'status', '--porcelain', '--untracked-files=no') != ''
    date_tuple = time.gmtime(commit_ts)[:6]

    patterns = load_ignores()
    files = [f for f in run('git', 'ls-files').split('\n') if f and not ignored(f, patterns)]
    missing = [f for f in files if not os.path.isfile(os.path.join(ROOT, f))]
    if missing:
        sys.exit('tracked files missing from the working tree: ' + ', '.join(missing))

    name = '%s-%s-%s%s.zip' % (SLUG, version, sha, '-dirty' if dirty else '')
    target = os.path.join(out_dir, name)
    with zipfile.ZipFile(target, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as zf:
        # Explicit directory entries help WordPress' unzip on some hosts.
        seen_dirs = set()
        for f in sorted(files):
            parts = f.split('/')
            for i in range(1, len(parts)):
                d = SLUG + '/' + '/'.join(parts[:i]) + '/'
                if d not in seen_dirs:
                    seen_dirs.add(d)
                    zi = zipfile.ZipInfo(d, date_time=date_tuple)
                    zi.external_attr = 0o755 << 16
                    zf.writestr(zi, b'')
            zi = zipfile.ZipInfo(SLUG + '/' + f, date_time=date_tuple)
            zi.compress_type = zipfile.ZIP_DEFLATED
            zi.external_attr = 0o644 << 16
            with open(os.path.join(ROOT, f), 'rb') as fh:
                zf.writestr(zi, fh.read())

    digest = hashlib.sha256(open(target, 'rb').read()).hexdigest()
    with open(target + '.sha256', 'w', encoding='utf-8') as fh:
        fh.write('%s  %s\n' % (digest, name))
    print('built   %s' % target)
    print('files   %d (git-tracked, minus .distignore)' % len(files))
    print('size    %.1f MB' % (os.path.getsize(target) / 1048576))
    print('sha256  %s' % digest)
    if dirty:
        print('WARNING: working tree has uncommitted changes; the ZIP is marked -dirty')


if __name__ == '__main__':
    main()
