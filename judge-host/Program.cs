// JudgeHost: a one-shot process spawned by the Node backend for every
// Run/Submit click. Reads a single JSON request from stdin: the
// submission's full C# source plus a list of stdin/stdout test cases.
//
// Unlike the old Roslyn-scripting version, this ACTUALLY compiles the
// submission with `dotnet build` -- a real C# compiler, real compile
// errors, no hidden driver concatenated invisibly onto the student's code.
// The submission is a complete, standalone Program.cs with its own Main;
// nothing else is added to it before compiling.
//
// Grading model: for each test case, the compiled program is run as its
// own process with the test's `input` piped to stdin, and its stdout is
// compared (trimmed) against the test's `expectedOutput`. This is the
// classic competitive-programming judging model (Codeforces/HackerRank
// style), not "call a specific function and inspect its return value".
//
// Safety model: this process does NOT try to sandbox the submitted code --
// untrusted C# can spin forever in a way no in-process cancellation token
// can safely interrupt. Every subprocess this host spawns (the build, and
// each test run) has its own timeout enforced by killing that subprocess.
// The Node parent additionally kills this whole host process if it doesn't
// respond in time at all (see server/csharpJudge.js), as a last resort.
//
// This process is meant to run on a machine you trust to execute the code
// you write for yourself -- it is not hardened against a malicious author,
// only against accidents (infinite loops, bad output).

using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading;
using System.Threading.Tasks;

namespace JudgeHost
{
    public class TestCase
    {
        public string Input { get; set; } = "";
        public string ExpectedOutput { get; set; } = "";
    }

    public class JudgeRequest
    {
        public string Code { get; set; }
        public List<TestCase> Tests { get; set; } = new List<TestCase>();
    }

    public class TestResult
    {
        public bool Pass { get; set; }
        public string Output { get; set; }
        public string Expected { get; set; }
        public string Error { get; set; }
    }

    public static class Program
    {
        // Where the pre-restored submission project template lives (baked
        // into the Docker image at build time, with network access -- the
        // running container has none, so nothing here may touch the
        // network at request time). Override with JUDGE_TEMPLATE_DIR.
        private static readonly string TemplateDir =
            Environment.GetEnvironmentVariable("JUDGE_TEMPLATE_DIR") ?? "/opt/judge-template";

        private const int BuildTimeoutMs = 15000;
        private const int RunTimeoutMs = 5000;
        private const int MaxOutputChars = 4000;

        private static readonly JsonSerializerOptions OutputOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        };

