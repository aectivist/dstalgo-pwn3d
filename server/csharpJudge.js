const path = require('path');
const { spawn } = require('child_process');

// Built via `dotnet build -c Release` inside judge-host/ (see README).
// Override with the JUDGE_HOST_DLL env var if you publish it elsewhere.
const DEFAULT_DLL = path.join(__dirname, '..', 'judge-host', 'bin', 'Release', 'net9.0', 'JudgeHost.dll');
const JUDGE_HOST_DLL = process.env.JUDGE_HOST_DLL || DEFAULT_DLL;

// Generous vs. the old in-browser JS timeout: every run pays a fresh
// process start + Roslyn compile cost, not just execution.
const TIMEOUT_MS = 10000;

// Runs one problem's (preamble + user code + driver) against its tests by
// spawning a fresh JudgeHost process per call. The timeout is enforced HERE,
// by killing the child process -- that's the only reliable way to stop
// arbitrary C# that might be stuck in an infinite loop; nothing inside the
// child process can safely interrupt itself.
function runCSharp({ preamble, code, driver, testsJson }) {
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
      resolve({ ok: false, error: 'Time limit exceeded (possible infinite loop)' });
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

    child.stdin.write(JSON.stringify({ preamble, code, driver, testsJson }));
    child.stdin.end();
  });
}

module.exports = { runCSharp };
