type Write = typeof process.stdout.write;
type BoundWrite = (...args: unknown[]) => boolean;

export interface CapturedOutput {
  restore: () => void;
  text: () => string;
}

/**
 * Collects both streams. Nest sends `log` to stdout and `error` to stderr, so
 * asserting on one alone silently ignores every failure path.
 */
export function captureOutput(): CapturedOutput {
  const chunks: string[] = [];
  const originalStdout = process.stdout.write.bind(process.stdout) as BoundWrite;
  const originalStderr = process.stderr.write.bind(process.stderr) as BoundWrite;

  const tee =
    (original: BoundWrite): Write =>
    ((chunk: string | Uint8Array, ...rest: unknown[]) => {
      chunks.push(chunk.toString());
      return original(chunk, ...rest);
    }) as Write;

  process.stdout.write = tee(originalStdout);
  process.stderr.write = tee(originalStderr);

  return {
    restore: () => {
      process.stdout.write = originalStdout as Write;
      process.stderr.write = originalStderr as Write;
    },
    text: () => chunks.join(''),
  };
}
