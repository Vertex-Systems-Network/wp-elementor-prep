from pathlib import Path
import textwrap

workflow = Path('.github/workflows/docs-sync-323.yml').read_text()
start = "python - <<'PY'\n"
end = "\n          PY"
if workflow.count(start) != 1 or workflow.count(end) != 1:
    raise SystemExit('Unable to locate the bounded Python body in docs-sync-323.yml')
body = workflow.split(start, 1)[1].split(end, 1)[0]
exec(compile(textwrap.dedent(body), 'docs-sync-323-extracted.py', 'exec'))
