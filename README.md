# DSTALGO PWN3D

A LeetCode-style practice site built around the DSTALGO course topics: arrays &
Big-O, sorting algorithms, multi-dimensional/jagged arrays, ArrayLists &
abstract data types, linked lists, and stacks & queues. Solutions are written
and judged in **C#**, matching the course itself.

## Running it

Requires Node.js and the **.NET SDK** (developed against .NET 9; check with
`dotnet --version`).

```bash
# 1. Build the C# judge host (only needed once, or after editing judge-host/)
cd judge-host
dotnet build -c Release
cd ..

# 2. Set up and run the web app
npm install
npm run seed   # creates/updates data/app.db with categories + problems
npm start
```

Then open http://localhost:3000, register an account, and start solving.

Want to put this on the public internet with your own domain? See
[DEPLOYMENT.md](DEPLOYMENT.md) -- it also covers a security consideration
worth reading before you open registration to strangers.

> **Note on this repo's history**: this was built and iterated on a Windows
> machine, but the C# judge host itself was written to be run/tested on
> Linux (that's where `dotnet build` and the actual judge execution should
> happen first) -- if something in `judge-host/` doesn't compile or run
> cleanly on the first try, that's expected to be shaken out there rather
> than assumed already-verified.

## How it works

- **Auth**: username/password (bcrypt-hashed), token-based sessions stored in
  SQLite, set as an httpOnly cookie. No external auth provider needed.
- **Judge**: solutions are written in C# and compiled/run **server-side** by
  `judge-host` (a small .NET console app using Roslyn scripting to compile
  and execute code dynamically -- see `judge-host/Program.cs`). This is a
  different tradeoff than a client-side JS sandbox: C# can't be safely
  sandboxed in a browser, so instead each Run/Submit click spawns a fresh
  `judge-host` process (`server/csharpJudge.js`), and the **Node parent
  process enforces the timeout by killing the child** if it doesn't respond
  in time -- the only reliable way to stop code that's stuck in an infinite
  loop, since nothing inside a runaway process can safely interrupt itself.
  This is meant for running code *you* wrote, on a machine *you* trust --
  it isn't hardened against a deliberately malicious submission.
  "Run" just shows results; "Submit" also records the attempt (the server
  computes pass/fail itself, not the client) and marks the problem solved
  once all tests pass.
- **Leveling & leaderboard**: solving a problem for the first time awards XP
  based on difficulty (`server/leveling.js`), which feeds a level badge in the
  topbar and the `/api/leaderboard` ranking.
- **Notes**: `server/notesData.js` holds an ordered set of topic writeups
  (matching the course's own topic order), shown as a collapsible list on
  the Notes page. Code examples there are C# too.
- **Themes**: a settings (gear) button in the topbar switches between four
  look-and-feel presets -- Frutiger Aero, Minimalist Dark, Minimalist Light,
  and LeetCode -- by swapping the `theme-*.css` stylesheet linked in
  `index.html`. The choice is remembered per-browser in `localStorage`.
  `public/css/base.css` has all the shared layout rules; each `theme-*.css`
  file only supplies colors/gradients/shadows/fonts for that look.
- **Data**: `server/problemsData.js` holds every category and problem
  (description, starter C# code, test cases, and the C# "driver" that calls
  the user's method/class for each test). `npm run seed` upserts by slug, so
  re-seeding after adding new problems never disturbs existing users'
  progress or submission history.

## How the C# judge works, in more detail

Each problem has three C# pieces (all in `server/problemsData.js`):

- **`preamble`** - optional helper types/functions available to both the
  starter code and the driver (e.g. the `ListNode` class + `ArrayToList`/
  `ListToArray` helpers for linked-list problems).
- **`starter_code`** - the method or class stub shown in the editor, which
  the user edits and submits.
- **`driver`** - C# code that reads the `Tests` global (a JSON array),
  calls the user's function/class for each test case via two small helpers
  on the `JudgeHelpers` class (`JudgeHelpers.Arg<T>(test, index)` and
  `JudgeHelpers.Expected<T>(test)`, both provided by `judge-host`'s shared
  prelude), and must end with a bare expression of type
  `List<TestOutcome>` -- Roslyn scripting returns whatever the last,
  semicolon-less expression evaluates to.

`judge-host` concatenates: its own shared prelude (defines `TestOutcome` and
the `JudgeHelpers` class -- `Arg<T>`, `Expected<T>`, `DeepEqualJson`, and
`RunDesignOps<TClass>` for class-based "design" problems like `MinStack`) +
the problem's `preamble` + the user's `code` + the problem's `driver`, then
compiles and runs the whole thing as one Roslyn script. Everything is
called fully-qualified (`JudgeHelpers.Arg<T>`, not just `Arg<T>`) rather
than relying on a `using static`, since Roslyn scripting's rules for where
`using` directives are allowed to appear are looser/less predictable than in
a normal C# file, and this sidesteps the question entirely.

Design-pattern problems (a class exercised by a sequence of operations, e.g.
`MinStack.Push`/`Pop`/`Top`/`GetMin`) use `JudgeHelpers.RunDesignOps<TClass>`,
which drives the class via reflection: it reads an `ops` array of method names
and a matching `opArgs` array of per-call arguments from the test's JSON,
constructs the instance, and invokes each named method in turn.

## Adding more problems

Whenever you want more problems for a category (or all of them), the
`problems` array in `server/problemsData.js` is the single place to extend.
Each entry needs: `slug`, `category`, `title`, `difficulty`,
`description_html`, `starter_code` (C#), `preamble` (C#, optional), a
`driver` (C#, see above -- `defaultDriver(...)` and `designDriver(...)` cover
most cases), and `tests` (`args`/`expected` pairs, still plain JSON). After
adding entries, run `npm run seed` again.

## Adding a theme

Add a new `public/css/theme-<name>.css` file (copy an existing one as a
starting point -- it only needs to set colors/gradients/shadows, since layout
lives in `base.css`), then register it in the `THEME_FILES` map in both
`public/js/theme.js` and the inline bootstrap script at the top of
`public/index.html`, and add an entry to the `THEMES` list in `theme.js`.

## License

[MIT](LICENSE)