        public static async Task<int> Main(string[] args)
        {
            string input;
            using (var reader = new StreamReader(Console.OpenStandardInput(), Encoding.UTF8))
            {
                input = await reader.ReadToEndAsync();
            }

            JudgeRequest request;
            try
            {
                request = JsonSerializer.Deserialize<JudgeRequest>(input, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            }
            catch (Exception ex)
            {
                WriteResult(new { ok = false, error = "Invalid request JSON: " + ex.Message });
                return 0;
            }

            string submissionDir = Path.Combine(Path.GetTempPath(), "judge-" + Guid.NewGuid().ToString("N"));
            try
            {
                Directory.CreateDirectory(submissionDir);
                CopyTemplate(TemplateDir, submissionDir);
                await File.WriteAllTextAsync(Path.Combine(submissionDir, "Program.cs"), request.Code ?? "");

                string outDir = Path.Combine(submissionDir, "out");
                var buildResult = await RunProcessAsync(
                    "dotnet",
                    $"build --no-restore -c Release -o \"{outDir}\" --nologo -v quiet",
                    submissionDir,
                    stdinInput: null,
                    timeoutMs: BuildTimeoutMs);

                if (buildResult.TimedOut)
                {
                    WriteResult(new { ok = false, error = "Compile timed out." });
                    return 0;
                }
                if (buildResult.ExitCode != 0)
                {
                    string buildLog = (buildResult.Stdout + "\n" + buildResult.Stderr).Trim();
                    WriteResult(new { ok = false, error = "Compile error:\n" + Truncate(buildLog, MaxOutputChars) });
                    return 0;
                }

                string dllPath = Path.Combine(outDir, "Submission.dll");
                if (!File.Exists(dllPath))
                {
                    WriteResult(new { ok = false, error = "Build succeeded but Submission.dll was not produced." });
                    return 0;
                }

                var results = new List<TestResult>();
                foreach (var test in request.Tests ?? new List<TestCase>())
                {
                    var runResult = await RunProcessAsync("dotnet", $"\"{dllPath}\"", outDir, test.Input ?? "", RunTimeoutMs);

                    if (runResult.TimedOut)
                    {
                        results.Add(new TestResult
                        {
                            Pass = false,
                            Output = Truncate(Normalize(runResult.Stdout), MaxOutputChars),
                            Expected = Normalize(test.ExpectedOutput),
                            Error = "Time limit exceeded (possible infinite loop)",
                        });
                        continue;
                    }

                    string actual = Normalize(runResult.Stdout);
                    string expected = Normalize(test.ExpectedOutput);
                    bool pass = runResult.ExitCode == 0 && actual == expected;
                    string error = null;
                    if (runResult.ExitCode != 0)
                    {
                        error = Truncate(runResult.Stderr.Trim(), MaxOutputChars);
                        if (string.IsNullOrEmpty(error)) error = $"Program exited with code {runResult.ExitCode}.";
                    }

                    results.Add(new TestResult
                    {
                        Pass = pass,
                        Output = Truncate(actual, MaxOutputChars),
                        Expected = expected,
                        Error = error,
                    });
                }

                WriteResult(new { ok = true, results });
            }
            catch (Exception ex)
            {
                WriteResult(new { ok = false, error = ex.Message });
            }
            finally
            {
                try { Directory.Delete(submissionDir, recursive: true); } catch { /* best effort */ }
            }

            return 0;
        }

        // Copies just the pre-restored project file(s) needed to build with
        // --no-restore: the .csproj and the obj/ directory NuGet populated
        // during the image build (see Dockerfile). Never copies bin/ or any
        // stray Program.cs from the template.
        private static void CopyTemplate(string templateDir, string destDir)
        {
            foreach (var file in Directory.GetFiles(templateDir, "*.csproj"))
            {
                File.Copy(file, Path.Combine(destDir, Path.GetFileName(file)));
            }
            string objSrc = Path.Combine(templateDir, "obj");
            if (Directory.Exists(objSrc))
            {
                CopyDirectory(objSrc, Path.Combine(destDir, "obj"));
            }
        }

        private static void CopyDirectory(string sourceDir, string destDir)
        {
            Directory.CreateDirectory(destDir);
            foreach (var file in Directory.GetFiles(sourceDir))
            {
                File.Copy(file, Path.Combine(destDir, Path.GetFileName(file)));
            }
            foreach (var dir in Directory.GetDirectories(sourceDir))
            {
                CopyDirectory(dir, Path.Combine(destDir, Path.GetFileName(dir)));
            }
        }

        // \r\n -> \n, then trim leading/trailing whitespace -- keeps
        // comparisons robust to trailing newlines/CR without silently
        // ignoring meaningful whitespace inside the output.
        private static string Normalize(string s)
        {
            if (s == null) return "";
            return s.Replace("\r\n", "\n").Trim();
        }

        private static string Truncate(string s, int max)
        {
            if (s == null) return "";
            return s.Length <= max ? s : s.Substring(0, max) + "\n... (truncated)";
        }

        private class ProcResult
        {
            public int ExitCode;
            public string Stdout = "";
            public string Stderr = "";
            public bool TimedOut;
        }

        private static async Task<ProcResult> RunProcessAsync(string fileName, string arguments, string workingDir, string stdinInput, int timeoutMs)
        {
            var psi = new ProcessStartInfo
            {
                FileName = fileName,
                Arguments = arguments,
                WorkingDirectory = workingDir,
                RedirectStandardInput = true,
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
            };

            using var process = new Process { StartInfo = psi, EnableRaisingEvents = true };
            var stdout = new StringBuilder();
            var stderr = new StringBuilder();

            process.OutputDataReceived += (_, e) => { if (e.Data != null) stdout.AppendLine(e.Data); };
            process.ErrorDataReceived += (_, e) => { if (e.Data != null) stderr.AppendLine(e.Data); };

            process.Start();
            process.BeginOutputReadLine();
            process.BeginErrorReadLine();

            if (stdinInput != null)
            {
                await process.StandardInput.WriteAsync(stdinInput);
            }
            process.StandardInput.Close();

            using var cts = new CancellationTokenSource(timeoutMs);
            bool timedOut = false;
            try
            {
                await process.WaitForExitAsync(cts.Token);
            }
            catch (OperationCanceledException)
            {
                timedOut = true;
                try { process.Kill(entireProcessTree: true); } catch { /* already gone */ }
                try { await process.WaitForExitAsync(); } catch { /* best effort */ }
            }

            return new ProcResult
            {
                ExitCode = timedOut ? -1 : process.ExitCode,
                Stdout = stdout.ToString(),
                Stderr = stderr.ToString(),
                TimedOut = timedOut,
            };
        }

        private static void WriteResult(object result)
        {
            Console.WriteLine(JsonSerializer.Serialize(result, OutputOptions));
        }
    }
}
