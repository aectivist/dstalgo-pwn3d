// JudgeHost: a one-shot process spawned by the Node backend for every
// Run/Submit click. Reads a single JSON request from stdin, compiles and
// executes the submitted C# against a problem's test cases using Roslyn
// scripting, and writes a single JSON result line to stdout.
//
// Safety model: this process does NOT try to sandbox the submitted code or
// enforce its own timeout -- untrusted C# can spin forever in a way no
// in-process cancellation token can safely interrupt. Instead, the *parent*
// Node process enforces the timeout by killing this whole process if it
// doesn't respond in time (see server/csharpJudge.js). That's the only
// approach that's actually reliable against an infinite loop.
//
// This process is meant to run on a machine you trust to execute the code
// you write for yourself -- it is not hardened against a malicious author,
// only against accidents (infinite loops, bad output).

using System;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.CodeAnalysis.CSharp.Scripting;
using Microsoft.CodeAnalysis.Scripting;

namespace JudgeHost
{
    public class JudgeRequest
    {
        public string Preamble { get; set; }
        public string Code { get; set; }
        public string Driver { get; set; }
        public string TestsJson { get; set; }
    }

    // Exposed to the script as bare globals -- "Tests" is directly usable
    // inside preamble/driver code without any prefix.
    public class ScriptGlobals
    {
        public JsonElement Tests { get; set; }
    }

    public static class Program
    {
        // Shared helpers available to every problem's preamble/driver, so
        // individual problems don't have to redeclare this boilerplate.
        private const string SharedPrelude = @"
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Reflection;

public class TestOutcome
{
    public bool Pass { get; set; }
    public object Output { get; set; }
    public object Expected { get; set; }
    public string Error { get; set; }
}

public static class JudgeHelpers
{
    public static readonly JsonSerializerOptions JsonOptions = new JsonSerializerOptions
    {
        PropertyNameCaseInsensitive = true
    };

    public static bool DeepEqualJson(object a, object b)
    {
        return JsonSerializer.Serialize(a) == JsonSerializer.Serialize(b);
    }

    public static T Arg<T>(JsonElement test, int index)
    {
        return JsonSerializer.Deserialize<T>(test.GetProperty(""args"")[index].GetRawText(), JsonOptions);
    }

    public static T Expected<T>(JsonElement test)
    {
        return JsonSerializer.Deserialize<T>(test.GetProperty(""expected"").GetRawText(), JsonOptions);
    }

    // Generic driver for 'design' problems: a class exercised by a sequence
    // of operation names + per-call arguments, e.g. [""MinStack"",""push"",...].
    // Test shape: { args: [ops, opArgs], expected: [...] }
    public static List<object> RunDesignOps<TClass>(JsonElement test) where TClass : class
    {
        var ops = JsonSerializer.Deserialize<string[]>(test.GetProperty(""args"")[0].GetRawText(), JsonOptions);
        var opArgsRaw = test.GetProperty(""args"")[1];
        var results = new List<object>();
        TClass instance = null;
        var ctor = typeof(TClass).GetConstructors()[0];

        for (int i = 0; i < ops.Length; i++)
        {
            var argsElement = opArgsRaw[i];
            if (i == 0)
            {
                var ctorParams = ctor.GetParameters();
                var ctorArgs = new object[ctorParams.Length];
                for (int p = 0; p < ctorParams.Length; p++)
                {
                    ctorArgs[p] = JsonSerializer.Deserialize(argsElement[p].GetRawText(), ctorParams[p].ParameterType, JsonOptions);
                }
                instance = (TClass)ctor.Invoke(ctorArgs);
                results.Add(null);
                continue;
            }

            var method = typeof(TClass).GetMethod(ops[i]);
            if (method == null) throw new Exception(""No method named '"" + ops[i] + ""' on "" + typeof(TClass).Name);
            var pars = method.GetParameters();
            var args = new object[pars.Length];
            for (int p = 0; p < pars.Length; p++)
            {
                args[p] = JsonSerializer.Deserialize(argsElement[p].GetRawText(), pars[p].ParameterType, JsonOptions);
            }
            var res = method.Invoke(instance, args);
            results.Add(res);
        }

        return results;
    }
}
";

        public static async Task<int> Main(string[] args)
        {
            string input;
            using (var reader = new System.IO.StreamReader(Console.OpenStandardInput(), Encoding.UTF8))
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

            try
            {
                var fullScript = string.Join("\n", new[]
                {
                    SharedPrelude,
                    request.Preamble ?? "",
                    request.Code ?? "",
                    request.Driver ?? "",
                });

                var options = ScriptOptions.Default
                    .WithReferences(
                        typeof(object).Assembly,
                        typeof(System.Linq.Enumerable).Assembly,
                        typeof(System.Text.Json.JsonSerializer).Assembly,
                        typeof(System.Collections.Generic.List<>).Assembly
                    )
                    .WithImports("System", "System.Collections.Generic", "System.Linq", "System.Text.Json", "System.Reflection");

                var testsElement = string.IsNullOrWhiteSpace(request.TestsJson)
                    ? JsonSerializer.Deserialize<JsonElement>("[]")
                    : JsonSerializer.Deserialize<JsonElement>(request.TestsJson);

                var globals = new ScriptGlobals { Tests = testsElement };

                var scriptResult = await CSharpScript.EvaluateAsync<object>(fullScript, options, globals);

                WriteResult(new { ok = true, results = scriptResult });
            }
            catch (CompilationErrorException cex)
            {
                var message = string.Join("\n", cex.Diagnostics);
                WriteResult(new { ok = false, error = "Compile error:\n" + message });
            }
            catch (Exception ex)
            {
                WriteResult(new { ok = false, error = ex.Message });
            }

            return 0;
        }

        private static readonly JsonSerializerOptions OutputOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        };

        private static void WriteResult(object result)
        {
            Console.WriteLine(JsonSerializer.Serialize(result, OutputOptions));
        }
    }
}
