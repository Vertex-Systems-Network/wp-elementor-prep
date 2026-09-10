# P10 corrected real REST rerun

After merging the REST geometry correction, rerun the CLI against the same accepted scope:

```powershell
$env:FIGMA_TOKEN = '<local token>'
npm run audit:figma -- --file-key 01SIsqGVDm32KsaZnxHPR9 --node-id 3434:8258 --out p12-cli-real-v2
Remove-Item Env:FIGMA_TOKEN
```

Do not commit or upload the token. Retain the generated audit report, backlog and source snapshot for parity comparison with the real-plugin baseline.
