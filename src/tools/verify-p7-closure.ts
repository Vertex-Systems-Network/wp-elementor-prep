import { P7_BUILD_IDENTITY } from '../plugin/build-info';
import { verifyP7ClosureExportBundle } from '../plugin/p7-closure-verifier';

declare const process: {
  stdin: {
    setEncoding(encoding: string): void;
    on(event: 'data', listener: (chunk: string) => void): void;
    on(event: 'end', listener: () => void): void;
  };
  stdout: { write(value: string): void };
  stderr: { write(value: string): void };
  exitCode: number;
};

let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
  input += chunk;
});
process.stdin.on('end', () => {
  try {
    const parsed: unknown = JSON.parse(input);
    const verification = verifyP7ClosureExportBundle(parsed, P7_BUILD_IDENTITY);
    process.stdout.write(`${JSON.stringify(verification, null, 2)}\n`);
    process.exitCode = verification.accepted ? 0 : 1;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`Invalid JSON input: ${message}\n`);
    process.exitCode = 2;
  }
});
