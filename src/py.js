/* ===== Playbook.py: Python adapter + drills ===== */
const GAME = {
  key: "py", langName: "Python", fileName: "play.py", indent: "    ", indentAfter: /:\s*$/,
  exampleLabel: "Run examples", exampleHeading: "Walkthrough: first two examples only, no snap used",
  editorHelp: "Tab indents 4 spaces · Ctrl/⌘ + Enter runs examples",
  consoleTip: "print() works inside your code. Whatever you print shows up under the test results, which is the fastest way to see what a variable holds.",
  starter(c) { return "def " + c.sig + ":\n    # your code here\n    pass\n"; },
  examplesHtml(c) {
    return '<div class="examples">' + c.tests.slice(0, 2).map(t => '<div>' + esc(c.fn + "(" + t.a + ")") + ' <b>→ ' + esc(t.e) + '</b></div>').join("") + '</div>';
  },
  ready: new Promise((res, rej) => { let n = 0; const tick = () => { if (window.Sk && Sk.builtinFiles) res(); else if (++n > 200) rej(new Error("skulpt")); else setTimeout(tick, 100); }; tick(); }),
  run(code, c, examplesOnly) {
    const tests = examplesOnly ? c.tests.slice(0, 2) : c.tests;
    const SEP = "\u001f", MARK = "<<GR>>";
    let h = code + "\n\n";
    h += "def __gr_eq(g, e):\n" +
      "    if isinstance(g, bool) or isinstance(e, bool):\n        return g is e\n" +
      "    if isinstance(g, (int, float)) and isinstance(e, (int, float)):\n        return abs(g - e) < 1e-9\n" +
      "    if isinstance(g, list) and isinstance(e, list):\n        return len(g) == len(e) and all([__gr_eq(a, b) for a, b in zip(g, e)])\n" +
      "    if isinstance(g, tuple) and isinstance(e, tuple):\n        return len(g) == len(e) and all([__gr_eq(a, b) for a, b in zip(g, e)])\n" +
      "    if isinstance(g, dict) and isinstance(e, dict):\n        return set(g.keys()) == set(e.keys()) and all([__gr_eq(g[k], e[k]) for k in e])\n" +
      "    return g == e and type(g) == type(e)\n";
    tests.forEach(t => {
      h += "try:\n    __g = " + c.fn + "(" + t.a + ")\n    __e = " + t.e + "\n" +
        "    print('" + MARK + "' + ('ok' if __gr_eq(__g, __e) else 'no') + '" + SEP + "' + repr(__g) + '" + SEP + "' + repr(__e))\n" +
        "except Exception as __x:\n    print('" + MARK + "err" + SEP + "' + type(__x).__name__ + ': ' + str(__x) + '" + SEP + "' + repr(" + t.e + "))\n";
    });
    return new Promise(resolve => {
      let out = "";
      Sk.configure({ output: t => { out += t; }, read: f => { if (!Sk.builtinFiles || !Sk.builtinFiles["files"][f]) throw "File not found: " + f; return Sk.builtinFiles["files"][f]; }, __future__: Sk.python3, execLimit: 3000 });
      const finish = err => {
        const logs = [], results = [];
        out.split("\n").forEach(line => {
          if (line.startsWith(MARK)) { const p = line.slice(MARK.length).split(SEP); results.push({ status: p[0], got: p[1], exp: p[2] }); }
          else if (line.length) logs.push(line);
        });
        if (err) {
          let msg = String(err);
          if (/TimeLimitError/.test(msg)) msg = "Play clock expired: your code ran longer than 3 seconds. Look for a loop that never ends.";
          const m = msg.match(/NameError: name '(\w+)' is not defined/);
          if (m && m[1] === c.fn) msg = "Couldn't find a function named " + c.fn + ". Keep the function name from the starter code.";
          return resolve({ error: msg, logs });
        }
        const res = tests.map((t, i) => {
          const r = results[i] || { status: "err", got: "no result", exp: t.e };
          if (r.status === "err") { const m = r.got.match(/NameError: name '(\w+)' is not defined/); if (m && m[1] === c.fn) r.got = "Couldn't find a function named " + c.fn + ". Keep the function name from the starter code."; }
          return { ok: r.status === "ok", got: r.got, exp: r.exp, label: c.fn + "(" + t.a + ")" };
        });
        resolve({ results: res, logs, passed: !examplesOnly && res.every(r => r.ok) });
      };
      try { Sk.misceval.asyncToPromise(() => Sk.importMainWithBody("<stdin>", false, h, true)).then(() => finish(null), e => finish(e.toString())); }
      catch (e) { finish(e.toString()); }
    });
  },
  resultHtml(c, res, examplesOnly) {
    let h = "";
    if (res.error) h += '<div class="err">Flag on the play: ' + esc(res.error) + '</div>';
    else {
      const passed = res.results.filter(r => r.ok).length;
      h += '<div class="eyebrow" style="margin-top:14px">' + passed + ' of ' + res.results.length + ' tests passing</div><div class="tests">' +
        res.results.map(r => '<div class="t ' + (r.ok ? "ok" : "no") + '"><span class="g">' + (r.ok ? "✓" : "✗") + '</span><div class="body">' + esc(r.label) + '<div class="exp">expected ' + esc(r.exp) + (r.ok ? "" : ' · got ' + esc(r.got)) + '</div></div></div>').join("") + '</div>';
    }
    if (res.logs && res.logs.length) h += '<div class="console"><b>print output</b>\n' + esc(res.logs.join("\n")) + '</div>';
    return h;
  }
};

