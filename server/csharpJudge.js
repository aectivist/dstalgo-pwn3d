const path = require('path');
const { spawn } = require('child_process');

// Built via `dotnet build -c Release` inside judge-host/ (see README).
// Override with the JUDGE_HOST_DLL env var if you publish it elsewhere.
const DEFAULT_DLL = path.join(__dirname, '..', 'judge-host', 'bin', 'Release', 'net9.0', 'JudgeHost.dll');
const JUDGE_HOST_DLL = process.env.JUDGE_HOST_DLL || DEFAULT_DLL;

// judge-host now runs a REAL `dotnet build` per submission plus one
// process per test case (see judge-host/Program.cs), each with its own
// internal timeout (15s build, 5s/test) -- this outer timeout is just a
// last-resort circuit breaker in case judge-host itself hangs in a way
// its own internal timeouts don't catch, so it's set comfortably above
// the worst realistic case (build + several test runs).
const TIMEOUT_MS = 45000;

// Runs one problem's full submission (a complete, standalone C# program --
// no hidden driver) against its stdin/stdout test cases by spawning a
// fresh JudgeHost process per call. The timeout is enforced HERE, by
// killing the child process, as a final backstop -- that's the only
// reliable way to stop something stuck in an infinite loop; nothing inside
// the child process can safely interrupt itself if its own timeouts fail.
function runCSharp({ code, tests }) {
  return new Promise((resolve) => {
    let child;
    try {
      child = spawn('dotnet', [JUDGE_HOST_DLL]);
    } catch (err) {
      resolve({ ok: false, error: `Failed to start judge process: ${err.message}` });
      return;
    }

    let stdout = '';
    let stderr = '';
    let settled = false;

    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      child.kill('SIGKILL');
      resolve({ ok: false, error: 'Judge process timed out unexpectedly.' });
    }, TIMEOUT_MS);

    child.stdout.on('data', (chunk) => { stdout += chunk; });
    child.stderr.on('data', (chunk) => { stderr += chunk; });

    child.on('error', (err) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve({
        ok: false,
        error: `Failed to start judge process: ${err.message}. Is the .NET SDK installed, and has judge-host been built (cd judge-host && dotnet build -c Release)?`,
      });
    });

    child.on('close', () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      const lastLine = stdout.trim().split('\n').filter(Boolean).pop() || '';
      try {
        resolve(JSON.parse(lastLine));
      } catch (e) {
        resolve({ ok: false, error: stderr.trim() || 'Judge process produced no output' });
      }
    });

    child.stdin.write(JSON.stringify({ code, tests }));
    child.stdin.end();
  });
}

module.exports = { runCSharp };