const CH = [
  /* ================= FUNDAMENTALS (Training Camp) ================= */
  { id: "c1", tier: "camp", concept: "Functions & return", title: "Three-Point Stance", fn: "snap", sig: "snap()",
    teach: {
      what: "A <b>function</b> is a named block of code you can run whenever you want by calling its name with parentheses. <code>def</code> starts one. Everything indented under it is the body. <code>return</code> hands a value back to whoever called it, and the function stops right there.",
      football: "A function is a play in the playbook. It has a name (<code>snap</code>), it's written once, and the QB calls it as many times as he wants. <code>return</code> is the result of the play: what comes back to the sideline when it's over.",
      example: "def cadence():\n    return \"SET\"\n\nword = cadence()   # calls the play; word is now \"SET\"\nprint(word)"
    },
    prompt: "Make <code>snap()</code> return the string <code>\"HUT\"</code>. Replace <code>pass</code> (a placeholder that does nothing) with a return line.",
    tests: [{ a: "", e: "'HUT'" }],
    hint: "One line inside the function: <code>return \"HUT\"</code>. Keep the 4-space indent; Python uses indentation to know what's inside the function.",
    note: "Two things to lock in. Indentation is not decoration in Python, it's the grammar: the indented lines are the function body. And a string needs quotes; <code>HUT</code> without quotes would be a variable name Python has never heard of.",
    sol: "def snap():\n    return \"HUT\"",
    walk: [["def snap():", "Declares a function named snap that takes no inputs. The colon says the body is next."], ["    return \"HUT\"", "Indented 4 spaces, so it belongs to snap. Hands back the text HUT and ends the function."]] },

  { id: "c2", tier: "camp", concept: "Variables", title: "Count the Bodies", fn: "players_on_field", sig: "players_on_field()",
    teach: {
      what: "A <b>variable</b> is a name that holds a value. <code>offense = 11</code> stores 11 under the name <code>offense</code>. You can read it later, do math with it, or overwrite it. The single <code>=</code> means \"store\", not \"equals\".",
      football: "Variables are the labels on the depth chart. <code>starting_qb = \"Reyes\"</code> is the name on the board; if he gets hurt you write a new name over it. The label stays, the value changes.",
      example: "offense = 11\ndefense = 11\ntotal = offense + defense   # 22\nrefs = 7\ntotal = total + refs        # overwrite: now 29"
    },
    prompt: "Inside the function, create two variables: <code>offense</code> set to 11 and <code>defense</code> set to 11. Return their sum. (Yes, you could just return 22. Do it the long way; that's the point of the drill.)",
    tests: [{ a: "", e: "22" }],
    hint: "Three lines: <code>offense = 11</code>, <code>defense = 11</code>, <code>return offense + defense</code>.",
    note: "Naming values instead of sprinkling raw numbers around is how code stays readable. Six months from now <code>offense + defense</code> explains itself; <code>11 + 11</code> doesn't. Use lowercase words joined with underscores, which is the Python naming convention called snake_case.",
    sol: "def players_on_field():\n    offense = 11\n    defense = 11\n    return offense + defense",
    walk: [["offense = 11", "Store 11 under the name offense."], ["defense = 11", "Store 11 under the name defense."], ["return offense + defense", "Add the two values and hand back the result, 22."]] },

  { id: "c3", tier: "camp", concept: "Numbers & math", title: "Yards Per Carry", fn: "yards_per_carry", sig: "yards_per_carry(yards, carries)",
    teach: {
      what: "Python has two everyday number types: <b>int</b> (whole numbers like 7) and <b>float</b> (decimals like 4.3). Math operators: <code>+ - * /</code>, plus <code>//</code> (divide and drop the remainder), <code>%</code> (the remainder itself) and <code>**</code> (power). <code>/</code> always gives a float. <code>round(x, 1)</code> rounds to one decimal.",
      football: "Stats are just math on numbers the crew wrote down. Yards per carry is total yards divided by carries. The <code>%</code> operator is the odd one: <code>125 % 60</code> is 5, the seconds left over after you pull out full minutes, which is how a game clock works.",
      example: "print(7 / 2)       # 3.5\nprint(7 // 2)      # 3\nprint(7 % 2)       # 1\nprint(2 ** 3)      # 8\nprint(round(4.347, 1))  # 4.3"
    },
    prompt: "The function receives two <b>parameters</b> (inputs): <code>yards</code> and <code>carries</code>. Return yards per carry rounded to 1 decimal place. You can assume <code>carries</code> is never 0 for now.",
    tests: [{ a: "100, 23", e: "4.3" }, { a: "50, 10", e: "5.0" }, { a: "7, 2", e: "3.5" }, { a: "-6, 4", e: "-1.5" }],
    hint: "<code>return round(yards / carries, 1)</code>",
    note: "Parameters are variables that get filled in by whoever calls the function. <code>yards_per_carry(100, 23)</code> sets <code>yards = 100</code> and <code>carries = 23</code> before the body runs. The division gives a float, and <code>round</code> trims it. We'll deal with the divide-by-zero case in a later drill; it's a real bug that needs its own concept.",
    sol: "def yards_per_carry(yards, carries):\n    return round(yards / carries, 1)",
    walk: [["def yards_per_carry(yards, carries):", "Two parameters. Each call fills them with real numbers."], ["return round(yards / carries, 1)", "Divide first (parentheses go inside out), then round to 1 decimal, then return."]] },

  { id: "c4", tier: "camp", concept: "Strings", title: "Jersey Press", fn: "nameplate", sig: "nameplate(last, number)",
    teach: {
      what: "A <b>string</b> is text in quotes. You can glue strings with <code>+</code>, change case with <code>.upper()</code> and <code>.lower()</code>, and measure with <code>len()</code>. The cleanest way to mix variables into text is an <b>f-string</b>: put <code>f</code> before the quote and wrap variables in curly braces.",
      football: "The equipment manager presses a nameplate from a template: LAST NAME, space, #, number. The template never changes; the values slot in. That's an f-string. Numbers and text are different types, which is why you can't do <code>\"#\" + 92</code> without converting; the f-string handles the conversion for you.",
      example: "last = \"walker\"\nprint(last.upper())            # WALKER\nprint(f\"{last.upper()} #{92}\") # WALKER #92\nprint(\"HUT \" + \"HUT\")           # HUT HUT\nprint(len(\"HUT\"))             # 3"
    },
    prompt: "Build the back-of-jersey label: the last name in ALL CAPS, a space, <code>#</code>, then the number. <code>nameplate(\"Walker\", 92)</code> returns <code>\"WALKER #92\"</code>.",
    tests: [{ a: "\"Walker\", 92", e: "'WALKER #92'" }, { a: "\"smith\", 7", e: "'SMITH #7'" }, { a: "\"O'Neal\", 55", e: "\"O'NEAL #55\"" }],
    hint: "<code>return f\"{last.upper()} #{number}\"</code>",
    note: "<code>.upper()</code> is a <b>method</b>: a function that belongs to a value and is called with a dot. Strings come with dozens (<code>.strip()</code>, <code>.split()</code>, <code>.replace()</code>, <code>.startswith()</code>). The f-string converts the number to text automatically; with <code>+</code> you'd need <code>str(number)</code>.",
    sol: "def nameplate(last, number):\n    return f\"{last.upper()} #{number}\"",
    walk: [["last.upper()", "Method call on the string: gives back an uppercase copy. The original isn't changed."], ["f\"{...} #{number}\"", "An f-string: anything in braces is evaluated and dropped into the text."]] },

  { id: "c5", tier: "camp", concept: "Booleans & comparisons", title: "Move the Chains", fn: "is_first_down", sig: "is_first_down(gained, to_go)",
    teach: {
      what: "A <b>boolean</b> is <code>True</code> or <code>False</code> (capitalized in Python). Comparisons produce booleans: <code>==</code> equal, <code>!=</code> not equal, <code>&lt;</code>, <code>&gt;</code>, <code>&lt;=</code>, <code>&gt;=</code>. Combine them with <code>and</code>, <code>or</code>, <code>not</code>. Note <code>==</code> (compare) is different from <code>=</code> (store).",
      football: "The chain gang doesn't care if you got 10 or 30 yards, only whether the ball reached the stick. That's a yes/no answer, a boolean. The whole measurement is one comparison: did the gain reach the distance?",
      example: "print(10 >= 10)          # True\nprint(9 >= 10)           # False\nprint(3 == 3 and 4 > 5)  # False\nprint(not False)         # True"
    },
    prompt: "Return <code>True</code> if <code>gained</code> is enough to reach the first down marker, which is <code>to_go</code> yards away. Otherwise return <code>False</code>.",
    tests: [{ a: "10, 10", e: "True" }, { a: "9, 10", e: "False" }, { a: "15, 3", e: "True" }, { a: "0, 1", e: "False" }, { a: "-2, 5", e: "False" }],
    hint: "You only need one comparison. Should it be <code>&gt;</code> or <code>&gt;=</code>? Think about gaining exactly 10 on 1st and 10.",
    note: "A comparison already is a boolean, so <code>return gained &gt;= to_go</code> is the whole function. Writing <code>if gained &gt;= to_go: return True else: return False</code> works but says the same thing in five lines. The <code>&gt;=</code> versus <code>&gt;</code> choice is an <b>off-by-one</b> decision, the most common bug in all of programming. Test the boundary on purpose.",
    sol: "def is_first_down(gained, to_go):\n    return gained >= to_go",
    walk: [["gained >= to_go", "Evaluates to True or False. Exactly reaching the stick counts, so >= not >."]] },

  { id: "c6", tier: "camp", concept: "if / elif / else", title: "Ball On", fn: "ball_on", sig: "ball_on(yard_line)",
    teach: {
      what: "<code>if</code> runs a block only when a condition is True. <code>elif</code> (else-if) checks another condition when the first failed. <code>else</code> catches everything left over. Python checks them top to bottom and runs the <b>first</b> one that matches.",
      football: "This is the QB reading the defense. Pre-snap: if it's Cover 2, throw the seam. Else if it's man, run the pick. Else, check down. One read at a time, in order, and you always have a default.",
      example: "def coverage_call(safeties):\n    if safeties == 2:\n        return \"seam\"\n    elif safeties == 1:\n        return \"post\"\n    else:\n        return \"check down\""
    },
    prompt: "Yard lines run from your own goal line (0) to the opponent's (100). Return the broadcast label: under 50 is <code>\"OWN 25\"</code> style, exactly 50 is <code>\"50\"</code>, over 50 is <code>\"OPP\"</code> plus the distance to the goal line (70 becomes <code>\"OPP 30\"</code>).",
    tests: [{ a: "25", e: "'OWN 25'" }, { a: "70", e: "'OPP 30'" }, { a: "50", e: "'50'" }, { a: "99", e: "'OPP 1'" }, { a: "1", e: "'OWN 1'" }],
    hint: "Three branches. On the opponent's side the number is <code>100 - yard_line</code>. Use an f-string for each label.",
    note: "Handle the special case (exactly 50) on purpose instead of hoping it falls into a branch. Since <code>return</code> ends the function, you can skip <code>elif</code> entirely and just stack <code>if</code> statements, each returning; a lot of Python is written that way. Both styles are fine; pick one and be consistent.",
    sol: "def ball_on(yard_line):\n    if yard_line < 50:\n        return f\"OWN {yard_line}\"\n    elif yard_line == 50:\n        return \"50\"\n    else:\n        return f\"OPP {100 - yard_line}\"",
    walk: [["if yard_line < 50:", "First read. If true, return and we're done."], ["elif yard_line == 50:", "Only checked when the first read failed. Double equals compares."], ["else:", "Everything left over, which can only be more than 50."], ["f\"OPP {100 - yard_line}\"", "Math inside the braces is fine."]] },

  { id: "c7", tier: "camp", concept: "Lists", title: "Opening Script", fn: "opening_script", sig: "opening_script(plays)",
    teach: {
      what: "A <b>list</b> holds values in order: <code>[\"Dive\", \"Slant\", \"Sweep\"]</code>. Positions start at <b>0</b>, so <code>plays[0]</code> is the first item and <code>plays[-1]</code> is the last. A <b>slice</b> <code>plays[0:3]</code> gives items 0, 1, 2 (the end is not included). <code>len(plays)</code> counts them, <code>plays.append(x)</code> adds to the end.",
      football: "A list is the call sheet: plays written in order, and the order matters. Coaches script the first 15; that's a slice off the top. Counting from 0 feels wrong for a week and then feels normal. Think of it as yards from the start, not play number.",
      example: "plays = [\"Dive\", \"Slant\", \"Sweep\", \"Draw\", \"Fade\"]\nprint(plays[0])      # Dive\nprint(plays[-1])     # Fade\nprint(plays[1:3])    # ['Slant', 'Sweep']\nprint(len(plays))    # 5\nplays.append(\"Screen\")"
    },
    prompt: "The coordinator scripts the first three plays. Given the full list <code>plays</code>, return a new list with just the first three. If there are fewer than three, return them all.",
    tests: [{ a: "[\"Dive\", \"Slant\", \"Sweep\", \"Draw\"]", e: "['Dive', 'Slant', 'Sweep']" }, { a: "[\"Dive\"]", e: "['Dive']" }, { a: "[]", e: "[]" }, { a: "[\"A\", \"B\", \"C\"]", e: "['A', 'B', 'C']" }],
    hint: "A slice: <code>plays[0:3]</code> or just <code>plays[:3]</code>. Slices never error when the list is short; they give what exists.",
    note: "Slices are forgiving: <code>[\"Dive\"][:3]</code> just returns <code>[\"Dive\"]</code>. Direct indexing is not: <code>plays[2]</code> on a one-item list raises an <b>IndexError</b>, which is a crash. When you need \"up to N items\", reach for a slice.",
    sol: "def opening_script(plays):\n    return plays[:3]",
    walk: [["plays[:3]", "From the start up to (not including) index 3: positions 0, 1, 2. Short lists just return what they have."]] },

  { id: "c8", tier: "camp", concept: "for loops", title: "Total Rushing Yards", fn: "total_yards", sig: "total_yards(carries)",
    teach: {
      what: "A <code>for</code> loop runs its body once per item: <code>for y in carries:</code> sets <code>y</code> to each value in turn. The most common loop shape is the <b>accumulator</b>: start a total at 0 before the loop, add to it inside the loop, use it after.",
      football: "The stat crew doesn't wait until the end and guess. They start at zero and after every carry they add it to the running total. Loop over the carries, add each one, report the number when the last carry is in.",
      example: "carries = [3, 5, -2, 12]\ntotal = 0\nfor y in carries:\n    total = total + y   # or: total += y\nprint(total)            # 18"
    },
    prompt: "Return the total yards from a list of carries. Losses are negative numbers and count against the total. An empty list returns 0.",
    tests: [{ a: "[3, 5, -2, 12]", e: "18" }, { a: "[40]", e: "40" }, { a: "[]", e: "0" }, { a: "[-1, -3]", e: "-4" }, { a: "[10, 10, 10, 10, 10]", e: "50" }],
    hint: "Create <code>total = 0</code> before the loop. Inside: <code>total += y</code>. Return <code>total</code> after the loop ends (unindented).",
    note: "Python's built-in <code>sum(carries)</code> does this in one call, and in real code you'd use it. The loop is the drill because the accumulator pattern is everywhere: counting, building strings, tracking a maximum. Watch the indentation of <code>return</code>: inside the loop it returns after the first carry; outside, it returns after all of them.",
    sol: "def total_yards(carries):\n    total = 0\n    for y in carries:\n        total += y\n    return total",
    walk: [["total = 0", "The accumulator. Must exist before the loop, outside it."], ["for y in carries:", "y takes each value in order: 3, then 5, then -2, then 12."], ["    total += y", "Short for total = total + y. Runs once per carry."], ["return total", "Dedented back to the function level, so it runs after the loop is finished."]] },

  { id: "c9", tier: "camp", concept: "while loops", title: "Plays to the Sticks", fn: "plays_to_first_down", sig: "plays_to_first_down(gain_per_play)",
    teach: {
      what: "A <code>while</code> loop repeats <b>as long as</b> a condition stays True. Use it when you don't know how many times you'll loop up front. Something inside the loop must move toward making the condition False or it runs forever.",
      football: "Four-minute offense: keep running the same play until you get the first down. You don't know ahead of time if it takes 2 plays or 4. That's a while loop: while we haven't reached the stick, run it again and count the play.",
      example: "yards = 0\nplays = 0\nwhile yards < 10:\n    yards += 4\n    plays += 1\nprint(plays)   # 3  (4, 8, 12)"
    },
    prompt: "Every play gains exactly <code>gain_per_play</code> yards (always at least 1). Starting from 0, return how many plays it takes to reach 10 yards.",
    tests: [{ a: "3", e: "4" }, { a: "10", e: "1" }, { a: "4", e: "3" }, { a: "1", e: "10" }, { a: "25", e: "1" }],
    hint: "Two counters, <code>yards</code> and <code>plays</code>, both starting at 0. <code>while yards &lt; 10:</code> add the gain and add 1 to plays. Return plays.",
    note: "The thing that makes while loops dangerous is the <b>infinite loop</b>: if <code>gain_per_play</code> were 0, <code>yards</code> would never reach 10 and the program would hang. This game cuts you off after 3 seconds; real programs don't. Whenever you write <code>while</code>, ask what guarantees the condition eventually fails.",
    sol: "def plays_to_first_down(gain_per_play):\n    yards = 0\n    plays = 0\n    while yards < 10:\n        yards += gain_per_play\n        plays += 1\n    return plays",
    walk: [["while yards < 10:", "Checked before every pass through the body. Stops the moment yards reaches 10 or more."], ["yards += gain_per_play", "The line that moves toward the exit. Without it the loop never ends."], ["plays += 1", "Count each time through."]] },

  { id: "c10", tier: "camp", concept: "Dictionaries", title: "Scoring Plays", fn: "points_for", sig: "points_for(play)",
    teach: {
      what: "A <b>dictionary</b> (dict) maps keys to values: <code>{\"TD\": 6, \"FG\": 3}</code>. Look up with square brackets, <code>values[\"TD\"]</code>, which crashes with a <b>KeyError</b> if the key isn't there. <code>values.get(\"XP\", 0)</code> looks up safely and gives the default when missing.",
      football: "A dict is the QB's wristband. Each number on the band (the key) maps to a play (the value). Call \"22\" and you get the play instantly without reading through the whole sheet. Call a number that isn't on the band and you'd better have a default.",
      example: "band = {\"22\": \"Dive\", \"41\": \"Slant\"}\nprint(band[\"22\"])            # Dive\nprint(band.get(\"99\", \"???\"))  # ???\nband[\"50\"] = \"Fade\"           # add a key\nprint(\"41\" in band)          # True"
    },
    prompt: "Given a scoring code, return its point value: <code>\"TD\"</code> 6, <code>\"FG\"</code> 3, <code>\"SAFETY\"</code> 2, <code>\"2PT\"</code> 2, <code>\"PAT\"</code> 1. Anything else is worth 0. Use a dictionary, not a chain of ifs.",
    tests: [{ a: "\"TD\"", e: "6" }, { a: "\"FG\"", e: "3" }, { a: "\"PAT\"", e: "1" }, { a: "\"SAFETY\"", e: "2" }, { a: "\"2PT\"", e: "2" }, { a: "\"PUNT\"", e: "0" }],
    hint: "Build the dict inside the function, then <code>return values.get(play, 0)</code>.",
    note: "Any time you catch yourself writing <code>if x == \"A\": ... elif x == \"B\": ...</code> with the same shape over and over, it's probably a dictionary. Data instead of logic: easier to read, easier to add to, and the lookup is instant no matter how big the table gets.",
    sol: "def points_for(play):\n    values = {\"TD\": 6, \"FG\": 3, \"SAFETY\": 2, \"2PT\": 2, \"PAT\": 1}\n    return values.get(play, 0)",
    walk: [["values = {...}", "Keys are the codes, values are the points. Curly braces, colon between key and value."], ["values.get(play, 0)", "Look up play. If it isn't a key, give back 0 instead of crashing."]] },

  { id: "c11", tier: "camp", concept: "Lists of dicts & comprehensions", title: "Scouting Report", fn: "names", sig: "names(roster)",
    teach: {
      what: "Real data is usually a <b>list of dictionaries</b>: each dict is one record, each key is a column. Loop over the list to visit each record, then use a key to pull a field. A <b>list comprehension</b> builds a new list in one line: <code>[p[\"name\"] for p in roster]</code> reads \"the name of p, for each p in roster\".",
      football: "The scouting report is a stack of player cards. Each card (a dict) has the same fields: name, position, number. Going through the stack and writing down just the names is a loop that pulls one field per card. Comprehensions are that loop said in one breath.",
      example: "roster = [{\"name\": \"Cole\", \"pos\": \"QB\"}, {\"name\": \"Park\", \"pos\": \"RB\"}]\nfor p in roster:\n    print(p[\"name\"], p[\"pos\"])\n\npositions = [p[\"pos\"] for p in roster]   # ['QB', 'RB']"
    },
    prompt: "<code>roster</code> is a list of dicts like <code>{\"name\": \"Cole\", \"pos\": \"QB\"}</code>. Return a list of just the names, in the same order.",
    tests: [{ a: "[{\"name\": \"Cole\", \"pos\": \"QB\"}, {\"name\": \"Park\", \"pos\": \"RB\"}]", e: "['Cole', 'Park']" }, { a: "[]", e: "[]" }, { a: "[{\"name\": \"Ames\", \"pos\": \"WR\"}]", e: "['Ames']" }],
    hint: "Either build an empty list and <code>.append(p[\"name\"])</code> in a loop, or <code>return [p[\"name\"] for p in roster]</code>.",
    note: "Both versions are correct. The loop-and-append shape is the one to understand first because every comprehension is secretly that loop. Once it's automatic, comprehensions make the intent obvious at a glance. This exact shape, pulling one column out of a list of records, is half of all data work.",
    sol: "def names(roster):\n    return [p[\"name\"] for p in roster]",
    walk: [["[p[\"name\"] for p in roster]", "For each dict p in the list, take p[\"name\"]; collect the results into a new list in the same order."]] },

  { id: "c12", tier: "camp", concept: "Putting it together", title: "Highlight Reel", fn: "count_touchdowns", sig: "count_touchdowns(plays)",
    teach: {
      what: "Most functions you'll ever write are small combinations of the pieces from this camp: a loop, a condition inside it, and an accumulator. Counting matches is the classic one: start at 0, loop, <code>if</code> it matches add 1.",
      football: "Cutting the highlight reel. Go through every play of the game (loop). Is it a touchdown? (condition). If so, it makes the tape (count it). The pattern is the same whether you're counting TDs, sacks, or failed logins.",
      example: "results = [\"RUN\", \"TD\", \"PASS\", \"TD\"]\ncount = 0\nfor r in results:\n    if r == \"TD\":\n        count += 1\nprint(count)   # 2"
    },
    prompt: "<code>plays</code> is a list of results like <code>\"RUN\"</code>, <code>\"PASS\"</code>, <code>\"TD\"</code>, <code>\"INT\"</code>. Return how many of them are <code>\"TD\"</code>.",
    tests: [{ a: "[\"RUN\", \"TD\", \"PASS\", \"TD\"]", e: "2" }, { a: "[\"RUN\", \"PASS\"]", e: "0" }, { a: "[]", e: "0" }, { a: "[\"TD\", \"TD\", \"TD\"]", e: "3" }],
    hint: "Accumulator starts at 0. Inside the loop: <code>if p == \"TD\": count += 1</code>. Watch the double indentation: the <code>if</code> is inside the loop, the <code>+= 1</code> is inside the <code>if</code>.",
    note: "Camp's over. Everything from here on is these same tools in new combinations. Shortcut for the record: <code>plays.count(\"TD\")</code> does this in one call, and <code>sum(1 for p in plays if p == \"TD\")</code> is the comprehension version. Knowing the long way is what lets you read the short ways.",
    sol: "def count_touchdowns(plays):\n    count = 0\n    for p in plays:\n        if p == \"TD\":\n            count += 1\n    return count",
    walk: [["for p in plays:", "Visit every play."], ["    if p == \"TD\":", "Nested inside the loop: checked for each play."], ["        count += 1", "Nested inside the if: only runs for touchdowns."]] },

  /* ================= RUN (easy) ================= */
  { id: "r1", tier: "run", concept: "Dict lookup + accumulator", title: "Drive Points", fn: "score_drive", sig: "score_drive(events)",
    teach: { what: "Two camp patterns stacked: a dictionary for the lookup and an accumulator loop for the total. Use <code>.get(code, 0)</code> so unknown codes add nothing instead of crashing.", football: "Add up a drive from the scoring codes on the sheet. Read each code off the wristband (dict), add its points to the running total (accumulator).", example: "values = {\"TD\": 6, \"PAT\": 1}\ntotal = 0\nfor e in [\"TD\", \"PAT\"]:\n    total += values.get(e, 0)   # 7" },
    prompt: "Return the total points from a list of scoring codes: <code>TD</code> 6, <code>FG</code> 3, <code>PAT</code> 1, <code>2PT</code> 2, <code>SAFETY</code> 2. Unknown codes count 0.",
    tests: [{ a: "[\"TD\", \"PAT\", \"FG\"]", e: "10" }, { a: "[]", e: "0" }, { a: "[\"SAFETY\", \"TD\", \"2PT\"]", e: "10" }, { a: "[\"FG\", \"FG\", \"FG\"]", e: "9" }, { a: "[\"TD\", \"PUNT\"]", e: "6" }],
    hint: "Make the dict, start <code>total = 0</code>, loop and add <code>values.get(e, 0)</code>.",
    note: "One-liner version: <code>sum(values.get(e, 0) for e in events)</code>. Most real code is small patterns combined, the same way a good offense is a few base concepts with tags.",
    sol: "def score_drive(events):\n    values = {\"TD\": 6, \"FG\": 3, \"PAT\": 1, \"2PT\": 2, \"SAFETY\": 2}\n    total = 0\n    for e in events:\n        total += values.get(e, 0)\n    return total",
    walk: [["values.get(e, 0)", "Safe lookup: unknown codes contribute 0."], ["total += ...", "Accumulate across the whole drive."]] },

  { id: "r2", tier: "run", concept: "Filtering", title: "Starting Lineup", fn: "starters", sig: "starters(roster)",
    teach: { what: "Filtering means keeping only the records that pass a test. In a loop: <code>if</code> the test passes, append. In a comprehension, add the condition at the end: <code>[p[\"name\"] for p in roster if p[\"starter\"]]</code>.", football: "Pull the ones in the depth chart's top row. Same stack of cards, but you only write down the names flagged as starters.", example: "ones = [p[\"name\"] for p in roster if p[\"starter\"]]" },
    prompt: "<code>roster</code> is a list of dicts like <code>{\"name\": \"Cole\", \"starter\": True}</code>. Return the <b>names</b> of the starters, in order.",
    tests: [{ a: "[{\"name\": \"Cole\", \"starter\": True}, {\"name\": \"Diaz\", \"starter\": False}, {\"name\": \"Park\", \"starter\": True}]", e: "['Cole', 'Park']" }, { a: "[]", e: "[]" }, { a: "[{\"name\": \"Ames\", \"starter\": False}]", e: "[]" }],
    hint: "<code>if p[\"starter\"]</code> is enough; it's already a boolean, no need for <code>== True</code>.",
    note: "Filter then select is the bread and butter of data work: keep the rows you want, pull the column you need. SQL does the exact same thing with <code>WHERE</code> and <code>SELECT</code>, which is why the SQL game feels familiar after this one.",
    sol: "def starters(roster):\n    return [p[\"name\"] for p in roster if p[\"starter\"]]" },

  { id: "r3", tier: "run", concept: "Repeating & joining strings", title: "Cadence", fn: "snap_count", sig: "snap_count(n)",
    teach: { what: "<code>\" \".join(list_of_strings)</code> glues strings together with a separator between them (never a trailing one). <code>[\"HUT\"] * 3</code> makes a list of three copies. <code>range(n)</code> gives 0 up to n-1 for counted loops.", football: "The cadence is the same word, n times, evenly spaced. Build the pieces, then let join put the spaces between them so you don't end up with a stray space at the end.", example: "print(\" \".join([\"HUT\"] * 3))   # HUT HUT HUT\nprint(\"-\".join([\"a\", \"b\"]))      # a-b\nfor i in range(3):\n    print(i)                       # 0 1 2" },
    prompt: "Return <code>\"HUT\"</code> repeated <code>n</code> times separated by single spaces. <code>snap_count(3)</code> is <code>\"HUT HUT HUT\"</code>. For 0, return an empty string.",
    tests: [{ a: "3", e: "'HUT HUT HUT'" }, { a: "0", e: "''" }, { a: "1", e: "'HUT'" }, { a: "5", e: "'HUT HUT HUT HUT HUT'" }],
    hint: "<code>return \" \".join([\"HUT\"] * n)</code>. Or a loop that appends to a list, then join.",
    note: "Building a string by doing <code>s += \"HUT \"</code> in a loop leaves a trailing space you then have to strip. Collecting pieces in a list and joining once is the idiom; it also runs faster on big inputs.",
    sol: "def snap_count(n):\n    return \" \".join([\"HUT\"] * n)" },

  { id: "r4", tier: "run", concept: "Guard clauses", title: "Yards Per Carry, Safely", fn: "ypc", sig: "ypc(yards, carries)",
    teach: { what: "A <b>guard clause</b> is an early <code>return</code> that handles a bad or special input before the main logic runs. Dividing by zero raises <b>ZeroDivisionError</b>, which crashes the program. Check for it first.", football: "Pre-snap check. If the look is wrong, kill the play before the ball moves. Deal with the problem case at the top so the main play runs clean.", example: "def average(total, count):\n    if count == 0:\n        return 0\n    return total / count" },
    prompt: "Return yards per carry rounded to 1 decimal. If <code>carries</code> is 0, return 0 instead of crashing.",
    tests: [{ a: "100, 23", e: "4.3" }, { a: "0, 0", e: "0" }, { a: "50, 10", e: "5.0" }, { a: "7, 2", e: "3.5" }, { a: "-6, 4", e: "-1.5" }],
    hint: "First line of the body: <code>if carries == 0: return 0</code>. Then the division you wrote in camp.",
    note: "Guards keep the happy path unindented and readable. The alternative, wrapping the whole function in <code>if/else</code>, nests everything one level deeper for no gain. This is also your first <b>edge case</b>: inputs at the boundary where naive code breaks. Zero, empty, negative, huge: always ask.",
    sol: "def ypc(yards, carries):\n    if carries == 0:\n        return 0\n    return round(yards / carries, 1)" },

  { id: "r5", tier: "run", concept: "Sets & membership", title: "Clean Roster", fn: "unique_roster", sig: "unique_roster(names)",
    teach: { what: "A <b>set</b> holds unique values and answers <code>x in s</code> instantly. To remove duplicates while keeping the original order, loop with a <code>seen</code> set: skip anything already seen, otherwise add it to both the set and the output list.", football: "The security desk at the facility. Each name gets through once. The guard keeps a list of who's already inside (the set) and checks it before letting anyone in.", example: "seen = set()\nout = []\nfor n in [\"Cole\", \"Park\", \"Cole\"]:\n    if n not in seen:\n        seen.add(n)\n        out.append(n)\n# out == ['Cole', 'Park']" },
    prompt: "The roster import has duplicates. Return the names with duplicates removed, keeping the order each name <b>first</b> appeared.",
    tests: [{ a: "[\"Cole\", \"Park\", \"Cole\", \"Diaz\", \"Park\"]", e: "['Cole', 'Park', 'Diaz']" }, { a: "[]", e: "[]" }, { a: "[\"Ames\", \"Ames\", \"Ames\"]", e: "['Ames']" }],
    hint: "<code>list(set(names))</code> removes duplicates but scrambles the order, so the tests will fail. Use the seen-set loop.",
    note: "Checking <code>x in some_list</code> scans the whole list every time; <code>x in some_set</code> is a single hash lookup. On 10 names it doesn't matter. On 10 million log lines it's the difference between seconds and hours. Reach for a set whenever the question is \"have I seen this before?\"",
    sol: "def unique_roster(names):\n    seen = set()\n    out = []\n    for n in names:\n        if n not in seen:\n            seen.add(n)\n            out.append(n)\n    return out" },

  { id: "r6", tier: "run", concept: "Tracking a maximum", title: "Longest Run", fn: "longest_run", sig: "longest_run(carries)",
    teach: { what: "To find the biggest value, keep a <code>best</code> variable and replace it whenever you see something bigger. Start <code>best</code> at the <b>first item</b>, not 0, or an all-negative list gives the wrong answer. Guard the empty list first.", football: "A scout tracking the fastest 40 time at the combine: write down the first time, then only erase it when someone beats it.", example: "best = times[0]\nfor t in times:\n    if t < best:   # for fastest, smaller wins\n        best = t" },
    prompt: "Return the longest single carry. If the list is empty, return 0.",
    tests: [{ a: "[4, 22, 7]", e: "22" }, { a: "[-3, -1]", e: "-1" }, { a: "[]", e: "0" }, { a: "[5]", e: "5" }, { a: "[9, 9, 2]", e: "9" }],
    hint: "Guard: <code>if not carries: return 0</code>. Then <code>best = carries[0]</code> and loop.",
    note: "<code>max(carries)</code> exists and you should use it in real code (with the empty guard, since <code>max([])</code> raises an error). The hand-rolled version matters because the next drill needs the same idea on dictionaries, where <code>max</code> needs a key function to help.",
    sol: "def longest_run(carries):\n    if not carries:\n        return 0\n    best = carries[0]\n    for y in carries:\n        if y > best:\n            best = y\n    return best" },

  /* ================= SHORT PASS (medium) ================= */
  { id: "p1", tier: "pass", concept: "Max over records", title: "Rushing Leader", fn: "rushing_leader", sig: "rushing_leader(players)",
    teach: { what: "Same max-tracking, but keep the whole <b>record</b> (the dict) so you can return a different field from it. Using <code>&gt;</code> instead of <code>&gt;=</code> means the first player keeps a tie.", football: "Find the rushing leader on the stat sheet, but report his name, not his yards. You compare on one column and answer with another.", example: "best = players[0]\nfor p in players:\n    if p[\"yards\"] > best[\"yards\"]:\n        best = p\nreturn best[\"name\"]" },
    prompt: "<code>players</code> is a list of <code>{\"name\", \"yards\"}</code> dicts. Return the <b>name</b> of the player with the most yards. On a tie, the first one listed wins. Empty list returns <code>None</code>.",
    tests: [{ a: "[{\"name\": \"Ruiz\", \"yards\": 88}, {\"name\": \"Banks\", \"yards\": 112}, {\"name\": \"Hall\", \"yards\": 40}]", e: "'Banks'" }, { a: "[]", e: "None" }, { a: "[{\"name\": \"Ames\", \"yards\": 50}, {\"name\": \"Bell\", \"yards\": 50}]", e: "'Ames'" }, { a: "[{\"name\": \"Solo\", \"yards\": -3}]", e: "'Solo'" }],
    hint: "Guard the empty case with <code>return None</code>. Keep <code>best</code> as a dict and compare <code>p[\"yards\"] &gt; best[\"yards\"]</code>.",
    note: "<code>None</code> is Python's \"no value\". Returning it for an empty input is a common convention, and callers check with <code>if result is None</code>. The built-in version: <code>max(players, key=lambda p: p[\"yards\"])[\"name\"]</code>; <code>key</code> tells max which field to compare on.",
    sol: "def rushing_leader(players):\n    if not players:\n        return None\n    best = players[0]\n    for p in players:\n        if p[\"yards\"] > best[\"yards\"]:\n            best = p\n    return best[\"name\"]" },

  { id: "p2", tier: "pass", concept: "Index lookups & conditional expressions", title: "Down & Distance", fn: "down_and_distance", sig: "down_and_distance(down, to_go, yard_line)",
    teach: { what: "A list used as a lookup table replaces an if-ladder: <code>ordinals[down]</code>. Pad slot 0 with an empty string so down 1 maps to index 1. A <b>conditional expression</b> picks a value in one line: <code>x = \"Goal\" if cond else to_go</code>.", football: "The TV graphic. The ordinal (1st, 2nd...) is a straight lookup by down number. The distance is a quick read: if the marker is at or past the goal line, say Goal.", example: "ordinals = [\"\", \"1st\", \"2nd\", \"3rd\", \"4th\"]\nprint(ordinals[3])                     # 3rd\nlabel = \"Goal\" if 95 + 10 >= 100 else 10" },
    prompt: "Return the graphic text, like <code>\"1st &amp; 10\"</code> or <code>\"3rd &amp; 7\"</code>. If the marker would be at or past the goal line (<code>yard_line + to_go &gt;= 100</code>), show <code>\"Goal\"</code> instead of the number.",
    tests: [{ a: "1, 10, 25", e: "'1st & 10'" }, { a: "1, 10, 95", e: "'1st & Goal'" }, { a: "3, 7, 40", e: "'3rd & 7'" }, { a: "2, 4, 96", e: "'2nd & Goal'" }, { a: "4, 1, 50", e: "'4th & 1'" }],
    hint: "<code>ordinals = [\"\", \"1st\", \"2nd\", \"3rd\", \"4th\"]</code>, then an f-string: <code>f\"{ordinals[down]} &amp; {distance}\"</code>.",
    note: "Padding index 0 is a tiny trick that removes a whole class of off-by-one bugs. Conditional expressions are great for one simple choice; the moment you need two conditions, go back to a full if/elif block for readability.",
    sol: "def down_and_distance(down, to_go, yard_line):\n    ordinals = [\"\", \"1st\", \"2nd\", \"3rd\", \"4th\"]\n    distance = \"Goal\" if yard_line + to_go >= 100 else to_go\n    return f\"{ordinals[down]} & {distance}\"" },

  { id: "p3", tier: "pass", concept: "Integer division & modulo", title: "Game Clock", fn: "format_clock", sig: "format_clock(seconds)",
    teach: { what: "<code>//</code> gives whole minutes, <code>%</code> gives the leftover seconds. To force two digits, format with <code>f\"{s:02d}\"</code> (pad with 0 to width 2) or <code>str(s).zfill(2)</code>.", football: "The clock operator converts raw seconds to M:SS. 125 seconds: two full minutes (125 // 60) and 5 left over (125 % 60). The pad makes it 2:05 instead of 2:5.", example: "print(125 // 60, 125 % 60)   # 2 5\nprint(f\"{5:02d}\")             # 05" },
    prompt: "Convert seconds remaining to an <code>M:SS</code> clock. <code>format_clock(125)</code> is <code>\"2:05\"</code>. Seconds always show two digits; minutes don't need padding.",
    tests: [{ a: "125", e: "'2:05'" }, { a: "9", e: "'0:09'" }, { a: "900", e: "'15:00'" }, { a: "0", e: "'0:00'" }, { a: "61", e: "'1:01'" }],
    hint: "<code>m = seconds // 60</code>, <code>s = seconds % 60</code>, <code>return f\"{m}:{s:02d}\"</code>.",
    note: "Modulo is the go-to for anything that wraps around: clocks, rotating through a depth chart (<code>i % len(chart)</code>), every-third-play logic. The <code>:02d</code> inside the braces is a <b>format spec</b>; <code>:.1f</code> gives one decimal, <code>:,</code> adds thousands separators.",
    sol: "def format_clock(seconds):\n    m = seconds // 60\n    s = seconds % 60\n    return f\"{m}:{s:02d}\"" },

  { id: "p4", tier: "pass", concept: "Number formatting", title: "Completion Rate", fn: "completion_pct", sig: "completion_pct(comp, att)",
    teach: { what: "<code>f\"{x:.1f}\"</code> formats a number with exactly one decimal, as text. Formatting is for display; keep the raw number if you need more math later. Guard the zero case first.", football: "The broadcast shows 65.0%, not 0.65 or 65. Compute the ratio, scale it, format it, label it. Format last, like painting yard numbers after the field is laid.", example: "rate = 2 / 3 * 100\nprint(f\"{rate:.1f}%\")   # 66.7%" },
    prompt: "Return the completion percentage as a string with one decimal and a percent sign. <code>completion_pct(13, 20)</code> is <code>\"65.0%\"</code>. With 0 attempts return <code>\"0.0%\"</code>.",
    tests: [{ a: "13, 20", e: "'65.0%'" }, { a: "2, 3", e: "'66.7%'" }, { a: "0, 0", e: "'0.0%'" }, { a: "20, 20", e: "'100.0%'" }],
    hint: "Guard <code>att == 0</code>. Then <code>f\"{comp / att * 100:.1f}%\"</code>.",
    note: "Floating point math is slightly imprecise (<code>0.1 + 0.2</code> is <code>0.30000000000000004</code>), which is one more reason to format at the very end and never compare floats with <code>==</code> in important code.",
    sol: "def completion_pct(comp, att):\n    if att == 0:\n        return \"0.0%\"\n    return f\"{comp / att * 100:.1f}%\"" },

  { id: "p5", tier: "pass", concept: "Grouping with dicts", title: "Depth Chart", fn: "group_by_position", sig: "group_by_position(players)",
    teach: { what: "Grouping builds a dict of lists: the key is the group, the value is everything in it. For each record, create the list if the key is new, then append. <code>groups.setdefault(key, []).append(x)</code> does both steps at once.", football: "Building the depth chart from the roster: one column per position, names listed under it in order. That is literally a dictionary whose values are lists.", example: "groups = {}\nfor p in players:\n    if p[\"pos\"] not in groups:\n        groups[p[\"pos\"]] = []\n    groups[p[\"pos\"]].append(p[\"name\"])" },
    prompt: "<code>players</code> is a list of <code>{\"name\", \"pos\"}</code> dicts. Return a dict where each key is a position and each value is the list of names at that position, in order.",
    tests: [{ a: "[{\"name\": \"Hart\", \"pos\": \"QB\"}, {\"name\": \"Lee\", \"pos\": \"WR\"}, {\"name\": \"Ford\", \"pos\": \"WR\"}]", e: "{'QB': ['Hart'], 'WR': ['Lee', 'Ford']}" }, { a: "[]", e: "{}" }, { a: "[{\"name\": \"Moss\", \"pos\": \"TE\"}]", e: "{'TE': ['Moss']}" }],
    hint: "Start with <code>groups = {}</code>. For each player: if the position isn't a key yet, set it to <code>[]</code>. Then append the name.",
    note: "This is the Python version of SQL's <code>GROUP BY</code>. The standard library has <code>collections.defaultdict(list)</code> which makes the missing-key step automatic. Grouping then counting (<code>len</code> of each list) gets you a histogram, which is how you'd find tendencies in play-call data.",
    sol: "def group_by_position(players):\n    groups = {}\n    for p in players:\n        if p[\"pos\"] not in groups:\n            groups[p[\"pos\"]] = []\n        groups[p[\"pos\"]].append(p[\"name\"])\n    return groups" },

  { id: "p6", tier: "pass", concept: "Parsing text", title: "Parse the Feed", fn: "parse_play", sig: "parse_play(call)",
    teach: { what: "<code>.split(\" \")</code> breaks a string into a list at each space. <b>Unpacking</b> assigns the pieces to names in one line: <code>kind, yards, player = call.split(\" \")</code>. Everything from split is text, so convert numbers with <code>int()</code>.", football: "The play-by-play feed comes in as one line of text. Parsing is reading that line into fields the computer can use: play type, yards (as a number so you can add it), player.", example: "parts = \"PASS 12 SMITH\".split(\" \")   # ['PASS', '12', 'SMITH']\nkind, yards, player = parts\nyards = int(yards)                   # 12, a real number now" },
    prompt: "The feed sends text like <code>\"PASS 12 SMITH\"</code>. Return <code>{\"type\": \"PASS\", \"yards\": 12, \"player\": \"SMITH\"}</code>. Yards can be negative and must be an <b>int</b>, not a string.",
    tests: [{ a: "\"PASS 12 SMITH\"", e: "{'type': 'PASS', 'yards': 12, 'player': 'SMITH'}" }, { a: "\"RUN -3 JONES\"", e: "{'type': 'RUN', 'yards': -3, 'player': 'JONES'}" }, { a: "\"RUN 0 KIM\"", e: "{'type': 'RUN', 'yards': 0, 'player': 'KIM'}" }],
    hint: "Split, unpack into three names, build the dict with <code>int(yards)</code>.",
    note: "Parsing text into structured data is how logs, feeds and CSVs become usable. <code>int(\"-3\")</code> handles the minus sign fine; <code>int(\"3.5\")</code> would crash, so match the converter to the data. Security logs are exactly this: one line of text per event that you split into fields before you can ask questions about it.",
    sol: "def parse_play(call):\n    kind, yards, player = call.split(\" \")\n    return {\"type\": kind, \"yards\": int(yards), \"player\": player}" },

  { id: "p7", tier: "pass", concept: "Sorting with keys", title: "Top Tacklers", fn: "top_tacklers", sig: "top_tacklers(stats, n)",
    teach: { what: "<code>sorted(items, key=...)</code> returns a new sorted list; <code>key</code> is a function that says what to sort by. Returning a <b>tuple</b> from the key sorts by the first field, then breaks ties with the second. Negate a number to sort it descending while names stay ascending.", football: "Conference standings have tiebreakers written down. The key tuple is that rulebook: most tackles first; if tied, alphabetical. Then <code>[:n]</code> slices the top of the list.", example: "ranked = sorted(stats, key=lambda p: (-p[\"tackles\"], p[\"name\"]))\ntop = [p[\"name\"] for p in ranked[:2]]" },
    prompt: "<code>stats</code> is a list of <code>{\"name\", \"tackles\"}</code> dicts. Return the names of the top <code>n</code> tacklers, most tackles first, ties broken alphabetically.",
    tests: [{ a: "[{\"name\": \"Owens\", \"tackles\": 9}, {\"name\": \"Bell\", \"tackles\": 12}, {\"name\": \"Adams\", \"tackles\": 9}, {\"name\": \"Cruz\", \"tackles\": 4}], 2", e: "['Bell', 'Adams']" }, { a: "[{\"name\": \"Owens\", \"tackles\": 9}, {\"name\": \"Bell\", \"tackles\": 12}, {\"name\": \"Adams\", \"tackles\": 9}, {\"name\": \"Cruz\", \"tackles\": 4}], 3", e: "['Bell', 'Adams', 'Owens']" }, { a: "[], 3", e: "[]" }, { a: "[{\"name\": \"Zane\", \"tackles\": 1}], 5", e: "['Zane']" }],
    hint: "<code>key=lambda p: (-p[\"tackles\"], p[\"name\"])</code>, then slice <code>[:n]</code>, then pull names.",
    note: "<code>lambda</code> is a tiny unnamed function written inline; <code>lambda p: p[\"tackles\"]</code> is the same as defining <code>def f(p): return p[\"tackles\"]</code>. <code>sorted()</code> gives a new list; <code>stats.sort()</code> changes the original in place, which can surprise whoever else is using that list.",
    sol: "def top_tacklers(stats, n):\n    ranked = sorted(stats, key=lambda p: (-p[\"tackles\"], p[\"name\"]))\n    return [p[\"name\"] for p in ranked[:n]]" },

  /* ================= DEEP SHOT (hard) ================= */
  { id: "d1", tier: "deep", concept: "Clamping & early exit", title: "Drive Chart", fn: "drive_chart", sig: "drive_chart(start, plays)",
    teach: { what: "<b>Clamp</b> a value into a range with <code>min(100, max(0, x))</code>. <code>break</code> exits a loop immediately, which is how you stop processing once an end condition hits.", football: "You can't gain yards past the end zone or lose them behind your own. The drive chart records the ball spot after each play and stops the moment it's a touchdown; plays after that never happened.", example: "pos = min(100, max(0, pos + gain))\nif pos == 100:\n    break" },
    prompt: "Starting at yard line <code>start</code>, return a list of where the ball is after each play. Keep the ball between 0 and 100. If it reaches 100 (touchdown), stop and ignore any later plays.",
    tests: [{ a: "25, [5, 10, -3]", e: "[30, 40, 37]" }, { a: "90, [5, 8, 4]", e: "[95, 100]" }, { a: "3, [-5]", e: "[0]" }, { a: "50, []", e: "[]" }],
    hint: "Keep a <code>pos</code> variable. After each play clamp it, append it, and <code>break</code> if it's 100.",
    note: "State that changes play by play, with a rule that ends the sequence early, shows up everywhere: a bank balance that can't go negative, a retry counter that stops at the limit, a login lockout after N failures.",
    sol: "def drive_chart(start, plays):\n    chart = []\n    pos = start\n    for gain in plays:\n        pos = min(100, max(0, pos + gain))\n        chart.append(pos)\n        if pos == 100:\n            break\n    return chart" },

  { id: "d2", tier: "deep", concept: "State machines", title: "Series Result", fn: "series_result", sig: "series_result(gains)",
    teach: { what: "A <b>state machine</b> tracks a few variables (yards gained, plays used) and each input moves them until an end state is reached. Return the moment you know the answer; after the loop, decide between the remaining outcomes.", football: "A series is a state machine. 1st and 10. Each play adds yards and burns a down. Reach 10: first down, done. Burn four downs: turnover. Anything else: the series is still alive.", example: "total = 0\nfor i in range(min(len(gains), 4)):\n    total += gains[i]\n    if total >= 10:\n        return \"FIRST DOWN\"" },
    prompt: "A series starts 1st &amp; 10. Return <code>\"FIRST DOWN\"</code> if the gains reach 10 total within 4 plays. If 4 plays are used without getting there, return <code>\"TURNOVER ON DOWNS\"</code> (ignore extra plays). If fewer than 4 plays and no first down yet, return <code>\"IN PROGRESS\"</code>.",
    tests: [{ a: "[4, 3, 5]", e: "'FIRST DOWN'" }, { a: "[2, 2, 2, 2]", e: "'TURNOVER ON DOWNS'" }, { a: "[12]", e: "'FIRST DOWN'" }, { a: "[3, -2]", e: "'IN PROGRESS'" }, { a: "[1, 1, 1, 1, 20]", e: "'TURNOVER ON DOWNS'" }, { a: "[]", e: "'IN PROGRESS'" }],
    hint: "Loop over at most 4 plays (<code>gains[:4]</code>). Return early on 10+. After the loop: 4 or more plays means turnover, otherwise in progress.",
    note: "Notice how the early return inside the loop keeps the after-loop logic to a single decision. The fifth play in <code>[1, 1, 1, 1, 20]</code> is a trap: the slice makes sure it never counts.",
    sol: "def series_result(gains):\n    total = 0\n    for g in gains[:4]:\n        total += g\n        if total >= 10:\n            return \"FIRST DOWN\"\n    if len(gains) >= 4:\n        return \"TURNOVER ON DOWNS\"\n    return \"IN PROGRESS\"" },

  { id: "d3", tier: "deep", concept: "Running counters with reset", title: "Hot Streak", fn: "longest_gain_streak", sig: "longest_gain_streak(plays)",
    teach: { what: "Two counters: <code>current</code> grows while the condition holds and resets to 0 when it breaks; <code>best</code> remembers the highest <code>current</code> ever reached. Update <code>best</code> every step so the final streak counts too.", football: "An offense that's rolling: how many straight plays gained yards before a stuff or a loss? Count the streak, reset on the bad play, remember the longest one.", example: "current = best = 0\nfor y in plays:\n    current = current + 1 if y > 0 else 0\n    best = max(best, current)" },
    prompt: "Return the length of the longest streak of <b>consecutive</b> plays that gained yards (more than 0). Zero and negative plays break the streak.",
    tests: [{ a: "[3, 5, -1, 2, 2, 2, 0, 4]", e: "3" }, { a: "[]", e: "0" }, { a: "[-1, 0, -4]", e: "0" }, { a: "[1, 1, 1, 1]", e: "4" }],
    hint: "Positive play: <code>current += 1</code>. Otherwise <code>current = 0</code>. After either: <code>best = max(best, current)</code>.",
    note: "This exact pattern is a classic interview question. It also counts consecutive completions, consecutive wins, and in security, consecutive failed logins before an account gets locked.",
    sol: "def longest_gain_streak(plays):\n    current = 0\n    best = 0\n    for y in plays:\n        if y > 0:\n            current += 1\n        else:\n            current = 0\n        best = max(best, current)\n    return best" },

  { id: "d4", tier: "deep", concept: "Characters & the Caesar cipher", title: "Steal the Signs", fn: "decode_signal", sig: "decode_signal(msg, shift)",
    teach: { what: "<code>ord(\"A\")</code> gives a letter's number (65); <code>chr(65)</code> goes back. Subtract 65 to get 0 to 25, do the math, wrap with <code>% 26</code> (Python's modulo handles negatives correctly), add 65 and convert back. Build the output string piece by piece.", football: "The other sideline hides its calls by shifting every letter forward. Decoding is shifting them back, letter by letter, wrapping A around to Z. This is the Caesar cipher, one of the oldest codes there is.", example: "ch = \"F\"\nx = (ord(ch) - 65 - 3) % 26   # 2\nprint(chr(x + 65))             # C" },
    prompt: "Every letter was shifted forward <code>shift</code> places (Z wraps to A). Decode by shifting back. Messages are uppercase; leave spaces and digits alone. <code>decode_signal(\"FRYHU 2\", 3)</code> is <code>\"COVER 2\"</code>.",
    tests: [{ a: "\"FRYHU 2\", 3", e: "'COVER 2'" }, { a: "\"ABC\", 1", e: "'ZAB'" }, { a: "\"FPMXD\", 4", e: "'BLITZ'" }, { a: "\"D\", 29", e: "'A'" }, { a: "\"HELLO\", 0", e: "'HELLO'" }],
    hint: "Loop over characters. <code>if \"A\" &lt;= ch &lt;= \"Z\":</code> do the math, else keep <code>ch</code> as is. Append to an output string or list.",
    note: "Caesar is easy to break because there are only 26 possible keys; a loop tries them all in a blink. That is precisely why real encryption uses keys too large to brute force. Understanding the weak version is the first step to understanding why the strong ones are built the way they are.",
    sol: "def decode_signal(msg, shift):\n    out = \"\"\n    for ch in msg:\n        if \"A\" <= ch <= \"Z\":\n            x = (ord(ch) - 65 - shift) % 26\n            out += chr(x + 65)\n        else:\n            out += ch\n    return out" },

  { id: "d5", tier: "deep", concept: "Aggregate then rank", title: "Conference Standings", fn: "standings", sig: "standings(games)",
    teach: { what: "First pass: build a dict of wins, making sure <b>every</b> team appears (initialize to 0 before adding). Second pass: sort the keys with a tuple key. Aggregate, then rank; that's the shape of almost every report.", football: "Standings from a list of results. Every team that played gets a row even at 0 wins. Most wins first, alphabetical on ties. Ties on the field count for nobody.", example: "wins = {}\nfor g in games:\n    wins.setdefault(g[\"home\"], 0)\n    wins.setdefault(g[\"away\"], 0)\n    if g[\"home_pts\"] > g[\"away_pts\"]:\n        wins[g[\"home\"]] += 1" },
    prompt: "<code>games</code> is a list of <code>{\"home\", \"away\", \"home_pts\", \"away_pts\"}</code> dicts. Return every team name sorted by wins (most first), ties broken alphabetically. A tied game is no win for either team. Teams with 0 wins still appear.",
    tests: [{ a: "[{\"home\": \"Braves\", \"away\": \"Eagles\", \"home_pts\": 21, \"away_pts\": 14}, {\"home\": \"Eagles\", \"away\": \"Pirates\", \"home_pts\": 10, \"away_pts\": 17}, {\"home\": \"Pirates\", \"away\": \"Braves\", \"home_pts\": 24, \"away_pts\": 27}]", e: "['Braves', 'Pirates', 'Eagles']" }, { a: "[{\"home\": \"Hawks\", \"away\": \"Bears\", \"home_pts\": 7, \"away_pts\": 7}]", e: "['Bears', 'Hawks']" }, { a: "[]", e: "[]" }],
    hint: "Use <code>setdefault(team, 0)</code> for both teams before checking the score. Then <code>sorted(wins, key=lambda t: (-wins[t], t))</code>.",
    note: "Initializing every team first is what keeps winless teams from vanishing off the table. Iterating a dict (<code>for t in wins</code>) gives its keys, which is why sorting <code>wins</code> directly works.",
    sol: "def standings(games):\n    wins = {}\n    for g in games:\n        wins.setdefault(g[\"home\"], 0)\n        wins.setdefault(g[\"away\"], 0)\n        if g[\"home_pts\"] > g[\"away_pts\"]:\n            wins[g[\"home\"]] += 1\n        elif g[\"away_pts\"] > g[\"home_pts\"]:\n            wins[g[\"away\"]] += 1\n    return sorted(wins, key=lambda t: (-wins[t], t))" },

  { id: "d6", tier: "deep", concept: "Role-based access control", title: "Badge Reader", fn: "can_access", sig: "can_access(roles, door, policy)",
    teach: { what: "<code>any(...)</code> returns True if any item passes a test. Combine a dict lookup, a guard for missing keys, and a membership check. The security principle: <b>deny by default</b>, meaning anything not explicitly allowed is blocked.", football: "The facility badge reader. Each door has a list of roles allowed in. A person has roles. Swipe: if the door isn't in the policy, locked. If the door allows everyone (<code>\"*\"</code>), open. Otherwise open only if one of their roles is on the list.", example: "allowed = policy.get(door)\nif allowed is None:\n    return False\nreturn \"*\" in allowed or any(r in allowed for r in roles)" },
    prompt: "<code>policy</code> maps doors to allowed roles, like <code>{\"film-room\": [\"coach\", \"qb\"], \"lobby\": [\"*\"]}</code>. <code>\"*\"</code> means anyone. Return <code>True</code> if any of the person's <code>roles</code> is allowed through <code>door</code>. Doors missing from the policy stay locked.",
    tests: [{ a: "[\"player\", \"qb\"], \"film-room\", {\"film-room\": [\"coach\", \"qb\"], \"lobby\": [\"*\"], \"weight-room\": [\"player\", \"coach\", \"trainer\"]}", e: "True" }, { a: "[\"player\"], \"film-room\", {\"film-room\": [\"coach\", \"qb\"], \"lobby\": [\"*\"], \"weight-room\": [\"player\", \"coach\", \"trainer\"]}", e: "False" }, { a: "[], \"lobby\", {\"film-room\": [\"coach\", \"qb\"], \"lobby\": [\"*\"], \"weight-room\": [\"player\", \"coach\", \"trainer\"]}", e: "True" }, { a: "[\"coach\"], \"server-room\", {\"film-room\": [\"coach\", \"qb\"], \"lobby\": [\"*\"], \"weight-room\": [\"player\", \"coach\", \"trainer\"]}", e: "False" }, { a: "[\"trainer\"], \"weight-room\", {\"film-room\": [\"coach\", \"qb\"], \"lobby\": [\"*\"], \"weight-room\": [\"player\", \"coach\", \"trainer\"]}", e: "True" }],
    hint: "<code>allowed = policy.get(door)</code>. If it's <code>None</code>, return False. If <code>\"*\" in allowed</code>, True. Otherwise <code>any(r in allowed for r in roles)</code>.",
    note: "This is RBAC, role-based access control, the core model behind identity and access management systems. The missing-door case is the one that matters most: a system that fails open when nobody wrote a rule is a system that will eventually get walked through.",
    sol: "def can_access(roles, door, policy):\n    allowed = policy.get(door)\n    if allowed is None:\n        return False\n    if \"*\" in allowed:\n        return True\n    return any(r in allowed for r in roles)" },

  { id: "d7", tier: "deep", concept: "Recursion", title: "Flatten the Playbook", fn: "flatten_playbook", sig: "flatten_playbook(book)",
    teach: { what: "<b>Recursion</b> is a function calling itself on a smaller piece of the problem. For nested lists: for each item, if it's a list, flatten it (recursive call) and extend the output with the result; otherwise append the item. <code>isinstance(x, list)</code> checks the type.", football: "The playbook is folders inside folders: formation, then package, then concept, then the actual play. To list every play you open each folder, and if there's another folder inside you do the same thing to it, until you hit real plays and work your way back out.", example: "def flatten(book):\n    out = []\n    for item in book:\n        if isinstance(item, list):\n            out.extend(flatten(item))   # the recursive call\n        else:\n            out.append(item)\n    return out" },
    prompt: "The playbook is nested: lists inside lists, any depth. Return one flat list of every play name, in order.",
    tests: [{ a: "[[\"Dive\", [\"Sweep\", [\"Counter\"]]], \"Draw\"]", e: "['Dive', 'Sweep', 'Counter', 'Draw']" }, { a: "[]", e: "[]" }, { a: "[\"Slant\"]", e: "['Slant']" }, { a: "[[[[\"Fade\"]]]]", e: "['Fade']" }],
    hint: "The example on the board is nearly the whole answer. The key difference between <code>append</code> and <code>extend</code>: append adds one item, extend adds all items from another list.",
    note: "Every recursive function needs a case that doesn't recurse (the item that isn't a list) or it never finishes. Recursion is how you walk file systems, parse nested JSON, and traverse org charts, which are all trees.",
    sol: "def flatten_playbook(book):\n    out = []\n    for item in book:\n        if isinstance(item, list):\n            out.extend(flatten_playbook(item))\n        else:\n            out.append(item)\n    return out" },

  { id: "d8", tier: "deep", concept: "Counting & tie-breaking", title: "Tendency Report", fn: "tendency", sig: "tendency(calls)",
    teach: { what: "Count occurrences into a dict, then pick the key with the highest count. To break ties alphabetically, sort by the tuple <code>(-count, name)</code> and take the first, or track the best while looping with a careful comparison.", football: "Self-scout. What do we call most on 3rd and short? Tally every call, find the one with the biggest pile. If two are tied, report the one first alphabetically so the answer is consistent.", example: "counts = {}\nfor c in calls:\n    counts[c] = counts.get(c, 0) + 1\nbest = sorted(counts, key=lambda k: (-counts[k], k))[0]" },
    prompt: "<code>calls</code> is a list of play names. Return the most common one. Break ties alphabetically. Empty list returns <code>None</code>.",
    tests: [{ a: "[\"Dive\", \"Slant\", \"Dive\", \"Fade\", \"Slant\", \"Dive\"]", e: "'Dive'" }, { a: "[\"Slant\", \"Dive\"]", e: "'Dive'" }, { a: "[]", e: "None" }, { a: "[\"Fade\"]", e: "'Fade'" }],
    hint: "Guard the empty case. <code>counts[c] = counts.get(c, 0) + 1</code> is the counting idiom. Then sort the keys by <code>(-counts[k], k)</code>.",
    note: "<code>collections.Counter(calls).most_common(1)</code> does the counting part in one call. You'd still need the tie rule, which is a good reminder that library shortcuts handle the common case and you handle the edges.",
    sol: "def tendency(calls):\n    if not calls:\n        return None\n    counts = {}\n    for c in calls:\n        counts[c] = counts.get(c, 0) + 1\n    return sorted(counts, key=lambda k: (-counts[k], k))[0]" }
];
