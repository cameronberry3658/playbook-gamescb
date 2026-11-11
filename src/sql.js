/* ===== Playbook.sql: SQLite adapter, database, drills ===== */
const PLAYS = [
  // id, quarter, down, distance, yard_line, play_type, yards, player, result  (fictional UNCP Braves game, example data)
  [1,1,1,10,25,"run",4,"Boykin","gain"],[2,1,2,6,29,"pass",9,"Tate","first down"],[3,1,1,10,38,"run",2,"Boykin","gain"],
  [4,1,2,8,40,"pass",0,"Okafor","incomplete"],[5,1,3,8,40,"pass",23,"Lynch","first down"],[6,1,1,10,63,"run",-2,"Price","loss"],
  [7,1,2,12,61,"pass",11,"Tate","gain"],[8,1,3,1,72,"run",3,"Boykin","first down"],[9,1,1,10,75,"pass",25,"Okafor","touchdown"],
  [10,1,1,10,20,"run",1,"Price","gain"],[11,1,2,9,21,"pass",0,"Tate","incomplete"],[12,1,3,9,21,"pass",-7,"Reyes","sack"],
  [13,1,4,16,14,"punt",0,"Hale","punt"],
  [14,2,1,10,30,"run",6,"Boykin","gain"],[15,2,2,4,36,"run",5,"Boykin","first down"],[16,2,1,10,41,"pass",14,"Lynch","first down"],
  [17,2,1,10,55,"pass",0,"Okafor","interception"],[18,2,1,10,35,"run",3,"Price","gain"],[19,2,2,7,38,"pass",12,"Tate","first down"],
  [20,2,1,10,50,"pass",0,"Tate","incomplete"],[21,2,2,10,50,"run",8,"Boykin","gain"],[22,2,3,2,58,"run",1,"Price","gain"],
  [23,2,4,1,59,"run",2,"Boykin","first down"],[24,2,1,10,61,"pass",16,"Okafor","first down"],[25,2,1,10,77,"pass",0,"Lynch","incomplete"],
  [26,2,2,10,77,"run",4,"Boykin","gain"],[27,2,3,6,81,"pass",0,"Tate","incomplete"],[28,2,4,6,81,"field goal",0,"Hale","field goal"],
  [29,3,1,10,22,"run",7,"Boykin","gain"],[30,3,2,3,29,"run",-1,"Price","loss"],[31,3,3,4,28,"pass",6,"Lynch","first down"],
  [32,3,1,10,34,"pass",41,"Okafor","first down"],[33,3,1,10,75,"run",3,"Boykin","gain"],[34,3,2,7,78,"run",22,"Boykin","touchdown"],
  [35,3,1,10,18,"pass",0,"Tate","incomplete"],[36,3,2,10,18,"run",2,"Price","gain"],[37,3,3,8,20,"pass",-6,"Reyes","sack"],
  [38,3,4,14,14,"punt",0,"Hale","punt"],
  [39,4,1,10,40,"pass",9,"Tate","gain"],[40,4,2,1,49,"run",2,"Boykin","first down"],[41,4,1,10,51,"pass",0,"Okafor","incomplete"],
  [42,4,2,10,51,"run",5,"Price","gain"],[43,4,3,5,56,"pass",5,"Lynch","first down"],[44,4,1,10,61,"run",-3,"Boykin","loss"],
  [45,4,2,13,58,"pass",0,"Tate","incomplete"],[46,4,3,13,58,"pass",18,"Okafor","first down"],[47,4,1,10,76,"run",4,"Boykin","gain"],
  [48,4,2,6,80,"pass",20,"Tate","touchdown"]
];
const ACCESS_LOG = [
  // id, badge, door, hour (24h), granted (1 = let in, 0 = denied)  (example data)
  [1,"coach_neely","film-room",6,1],[2,"cam","weight-room",6,1],[3,"cam","film-room",7,0],[4,"visitor_7","lobby",8,1],
  [5,"visitor_7","server-room",8,0],[6,"visitor_7","server-room",8,0],[7,"trainer_kim","weight-room",9,1],[8,"equip_jay","equipment",9,1],
  [9,"visitor_7","server-room",9,0],[10,"intern_lee","film-room",10,0],[11,"cam","film-room",10,0],[12,"coach_neely","server-room",11,1],
  [13,"visitor_7","server-room",11,0],[14,"intern_lee","lobby",12,1],[15,"cam","weight-room",13,1],[16,"trainer_kim","film-room",14,1],
  [17,"intern_lee","server-room",15,0],[18,"equip_jay","weight-room",15,1],[19,"visitor_7","film-room",16,0],[20,"cam","lobby",17,1],
  [21,"intern_lee","server-room",18,0],[22,"coach_neely","film-room",19,1],[23,"intern_lee","server-room",20,0],[24,"trainer_kim","lobby",20,1]
];
const SCHEMA = [
  { t: "teams", cols: "abbr, name, location, conference, division, stadium, first_season, super_bowls", desc: "All 32 NFL teams. super_bowls is wins through Super Bowl LX." },
  { t: "legends", cols: "name, team, pos, number, first_year, last_year", desc: "62 all-time greats. team is the franchise abbr. last_year is NULL for active players." },
  { t: "plays", cols: "id, quarter, down, distance, yard_line, play_type, yards, player, result", desc: "48 plays from one Braves game (example data). play_type: run, pass, punt, field goal." },
  { t: "access_log", cols: "id, badge, door, hour, granted", desc: "Facility badge swipes (example data). granted is 1 or 0." }
];
const q = s => "'" + String(s).replace(/'/g, "''") + "'";
const v = x => x === null ? "NULL" : typeof x === "number" ? x : q(x);
const SEED_SQL =
  "CREATE TABLE teams (abbr TEXT, name TEXT, location TEXT, conference TEXT, division TEXT, stadium TEXT, first_season INTEGER, super_bowls INTEGER);\n" +
  "INSERT INTO teams VALUES " + TEAMS.map(t => "(" + [t.abbr, t.name, t.location, t.conference, t.division, t.stadium, t.first_season, t.super_bowls].map(v).join(",") + ")").join(",") + ";\n" +
  "CREATE TABLE legends (name TEXT, team TEXT, pos TEXT, number INTEGER, first_year INTEGER, last_year INTEGER);\n" +
  "INSERT INTO legends VALUES " + LEGENDS.map(l => "(" + [l.name, l.team, l.pos, l.number, l.first_year, l.last_year].map(v).join(",") + ")").join(",") + ";\n" +
  "CREATE TABLE plays (id INTEGER, quarter INTEGER, down INTEGER, distance INTEGER, yard_line INTEGER, play_type TEXT, yards INTEGER, player TEXT, result TEXT);\n" +
  "INSERT INTO plays VALUES " + PLAYS.map(r => "(" + r.map(v).join(",") + ")").join(",") + ";\n" +
  "CREATE TABLE access_log (id INTEGER, badge TEXT, door TEXT, hour INTEGER, granted INTEGER);\n" +
  "INSERT INTO access_log VALUES " + ACCESS_LOG.map(r => "(" + r.map(v).join(",") + ")").join(",") + ";";

let SQLJS = null;
function freshDb() { const db = new SQLJS.Database(); db.run(SEED_SQL); return db; }
function execOne(db, sql) {
  const sets = db.exec(sql);
  if (!sets.length) return { columns: [], values: [] };
  return sets[sets.length - 1];
}
const cellKey = x => x === null ? "\u0000NULL" : typeof x === "number" ? (Math.round(x * 1e6) / 1e6).toString() : String(x);
function sameTables(got, exp, ordered) {
  if (got.columns.length !== exp.columns.length) return false;
  if (got.values.length !== exp.values.length) return false;
  const rows = t => t.values.map(r => r.map(cellKey).join("\u0001"));
  let a = rows(got), b = rows(exp);
  if (!ordered) { a = a.slice().sort(); b = b.slice().sort(); }
  return a.every((r, i) => r === b[i]);
}
function tableHtml(t, cap, max) {
  max = max || 15;
  if (!t.columns.length) return '<p class="tbl-cap">' + esc(cap) + ': the statement ran but returned no rows and no columns.</p>';
  let h = '<p class="tbl-cap">' + esc(cap) + ' · ' + t.values.length + ' row' + (t.values.length === 1 ? "" : "s") + ' × ' + t.columns.length + ' column' + (t.columns.length === 1 ? "" : "s") + (t.values.length > max ? ' (showing first ' + max + ')' : '') + '</p>';
  h += '<div class="tblwrap"><table class="res"><thead><tr>' + t.columns.map(c => '<th>' + esc(c) + '</th>').join("") + '</tr></thead><tbody>';
  h += t.values.slice(0, max).map(r => '<tr>' + r.map(x => x === null ? '<td class="null">NULL</td>' : typeof x === "number" ? '<td class="num">' + esc(x) + '</td>' : '<td>' + esc(x) + '</td>').join("") + '</tr>').join("");
  return h + '</tbody></table></div>';
}

const GAME = {
  key: "sql", langName: "SQL", fileName: "play.sql", indent: "  ", indentAfter: /\($/,
  exampleLabel: "Preview query", exampleHeading: "Preview: your result, not graded, no snap used",
  editorHelp: "SQLite · Ctrl/⌘ + Enter previews · one SELECT per drill",
  consoleTip: "Preview is free. Run your query, look at the rows, then snap. Nobody grades a walkthrough.",
  starter(c) { return c.starter || "SELECT \n"; },
  examplesHtml(c) {
    if (!SQLJS) return "";
    try {
      const db = freshDb(); const exp = execOne(db, c.expect); db.close();
      const camp = c.tier === "camp" || c.tier === "run";
      return '<div class="examples"><div>Expected result: <b>' + exp.values.length + ' row' + (exp.values.length === 1 ? "" : "s") + ' × ' + exp.columns.length + ' column' + (exp.columns.length === 1 ? "" : "s") + '</b>' + (camp ? ' · columns: <b>' + esc(exp.columns.join(", ")) + '</b>' : '') + (c.ordered ? ' · <b>order matters</b>' : ' · any row order') + '</div></div>';
    } catch (e) { return ""; }
  },
  ready: new Promise((res, rej) => {
    let n = 0; const tick = () => {
      if (window.initSqlJs) initSqlJs().then(S => { SQLJS = S; renderSchema(); res(); }, rej);
      else if (++n > 200) rej(new Error("sqljs")); else setTimeout(tick, 100);
    }; tick();
  }),
  triviaExtra(t) { return ' <span style="display:block;margin-top:6px">In SQL that answer is: <code>' + esc(t.sql) + '</code></span>'; },
  run(code, c, preview) {
    return new Promise(resolve => {
      if (!SQLJS) return resolve({ error: "The SQL engine is still loading. Give it a second and try again." });
      const db = freshDb();
      let got;
      try { got = execOne(db, code); }
      catch (e) { db.close(); return resolve({ error: e.message, syntax: true }); }
      if (preview) { db.close(); return resolve({ table: got }); }
      const exp = execOne(db, c.expect); db.close();
      const results = [
        { ok: true, label: "Query runs without errors" },
        { ok: got.columns.length === exp.columns.length, label: "Returns " + exp.columns.length + " column" + (exp.columns.length === 1 ? "" : "s"), detail: got.columns.length === exp.columns.length ? "" : "got " + got.columns.length },
        { ok: got.values.length === exp.values.length, label: "Returns " + exp.values.length + " row" + (exp.values.length === 1 ? "" : "s"), detail: got.values.length === exp.values.length ? "" : "got " + got.values.length },
        { ok: sameTables(got, exp, c.ordered), label: c.ordered ? "Values match, in the right order" : "Values match (any row order)" }
      ];
      resolve({ table: got, expected: exp, results, passed: results.every(r => r.ok) });
    });
  },
  resultHtml(c, res, preview) {
    let h = "";
    if (res.error) {
      h += '<div class="err">Flag on the play: ' + esc(res.error) + '<small>SQLite error messages point at the word it got stuck on. Check spelling, commas between columns, and quotes around text values.</small></div>';
      return h;
    }
    if (res.results) {
      const passed = res.results.filter(r => r.ok).length;
      h += '<div class="eyebrow" style="margin-top:14px">' + passed + ' of ' + res.results.length + ' checks passing</div><div class="tests">' +
        res.results.map(r => '<div class="t ' + (r.ok ? "ok" : "no") + '"><span class="g">' + (r.ok ? "✓" : "✗") + '</span><div class="body">' + esc(r.label) + (r.detail ? '<div class="exp">' + esc(r.detail) + '</div>' : '') + '</div></div>').join("") + '</div>';
    }
    h += tableHtml(res.table, "Your result");
    if (res.expected && !res.passed) h += tableHtml(res.expected, "Expected result", 8);
    return h;
  }
};
function renderSchema() {
  const el = document.getElementById("schema"); if (!el) return;
  el.innerHTML = SCHEMA.map(s => '<div><b>' + s.t + '</b><span>' + esc(s.cols) + '</span><span style="font-family:var(--f-body);font-size:12px;margin-top:4px">' + esc(s.desc) + '</span></div>').join("");
}

const CH = [
  /* ================= FUNDAMENTALS (Training Camp) ================= */
  { id: "c1", tier: "camp", concept: "Tables, rows & SELECT *", title: "Three-Point Stance", starter: "SELECT * FROM \n",
    teach: {
      what: "A database is a set of <b>tables</b>. A table is rows and columns, like a spreadsheet: each <b>row</b> is one record, each <b>column</b> is one field. <code>SELECT</code> asks for data, <code>*</code> means every column, <code>FROM</code> names the table. End statements with a semicolon (optional here, required in most tools).",
      football: "The roster sheet taped to the locker room wall. One row per player, columns for name, number, position. <code>SELECT * FROM roster</code> is pulling the whole sheet off the wall and looking at all of it.",
      example: "SELECT * FROM legends;\n-- every column, every row, in whatever order the table stores them"
    },
    prompt: "Pull the whole <code>teams</code> table: every column, every row.",
    expect: "SELECT * FROM teams", ordered: false,
    hint: "<code>SELECT * FROM teams</code>. Capitalizing keywords is convention, not a rule; <code>select * from teams</code> works too.",
    note: "Table and column names in this game are lowercase. Text values in SQL go in single quotes (<code>'AFC'</code>); double quotes mean a column name, which trips up a lot of people coming from Python. <code>SELECT *</code> is great for exploring and bad in real code: name your columns so the result doesn't change when someone adds one.",
    sol: "SELECT * FROM teams;",
    walk: [["SELECT *", "Give me every column."], ["FROM teams", "...out of the table called teams."]] },

  { id: "c2", tier: "camp", concept: "Choosing columns", title: "Name and Stadium", starter: "SELECT \nFROM teams\n",
    teach: {
      what: "List the columns you want after <code>SELECT</code>, separated by commas, in the order you want them back. Fewer columns means less data moving around and a result that says exactly what you asked for.",
      football: "You don't need the whole roster sheet to make nameplates; you need last name and number. Ask for those two columns and nothing else.",
      example: "SELECT name, number FROM legends;\nSELECT number, name FROM legends;   -- same data, columns swapped"
    },
    prompt: "Return just the <code>name</code> and <code>stadium</code> of every team, in that column order.",
    expect: "SELECT name, stadium FROM teams", ordered: false,
    hint: "<code>SELECT name, stadium FROM teams</code>. The comma between columns is the part everyone forgets.",
    note: "The result of a query is itself a table: columns you named, rows that matched. Every fancier query later is still just shaping that output table.",
    sol: "SELECT name, stadium FROM teams;",
    walk: [["SELECT name, stadium", "Two columns, comma separated, in this order."], ["FROM teams", "Source table."]] },

  { id: "c3", tier: "camp", concept: "WHERE (filtering rows)", title: "AFC Only", starter: "SELECT name\nFROM teams\nWHERE \n",
    teach: {
      what: "<code>WHERE</code> keeps only the rows where a condition is true. Compare with <code>=</code>, <code>&lt;&gt;</code> (not equal), <code>&lt;</code>, <code>&gt;</code>, <code>&lt;=</code>, <code>&gt;=</code>. Text values go in single quotes and are case-sensitive here: <code>'AFC'</code> is not <code>'afc'</code>.",
      football: "<code>SELECT</code> picks columns; <code>WHERE</code> picks rows. Columns are what's on the card, rows are which players. \"Give me the names of everyone on defense\" is a SELECT on name with a WHERE on side.",
      example: "SELECT name FROM legends WHERE pos = 'DT';\nSELECT name FROM teams WHERE super_bowls > 4;"
    },
    prompt: "Return the <code>name</code> of every team in the AFC.",
    expect: "SELECT name FROM teams WHERE conference = 'AFC'", ordered: false,
    hint: "<code>WHERE conference = 'AFC'</code>. Single quotes around AFC.",
    note: "A single <code>=</code> is the comparison in SQL (there's no assignment to confuse it with). Forgetting the quotes, <code>WHERE conference = AFC</code>, makes SQLite look for a column called AFC and fail with \"no such column\", which is a useful error to recognize.",
    sol: "SELECT name FROM teams WHERE conference = 'AFC';",
    walk: [["WHERE conference = 'AFC'", "Keep a row only if its conference column holds exactly the text AFC."]] },

  { id: "c4", tier: "camp", concept: "AND / OR", title: "NFC South", starter: "SELECT name\nFROM teams\nWHERE \n",
    teach: {
      what: "Combine conditions with <code>AND</code> (both must be true) and <code>OR</code> (either). <code>AND</code> binds tighter than <code>OR</code>, so use parentheses when mixing them: <code>WHERE a = 1 AND (b = 2 OR b = 3)</code>.",
      football: "Scouting filters stack. Linemen over 300 pounds AND under 22 years old. Two conditions, both required. OR widens the net; AND narrows it.",
      example: "SELECT name FROM legends WHERE pos = 'DT' AND first_year >= 2010;\nSELECT name FROM legends WHERE pos = 'DT' OR pos = 'NT';"
    },
    prompt: "Return the <code>name</code> of every team in the NFC South. (Division values are just <code>'South'</code>, so you need two conditions.)",
    expect: "SELECT name FROM teams WHERE conference = 'NFC' AND division = 'South'", ordered: false,
    hint: "<code>WHERE conference = 'NFC' AND division = 'South'</code>",
    note: "Four rows is the right answer: every division has exactly four teams. That kind of sanity check (\"do I know roughly how many rows to expect?\") catches more SQL mistakes than any tool.",
    sol: "SELECT name FROM teams WHERE conference = 'NFC' AND division = 'South';" },

  { id: "c5", tier: "camp", concept: "ORDER BY", title: "Ring Count", starter: "SELECT name, super_bowls\nFROM teams\nORDER BY \n",
    teach: {
      what: "<code>ORDER BY column</code> sorts the result. <code>ASC</code> (default) is smallest first, <code>DESC</code> is biggest first. List more than one column to break ties: <code>ORDER BY super_bowls DESC, name ASC</code>. Without ORDER BY, row order is whatever the database feels like.",
      football: "Standings are sorted, with tiebreakers. Most wins first, then head to head, then division record. ORDER BY is that list of tiebreakers, read left to right.",
      example: "SELECT name, first_season FROM teams ORDER BY first_season;          -- oldest first\nSELECT name, number FROM legends ORDER BY number DESC, name ASC;"
    },
    prompt: "Return <code>name</code> and <code>super_bowls</code> for every team, most Super Bowl wins first. Break ties alphabetically by name.",
    expect: "SELECT name, super_bowls FROM teams ORDER BY super_bowls DESC, name ASC", ordered: true,
    hint: "<code>ORDER BY super_bowls DESC, name ASC</code>. Two sort keys, comma separated.",
    note: "This is the first drill where order matters for the grade. If you only sort by super_bowls, the teams tied at 2 (and at 0) come back in storage order, which the checker treats as wrong. Real reports need the full tiebreak too, or the output shuffles between runs.",
    sol: "SELECT name, super_bowls\nFROM teams\nORDER BY super_bowls DESC, name ASC;",
    walk: [["ORDER BY super_bowls DESC", "Primary sort: most titles at the top."], [", name ASC", "Tiebreaker: alphabetical among equal counts."]] },

  { id: "c6", tier: "camp", concept: "LIMIT", title: "Original Five", starter: "SELECT name, first_season\nFROM teams\nORDER BY \nLIMIT \n",
    teach: {
      what: "<code>LIMIT n</code> keeps only the first n rows of the result. It runs after ORDER BY, so \"top 5\" is always sort first, then limit. Without a sort, LIMIT gives you 5 arbitrary rows.",
      football: "Top-5 lists. You can't name the five oldest franchises until you've lined them all up by founding year. Sort, then cut the list.",
      example: "SELECT player, yards FROM plays ORDER BY yards DESC LIMIT 3;   -- three longest plays"
    },
    prompt: "Return <code>name</code> and <code>first_season</code> of the five oldest franchises, oldest first. Break ties alphabetically.",
    expect: "SELECT name, first_season FROM teams ORDER BY first_season ASC, name ASC LIMIT 5", ordered: true,
    hint: "<code>ORDER BY first_season ASC, name ASC LIMIT 5</code>",
    note: "The Cardinals and Bears both list 1920, which is why the name tiebreaker matters even here. SQL clause order is fixed: SELECT, FROM, WHERE, GROUP BY, HAVING, ORDER BY, LIMIT. Memorize that line; it's the skeleton of every query you'll ever write.",
    sol: "SELECT name, first_season\nFROM teams\nORDER BY first_season ASC, name ASC\nLIMIT 5;" },

  { id: "c7", tier: "camp", concept: "COUNT", title: "Count the Tackles", starter: "SELECT COUNT(*)\nFROM legends\nWHERE \n",
    teach: {
      what: "<code>COUNT(*)</code> returns how many rows matched. It's an <b>aggregate function</b>: it collapses many rows into one number. Other aggregates: <code>SUM</code>, <code>AVG</code>, <code>MIN</code>, <code>MAX</code>. With a WHERE, you count only the matching rows.",
      football: "How many defensive tackles are on the legends list? Don't read the names; count the rows that pass the filter. One number back.",
      example: "SELECT COUNT(*) FROM teams;                          -- 32\nSELECT COUNT(*) FROM teams WHERE super_bowls = 0;    -- the ringless"
    },
    prompt: "How many legends played <code>DT</code>? Return a single number.",
    expect: "SELECT COUNT(*) FROM legends WHERE pos = 'DT'", ordered: false,
    hint: "<code>SELECT COUNT(*) FROM legends WHERE pos = 'DT'</code>",
    note: "The answer comes back as one row with one column. You can name that column with <code>AS</code>: <code>SELECT COUNT(*) AS tackles FROM ...</code>. Aliases don't affect grading here but make results readable, and they're required when you reference the value later.",
    sol: "SELECT COUNT(*) FROM legends WHERE pos = 'DT';" },

  { id: "c8", tier: "camp", concept: "SUM & AVG", title: "Ground Game", starter: "SELECT SUM(yards)\nFROM plays\nWHERE \n",
    teach: {
      what: "<code>SUM(column)</code> adds a column up; <code>AVG(column)</code> averages it. Both ignore NULLs. Pair them with WHERE to total only the rows you care about. <code>ROUND(AVG(x), 1)</code> trims the decimals.",
      football: "Total rushing yards is SUM(yards) over the run plays. Yards per carry is AVG(yards) over the same rows. The stat crew's whole job is aggregates with a WHERE.",
      example: "SELECT AVG(yards) FROM plays WHERE play_type = 'pass';\nSELECT SUM(super_bowls) FROM teams WHERE conference = 'AFC';"
    },
    prompt: "Return the total rushing yards in the game: the <code>SUM</code> of <code>yards</code> for plays where <code>play_type</code> is <code>'run'</code>.",
    expect: "SELECT SUM(yards) FROM plays WHERE play_type = 'run'", ordered: false,
    hint: "<code>SELECT SUM(yards) FROM plays WHERE play_type = 'run'</code>",
    note: "Negative yards (losses) count against the sum automatically, which is exactly what the stat sheet does. Note the value is <code>'run'</code> in lowercase; text matching is exact.",
    sol: "SELECT SUM(yards) FROM plays WHERE play_type = 'run';" },

  { id: "c9", tier: "camp", concept: "GROUP BY", title: "Play Call Breakdown", starter: "SELECT play_type, COUNT(*)\nFROM plays\nGROUP BY \n",
    teach: {
      what: "<code>GROUP BY column</code> splits the rows into buckets, one per distinct value, and runs the aggregate once per bucket. Every column in SELECT must be either the grouping column or wrapped in an aggregate.",
      football: "The self-scout report: how many runs, how many passes, how many punts? Pile the plays by type, count each pile. GROUP BY makes the piles; COUNT counts them.",
      example: "SELECT pos, COUNT(*) FROM legends GROUP BY pos;\nSELECT player, SUM(yards) FROM plays GROUP BY player;"
    },
    prompt: "Return each <code>play_type</code> and how many plays of that type there were.",
    expect: "SELECT play_type, COUNT(*) FROM plays GROUP BY play_type", ordered: false,
    hint: "<code>SELECT play_type, COUNT(*) FROM plays GROUP BY play_type</code>",
    note: "GROUP BY is the single most useful idea in SQL after WHERE. Any question shaped like \"X per Y\" (yards per player, titles per division, failed logins per user) is GROUP BY Y with an aggregate on X.",
    sol: "SELECT play_type, COUNT(*)\nFROM plays\nGROUP BY play_type;",
    walk: [["GROUP BY play_type", "One output row per distinct play_type."], ["COUNT(*)", "Counted separately inside each group."]] },

  { id: "c10", tier: "camp", concept: "DISTINCT", title: "Positions Represented", starter: "SELECT DISTINCT \nFROM legends\n",
    teach: {
      what: "<code>SELECT DISTINCT column</code> returns each value once, with duplicates removed. It's the quick way to ask \"what values exist in this column?\"",
      football: "Which positions are on the legends list? You don't want 62 rows with QB repeated 17 times, you want each position once.",
      example: "SELECT DISTINCT conference FROM teams;   -- AFC, NFC\nSELECT DISTINCT result FROM plays;"
    },
    prompt: "Return each distinct <code>pos</code> that appears in <code>legends</code>, once each.",
    expect: "SELECT DISTINCT pos FROM legends", ordered: false,
    hint: "<code>SELECT DISTINCT pos FROM legends</code>",
    note: "<code>GROUP BY pos</code> with no aggregate gives the same list, and sometimes you'll see it written that way. DISTINCT says what you mean. On a new database, DISTINCT on a few columns is how you learn what the data actually contains before you trust it.",
    sol: "SELECT DISTINCT pos FROM legends;" },

  { id: "c11", tier: "camp", concept: "NULL", title: "Still Playing", starter: "SELECT name\nFROM legends\nWHERE \n",
    teach: {
      what: "<b>NULL</b> means \"no value\" (unknown, not applicable, not yet). It is not 0 and not an empty string, and <code>= NULL</code> never matches anything. Test for it with <code>IS NULL</code> or <code>IS NOT NULL</code>. Aggregates skip NULLs; math with a NULL gives NULL.",
      football: "An active player has no final season yet. You can't write 0 (that would be a career of zero years) and you can't write 2026 (not true yet). The honest value is \"not yet\": NULL.",
      example: "SELECT name FROM legends WHERE last_year IS NOT NULL;   -- retired\nSELECT name FROM legends WHERE last_year = NULL;        -- WRONG: matches nothing"
    },
    prompt: "Return the <code>name</code> of every legend who is still active, meaning <code>last_year</code> is NULL.",
    expect: "SELECT name FROM legends WHERE last_year IS NULL", ordered: false,
    hint: "<code>WHERE last_year IS NULL</code>. Not <code>= NULL</code>.",
    note: "NULL handling is where a lot of real-world bugs live: a report that silently drops rows, an average that's higher than it should be because blanks were skipped. When a column can be NULL, decide on purpose what you want to happen to those rows.",
    sol: "SELECT name FROM legends WHERE last_year IS NULL;" },

  { id: "c12", tier: "camp", concept: "Expressions & aliases", title: "Years of Service", starter: "SELECT name, \nFROM legends\nWHERE team = 'TEN'\n",
    teach: {
      what: "You can do math in the SELECT list: <code>last_year - first_year + 1</code>. Name the result with <code>AS seasons</code> so the column has a readable header. Aliases can be used in ORDER BY.",
      football: "The Titans' legends and how many seasons each one gave the franchise. The data stores first and last year; the number you want is computed on the way out.",
      example: "SELECT name, 100 - yard_line AS to_goal FROM plays;\nSELECT name, number * 2 AS doubled FROM legends;"
    },
    prompt: "For every legend whose <code>team</code> is <code>'TEN'</code>, return <code>name</code> and the number of seasons (<code>last_year - first_year + 1</code>) with the alias <code>seasons</code>.",
    expect: "SELECT name, last_year - first_year + 1 AS seasons FROM legends WHERE team = 'TEN'", ordered: false,
    hint: "<code>SELECT name, last_year - first_year + 1 AS seasons FROM legends WHERE team = 'TEN'</code>",
    note: "The +1 is the fencepost: a player whose first and last years are both 1990 played one season, not zero. Camp is over. From here on, every drill is these clauses in new combinations.",
    sol: "SELECT name, last_year - first_year + 1 AS seasons\nFROM legends\nWHERE team = 'TEN';" },

  /* ================= RUN (easy) ================= */
  { id: "r1", tier: "run", concept: "LIKE (pattern matching)", title: "Starts with J",
    teach: { what: "<code>LIKE</code> matches text patterns. <code>%</code> stands for any run of characters, <code>_</code> for exactly one. <code>'J%'</code> is \"starts with J\"; <code>'%Field%'</code> is \"contains Field\".", football: "Scanning the roster for every name starting with a letter, the way the PA announcer's cheat sheet is organized.", example: "SELECT name FROM teams WHERE stadium LIKE '%Field%';\nSELECT name FROM legends WHERE name LIKE '% Smith';" },
    prompt: "Return the <code>name</code> of every legend whose name starts with <code>J</code>.",
    expect: "SELECT name FROM legends WHERE name LIKE 'J%'", ordered: false,
    hint: "<code>WHERE name LIKE 'J%'</code>",
    note: "In SQLite, LIKE ignores case for plain letters, so <code>'j%'</code> would also work here; other databases differ. Leading wildcards (<code>'%x'</code>) are slow on big tables because the database can't use an index; worth knowing before you put one in a production report.",
    sol: "SELECT name FROM legends WHERE name LIKE 'J%';" },

  { id: "r2", tier: "run", concept: "BETWEEN", title: "Nineties Debuts",
    teach: { what: "<code>BETWEEN a AND b</code> is shorthand for <code>&gt;= a AND &lt;= b</code>. Both ends are included.", football: "Players who broke in during the nineties: first year from 1990 through 1999, inclusive on both ends.", example: "SELECT id FROM plays WHERE yards BETWEEN 10 AND 19;" },
    prompt: "Return <code>name</code> and <code>first_year</code> for legends whose first year was in the 1990s (1990 through 1999).",
    expect: "SELECT name, first_year FROM legends WHERE first_year BETWEEN 1990 AND 1999", ordered: false,
    hint: "<code>WHERE first_year BETWEEN 1990 AND 1999</code>",
    note: "Inclusive bounds trip people up with dates and decimals: BETWEEN '2026-01-01' AND '2026-01-31' misses anything stamped on the 31st after midnight. For whole-number years it's exactly right.",
    sol: "SELECT name, first_year\nFROM legends\nWHERE first_year BETWEEN 1990 AND 1999;" },

  { id: "r3", tier: "run", concept: "IN (lists)", title: "Three-Team Spin",
    teach: { what: "<code>IN (a, b, c)</code> matches any value in the list. It replaces a chain of ORs and reads like the question you're asking.", football: "The trivia wheel landed on three teams; pull their divisions in one query instead of three.", example: "SELECT name FROM legends WHERE pos IN ('DT', 'NT', 'DE');   -- the whole D-line" },
    prompt: "Return <code>name</code>, <code>conference</code> and <code>division</code> for the teams whose <code>abbr</code> is <code>'TEN'</code>, <code>'KC'</code> or <code>'SEA'</code>.",
    expect: "SELECT name, conference, division FROM teams WHERE abbr IN ('TEN', 'KC', 'SEA')", ordered: false,
    hint: "<code>WHERE abbr IN ('TEN', 'KC', 'SEA')</code>",
    note: "IN also accepts a subquery instead of a literal list, which you'll use in the Pass tier. <code>NOT IN</code> excludes; be careful with it if the list could contain NULL, because then it matches nothing at all.",
    sol: "SELECT name, conference, division\nFROM teams\nWHERE abbr IN ('TEN', 'KC', 'SEA');" },

  { id: "r4", tier: "run", concept: "MAX & MIN", title: "Longest and Worst",
    teach: { what: "<code>MAX(column)</code> and <code>MIN(column)</code> are aggregates for the biggest and smallest value. You can return both in one query; they collapse to a single row.", football: "Longest play of the day and the worst loss, side by side on the postgame sheet.", example: "SELECT MAX(super_bowls), MIN(first_season) FROM teams;" },
    prompt: "Return the longest play and the biggest loss in one row: <code>MAX(yards)</code> and <code>MIN(yards)</code> from <code>plays</code>.",
    expect: "SELECT MAX(yards), MIN(yards) FROM plays", ordered: false,
    hint: "<code>SELECT MAX(yards), MIN(yards) FROM plays</code>",
    note: "MAX tells you the value, not who did it. Putting a non-aggregated column next to MAX (<code>SELECT player, MAX(yards)</code>) happens to work in SQLite but is undefined in most databases. The honest way to get the player is ORDER BY yards DESC LIMIT 1, next drill.",
    sol: "SELECT MAX(yards), MIN(yards) FROM plays;" },

  { id: "r5", tier: "run", concept: "Top-N with ties", title: "Three Longest Passes",
    teach: { what: "Filter, sort with a tiebreaker, limit. The tiebreaker (here <code>id</code>) makes the result stable so two identical plays always come back in the same order.", football: "The three longest completions of the game. If two went for the same yardage, the earlier play lists first.", example: "SELECT player, yards FROM plays WHERE play_type = 'run' ORDER BY yards DESC, id ASC LIMIT 3;" },
    prompt: "Return <code>id</code>, <code>player</code> and <code>yards</code> of the three longest pass plays. Longest first; ties broken by lower <code>id</code> first.",
    expect: "SELECT id, player, yards FROM plays WHERE play_type = 'pass' ORDER BY yards DESC, id ASC LIMIT 3", ordered: true,
    hint: "<code>WHERE play_type = 'pass' ORDER BY yards DESC, id ASC LIMIT 3</code>",
    note: "Every top-N query needs a full tiebreak or your dashboard will flicker between runs for no reason anyone can explain. A unique column like <code>id</code> as the last sort key fixes it permanently.",
    sol: "SELECT id, player, yards\nFROM plays\nWHERE play_type = 'pass'\nORDER BY yards DESC, id ASC\nLIMIT 3;" },

  { id: "r6", tier: "run", concept: "GROUP BY + ORDER BY alias", title: "Legends per Franchise",
    teach: { what: "Group, count, then sort by the count. Give the count an alias and sort by the alias. Add a second sort key so ties are deterministic.", football: "Which franchises put the most players on the legends list? Pile by team, count each pile, biggest pile first, alphabetical among ties.", example: "SELECT pos, COUNT(*) AS n FROM legends GROUP BY pos ORDER BY n DESC, pos ASC;" },
    prompt: "Return <code>team</code> and the number of legends on it (alias <code>legends</code>), most first, ties alphabetical by team.",
    expect: "SELECT team, COUNT(*) AS legends FROM legends GROUP BY team ORDER BY legends DESC, team ASC", ordered: true,
    hint: "<code>GROUP BY team ORDER BY legends DESC, team ASC</code>",
    note: "Sorting by an alias works because ORDER BY runs after SELECT. WHERE runs before SELECT, which is why you can't use an alias in WHERE. The clause order from camp isn't just syntax; it's roughly the order the database does the work.",
    sol: "SELECT team, COUNT(*) AS legends\nFROM legends\nGROUP BY team\nORDER BY legends DESC, team ASC;" },

  /* ================= SHORT PASS (medium) ================= */
  { id: "p1", tier: "pass", concept: "AVG per group, rounded", title: "Yards per Play Type",
    teach: { what: "GROUP BY with AVG, wrapped in ROUND. Filter to the rows that make sense to average (runs and passes, not punts) with WHERE before grouping.", football: "Yards per rush vs. yards per pass attempt, the two numbers every offensive coordinator looks at first.", example: "SELECT player, ROUND(AVG(yards), 1) AS ypp FROM plays GROUP BY player;" },
    prompt: "For <code>'run'</code> and <code>'pass'</code> plays only, return <code>play_type</code> and the average yards rounded to 1 decimal with the alias <code>avg_yards</code>.",
    expect: "SELECT play_type, ROUND(AVG(yards), 1) AS avg_yards FROM plays WHERE play_type IN ('run', 'pass') GROUP BY play_type", ordered: false,
    hint: "<code>WHERE play_type IN ('run', 'pass') GROUP BY play_type</code>, with <code>ROUND(AVG(yards), 1)</code> in the select.",
    note: "WHERE filters rows going into the groups. HAVING (next drill) filters the groups coming out. Mixing them up is the most common GROUP BY mistake.",
    sol: "SELECT play_type, ROUND(AVG(yards), 1) AS avg_yards\nFROM plays\nWHERE play_type IN ('run', 'pass')\nGROUP BY play_type;" },

  { id: "p2", tier: "pass", concept: "HAVING", title: "Deep Position Groups",
    teach: { what: "<code>HAVING</code> filters groups after aggregation, using the aggregate itself: <code>HAVING COUNT(*) &gt;= 5</code>. WHERE can't do that because the count doesn't exist yet when WHERE runs.", football: "Which position groups have at least five legends? You have to count each pile before you can ask if the pile is big enough.", example: "SELECT team, COUNT(*) FROM legends GROUP BY team HAVING COUNT(*) >= 3;" },
    prompt: "Return <code>pos</code> and the count of legends at that position (alias <code>n</code>), but only positions with 5 or more.",
    expect: "SELECT pos, COUNT(*) AS n FROM legends GROUP BY pos HAVING COUNT(*) >= 5", ordered: false,
    hint: "<code>GROUP BY pos HAVING COUNT(*) &gt;= 5</code>",
    note: "Rule of thumb: conditions on raw columns go in WHERE, conditions on aggregates go in HAVING. Doing both in one query is normal: WHERE narrows the input, HAVING narrows the output.",
    sol: "SELECT pos, COUNT(*) AS n\nFROM legends\nGROUP BY pos\nHAVING COUNT(*) >= 5;" },

  { id: "p3", tier: "pass", concept: "JOIN", title: "Where the Big Men Played",
    teach: { what: "<code>JOIN</code> combines rows from two tables where a condition links them: <code>legends.team = teams.abbr</code>. Give tables short aliases (<code>legends l</code>) and prefix columns with them so the database knows which table's <code>name</code> you mean.", football: "The legends table knows a player's team as an abbreviation. The teams table knows that abbreviation's stadium. A JOIN lines those up so you can ask a question that spans both: where did each legendary DT play his home games?", example: "SELECT l.name, t.location\nFROM legends l\nJOIN teams t ON l.team = t.abbr\nWHERE l.pos = 'QB';" },
    prompt: "Return each defensive tackle's <code>name</code> and the <code>stadium</code> of his franchise. Join <code>legends</code> to <code>teams</code> on <code>legends.team = teams.abbr</code>, and keep only <code>pos = 'DT'</code>.",
    expect: "SELECT l.name, t.stadium FROM legends l JOIN teams t ON l.team = t.abbr WHERE l.pos = 'DT'", ordered: false,
    hint: "<code>FROM legends l JOIN teams t ON l.team = t.abbr WHERE l.pos = 'DT'</code>, select <code>l.name, t.stadium</code>.",
    note: "This is why databases split data into tables instead of one giant sheet: the stadium is stored once per team, not once per player, so a stadium rename is one row's change. Joins put it back together on demand. The column you join on (abbr) is called a key.",
    sol: "SELECT l.name, t.stadium\nFROM legends l\nJOIN teams t ON l.team = t.abbr\nWHERE l.pos = 'DT';" },

  { id: "p4", tier: "pass", concept: "CASE (if/else in SQL)", title: "Tag the Plays",
    teach: { what: "<code>CASE WHEN cond THEN value WHEN cond2 THEN value2 ELSE default END</code> is SQL's if/elif/else, evaluated per row. Give it an alias. Conditions are checked top to bottom; the first match wins.", football: "The film-room tag on every snap: explosive, loss, or normal. Same play data, a label computed from the yardage.", example: "SELECT name,\n  CASE WHEN super_bowls >= 4 THEN 'dynasty' WHEN super_bowls = 0 THEN 'ringless' ELSE 'champion' END AS tier\nFROM teams;" },
    prompt: "For run and pass plays, return <code>id</code>, <code>yards</code>, and a <code>tag</code>: <code>'explosive'</code> when yards &gt;= 20, <code>'loss'</code> when yards &lt; 0, otherwise <code>'normal'</code>.",
    expect: "SELECT id, yards, CASE WHEN yards >= 20 THEN 'explosive' WHEN yards < 0 THEN 'loss' ELSE 'normal' END AS tag FROM plays WHERE play_type IN ('run', 'pass')", ordered: false,
    hint: "<code>CASE WHEN yards &gt;= 20 THEN 'explosive' WHEN yards &lt; 0 THEN 'loss' ELSE 'normal' END AS tag</code>",
    note: "CASE is also how you do conditional counting (next drill) and how you bucket continuous values into categories for a report. Don't forget the <code>END</code>; its absence is the most common CASE error.",
    sol: "SELECT id, yards,\n  CASE\n    WHEN yards >= 20 THEN 'explosive'\n    WHEN yards < 0 THEN 'loss'\n    ELSE 'normal'\n  END AS tag\nFROM plays\nWHERE play_type IN ('run', 'pass');" },

  { id: "p5", tier: "pass", concept: "Conditional aggregates", title: "Third-Down Efficiency",
    teach: { what: "<code>SUM(CASE WHEN cond THEN 1 ELSE 0 END)</code> counts the rows that meet a condition while <code>COUNT(*)</code> counts them all, in the same query. That's how you get \"made / attempted\" on one row.", football: "Third-down conversion rate: of all third downs, how many moved the chains (a first down or a touchdown)? Two numbers, one row.", example: "SELECT SUM(CASE WHEN granted = 1 THEN 1 ELSE 0 END) AS allowed, COUNT(*) AS swipes FROM access_log;" },
    prompt: "For plays where <code>down = 3</code>, return <code>converted</code> (count of plays whose <code>result</code> is <code>'first down'</code> or <code>'touchdown'</code>) and <code>attempts</code> (all third downs), in that column order.",
    expect: "SELECT SUM(CASE WHEN result IN ('first down', 'touchdown') THEN 1 ELSE 0 END) AS converted, COUNT(*) AS attempts FROM plays WHERE down = 3", ordered: false,
    hint: "<code>SUM(CASE WHEN result IN ('first down', 'touchdown') THEN 1 ELSE 0 END) AS converted, COUNT(*) AS attempts ... WHERE down = 3</code>",
    note: "Dividing them, <code>converted * 1.0 / attempts</code>, gives the rate; the <code>* 1.0</code> forces decimal division, because integer divided by integer in SQLite drops the fraction. Same divide-by-zero concern as Python if there were no third downs.",
    sol: "SELECT\n  SUM(CASE WHEN result IN ('first down', 'touchdown') THEN 1 ELSE 0 END) AS converted,\n  COUNT(*) AS attempts\nFROM plays\nWHERE down = 3;" },

  { id: "p6", tier: "pass", concept: "Subqueries", title: "Ringless Legends",
    teach: { what: "A <b>subquery</b> is a query inside parentheses whose result feeds another query. <code>WHERE team IN (SELECT abbr FROM teams WHERE ...)</code> uses one query to build the list for IN.", football: "Great players who never got a ring with their franchise. Step one: which teams have zero titles? Step two: which legends played for those teams? The subquery is step one, nested inside step two.", example: "SELECT name FROM legends WHERE number = (SELECT MAX(number) FROM legends);" },
    prompt: "Return the <code>name</code> of every legend whose <code>team</code> has zero Super Bowl wins. Use a subquery on <code>teams</code>.",
    expect: "SELECT name FROM legends WHERE team IN (SELECT abbr FROM teams WHERE super_bowls = 0)", ordered: false,
    hint: "<code>WHERE team IN (SELECT abbr FROM teams WHERE super_bowls = 0)</code>",
    note: "The same question can be written as a JOIN; both are correct, and the database usually runs them the same way. Subqueries read well when the inner question stands on its own; joins read well when you need columns from both tables.",
    sol: "SELECT name\nFROM legends\nWHERE team IN (SELECT abbr FROM teams WHERE super_bowls = 0);" },

  { id: "p7", tier: "pass", concept: "Grouping by two columns", title: "Titles by Division",
    teach: { what: "GROUP BY can take several columns; each distinct combination becomes a group. Sort the result so the ranking is readable and stable.", football: "Which division has the most rings in its history? Pile the teams by conference and division, add up the titles in each pile.", example: "SELECT play_type, result, COUNT(*) FROM plays GROUP BY play_type, result;" },
    prompt: "Return <code>conference</code>, <code>division</code> and the total Super Bowl wins of its teams (alias <code>titles</code>), most first, then by conference and division alphabetically.",
    expect: "SELECT conference, division, SUM(super_bowls) AS titles FROM teams GROUP BY conference, division ORDER BY titles DESC, conference ASC, division ASC", ordered: true,
    hint: "<code>GROUP BY conference, division ORDER BY titles DESC, conference, division</code>",
    note: "Eight rows, one per division. If you grouped by division alone you'd get four rows that mash AFC East and NFC East together, which looks plausible and is wrong. Group by every column that defines the thing you're counting.",
    sol: "SELECT conference, division, SUM(super_bowls) AS titles\nFROM teams\nGROUP BY conference, division\nORDER BY titles DESC, conference ASC, division ASC;" },

  /* ================= DEEP SHOT (hard) ================= */
  { id: "d1", tier: "deep", concept: "Aggregate, rank, take one", title: "Rushing Leader",
    teach: { what: "Group by player, sum the yards, sort descending, LIMIT 1. Four clauses working in sequence.", football: "Who led the team in rushing? Total every back's carries, line them up, take the top.", example: "SELECT player, COUNT(*) AS targets FROM plays WHERE play_type = 'pass' GROUP BY player ORDER BY targets DESC LIMIT 1;" },
    prompt: "Return the <code>player</code> with the most rushing yards and his total (alias <code>rush_yards</code>). Runs only.",
    expect: "SELECT player, SUM(yards) AS rush_yards FROM plays WHERE play_type = 'run' GROUP BY player ORDER BY rush_yards DESC LIMIT 1", ordered: true,
    hint: "<code>WHERE play_type = 'run' GROUP BY player ORDER BY rush_yards DESC LIMIT 1</code>",
    note: "Read it in execution order and it's a story: FROM plays, WHERE runs only, GROUP BY player, SELECT the sums, ORDER BY the sum, LIMIT to the leader.",
    sol: "SELECT player, SUM(yards) AS rush_yards\nFROM plays\nWHERE play_type = 'run'\nGROUP BY player\nORDER BY rush_yards DESC\nLIMIT 1;" },

  { id: "d2", tier: "deep", concept: "Multi-aggregate report", title: "Quarter by Quarter",
    teach: { what: "One GROUP BY can feed several aggregates at once, including a conditional one. This is the shape of nearly every summary report.", football: "The box score by quarter: plays run, total yards, touchdowns. One row per quarter, in order.", example: "SELECT badge, COUNT(*) AS swipes, SUM(CASE WHEN granted = 0 THEN 1 ELSE 0 END) AS denied FROM access_log GROUP BY badge;" },
    prompt: "Return, per <code>quarter</code>: <code>plays</code> (count), <code>yards</code> (sum), and <code>tds</code> (count of plays whose result is <code>'touchdown'</code>). Columns in that order, sorted by quarter.",
    expect: "SELECT quarter, COUNT(*) AS plays, SUM(yards) AS yards, SUM(CASE WHEN result = 'touchdown' THEN 1 ELSE 0 END) AS tds FROM plays GROUP BY quarter ORDER BY quarter", ordered: true,
    hint: "Three aggregates after <code>quarter</code>, then <code>GROUP BY quarter ORDER BY quarter</code>.",
    note: "Reusing a column name as an alias (<code>SUM(yards) AS yards</code>) is legal and common, but in bigger queries it can confuse you about which one ORDER BY is using. When in doubt, pick a distinct alias.",
    sol: "SELECT quarter,\n  COUNT(*) AS plays,\n  SUM(yards) AS yards,\n  SUM(CASE WHEN result = 'touchdown' THEN 1 ELSE 0 END) AS tds\nFROM plays\nGROUP BY quarter\nORDER BY quarter;" },

  { id: "d3", tier: "deep", concept: "Scalar subquery", title: "Above the Line",
    teach: { what: "A subquery that returns exactly one value can be used anywhere a value can: <code>WHERE yards &gt; (SELECT AVG(yards) FROM plays)</code>. The inner query runs first, its number is plugged in, and the outer query filters with it.", football: "Which plays beat the game's average? You can't know the cutoff until you've computed the average over everything, so the average is its own little query.", example: "SELECT name FROM teams WHERE first_season < (SELECT AVG(first_season) FROM teams);" },
    prompt: "Return <code>id</code>, <code>player</code> and <code>yards</code> for every play that gained more than the average yards of all plays, longest first, ties by lower <code>id</code> first.",
    expect: "SELECT id, player, yards FROM plays WHERE yards > (SELECT AVG(yards) FROM plays) ORDER BY yards DESC, id ASC", ordered: true,
    hint: "<code>WHERE yards &gt; (SELECT AVG(yards) FROM plays) ORDER BY yards DESC, id ASC</code>",
    note: "The average includes punts and incompletions at 0 yards, which drags it down; whether that's the right denominator is a judgment call, and a good analyst says which one they used. Several plays share a yardage, so the id tiebreak is doing real work here.",
    sol: "SELECT id, player, yards\nFROM plays\nWHERE yards > (SELECT AVG(yards) FROM plays)\nORDER BY yards DESC, id ASC;" },

  { id: "d4", tier: "deep", concept: "Self-join", title: "Number Twins",
    teach: { what: "A table can be joined to itself with two aliases: <code>legends a JOIN legends b</code>. The ON clause pairs rows; <code>a.name &lt; b.name</code> keeps each pair once (otherwise you get both orders plus every player paired with himself).", football: "Which legends wore the same number for different franchises? Lay the list next to a copy of itself and match on number.", example: "SELECT a.name, b.name\nFROM legends a\nJOIN legends b ON a.team = b.team AND a.pos = b.pos AND a.name < b.name;   -- same team, same position" },
    prompt: "Return pairs of legends who wore the same <code>number</code> for different teams: columns <code>a.name</code>, <code>b.name</code>, <code>a.number</code>. Each pair once (<code>a.name &lt; b.name</code>). Sort by number, then <code>a.name</code>.",
    expect: "SELECT a.name, b.name, a.number FROM legends a JOIN legends b ON a.number = b.number AND a.team <> b.team AND a.name < b.name ORDER BY a.number, a.name", ordered: true,
    hint: "<code>JOIN legends b ON a.number = b.number AND a.team &lt;&gt; b.team AND a.name &lt; b.name</code>",
    note: "Self-joins answer \"which rows relate to other rows in the same table\": employees and their managers, flights and their connections, users who share a password hash (a real security query). The <code>a.name &lt; b.name</code> trick to de-duplicate pairs is worth memorizing.",
    sol: "SELECT a.name, b.name, a.number\nFROM legends a\nJOIN legends b\n  ON a.number = b.number\n AND a.team <> b.team\n AND a.name < b.name\nORDER BY a.number, a.name;" },

  { id: "d5", tier: "deep", concept: "Security audit query", title: "Badge Audit",
    teach: { what: "WHERE narrows to denied swipes, GROUP BY badge, HAVING keeps only repeat offenders. This exact shape, \"who failed N or more times\", is the first query every security analyst learns.", football: "Facility security pulls the badge log: who keeps getting denied at doors they shouldn't be near? Three or more denials is worth a conversation.", example: "SELECT door, COUNT(*) AS denied FROM access_log WHERE granted = 0 GROUP BY door;" },
    prompt: "Return each <code>badge</code> with 3 or more denied swipes (<code>granted = 0</code>) and the count (alias <code>denied</code>), most denials first.",
    expect: "SELECT badge, COUNT(*) AS denied FROM access_log WHERE granted = 0 GROUP BY badge HAVING COUNT(*) >= 3 ORDER BY denied DESC", ordered: true,
    hint: "<code>WHERE granted = 0 GROUP BY badge HAVING COUNT(*) &gt;= 3 ORDER BY denied DESC</code>",
    note: "Swap the table for an authentication log and the badge for a username and you have a brute-force detection query. Add <code>AND hour BETWEEN 0 AND 5</code> and you're asking who's trying doors in the middle of the night. SQL is the analyst's primary tool because questions like these are one line each.",
    sol: "SELECT badge, COUNT(*) AS denied\nFROM access_log\nWHERE granted = 0\nGROUP BY badge\nHAVING COUNT(*) >= 3\nORDER BY denied DESC;" },

  { id: "d6", tier: "deep", concept: "Computed aggregates with NULL handling", title: "Longest Careers by Position",
    teach: { what: "Average a computed expression per group, excluding NULLs on purpose with WHERE, then rank and limit. Every piece is from camp; the skill is sequencing them.", football: "Which positions have the longest careers among the legends? Active players don't have an end year, so they have to be left out or they'd poison the average.", example: "SELECT team, MAX(last_year - first_year + 1) AS longest FROM legends WHERE last_year IS NOT NULL GROUP BY team;" },
    prompt: "Return <code>pos</code> and the average career length in seasons (<code>last_year - first_year + 1</code>, rounded to 1 decimal, alias <code>avg_seasons</code>) for retired legends only. Top 3 positions, longest first, ties alphabetical.",
    expect: "SELECT pos, ROUND(AVG(last_year - first_year + 1), 1) AS avg_seasons FROM legends WHERE last_year IS NOT NULL GROUP BY pos ORDER BY avg_seasons DESC, pos ASC LIMIT 3", ordered: true,
    hint: "<code>WHERE last_year IS NOT NULL GROUP BY pos ORDER BY avg_seasons DESC, pos ASC LIMIT 3</code>",
    note: "If you forget the NULL filter, AVG silently skips the NULL results anyway, so the numbers come out the same here. In other databases or with COUNT in the mix, they wouldn't. Filtering explicitly documents your intent and protects you when the data changes.",
    sol: "SELECT pos, ROUND(AVG(last_year - first_year + 1), 1) AS avg_seasons\nFROM legends\nWHERE last_year IS NOT NULL\nGROUP BY pos\nORDER BY avg_seasons DESC, pos ASC\nLIMIT 3;" },

  { id: "d7", tier: "deep", concept: "JOIN + GROUP BY", title: "Legends by Division",
    teach: { what: "Join first so each legend row carries its team's division, then group by the joined columns. The join widens each row; the group collapses them.", football: "Which division produced the most legends on the list? The division lives in teams, the players live in legends; join, then pile up.", example: "SELECT t.conference, COUNT(*) AS n FROM legends l JOIN teams t ON l.team = t.abbr GROUP BY t.conference;" },
    prompt: "Return <code>conference</code>, <code>division</code> and the number of legends from its teams (alias <code>legends</code>). Most first, then conference and division alphabetically.",
    expect: "SELECT t.conference, t.division, COUNT(*) AS legends FROM legends l JOIN teams t ON l.team = t.abbr GROUP BY t.conference, t.division ORDER BY legends DESC, t.conference ASC, t.division ASC", ordered: true,
    hint: "<code>FROM legends l JOIN teams t ON l.team = t.abbr GROUP BY t.conference, t.division ORDER BY legends DESC, t.conference, t.division</code>",
    note: "Divisions with zero legends would be missing from this result, because an inner JOIN only keeps matches. A <code>LEFT JOIN</code> from teams would keep them with a count of 0, the same way the Python standings drill initialized every team first.",
    sol: "SELECT t.conference, t.division, COUNT(*) AS legends\nFROM legends l\nJOIN teams t ON l.team = t.abbr\nGROUP BY t.conference, t.division\nORDER BY legends DESC, t.conference ASC, t.division ASC;" },

  { id: "d8", tier: "deep", concept: "CTEs (WITH)", title: "Fifty-Yard Club",
    teach: { what: "A <b>CTE</b> (<code>WITH name AS (...)</code>) gives a subquery a name so the main query reads top to bottom. Build the per-player totals first, then query that result like a table.", football: "Everybody who touched the ball for 50 or more yards from scrimmage. Step one, total each player's yards; step two, keep the ones over the line. The CTE is step one with a name on it.", example: "WITH denied AS (\n  SELECT badge, COUNT(*) AS n FROM access_log WHERE granted = 0 GROUP BY badge\n)\nSELECT badge FROM denied WHERE n >= 3;" },
    prompt: "Using a CTE named <code>per_player</code> that totals <code>yards</code> per <code>player</code> on run and pass plays (alias <code>total</code>), return <code>player</code> and <code>total</code> for everyone with 50 or more, highest first.",
    expect: "WITH per_player AS (SELECT player, SUM(yards) AS total FROM plays WHERE play_type IN ('run', 'pass') GROUP BY player) SELECT player, total FROM per_player WHERE total >= 50 ORDER BY total DESC", ordered: true,
    hint: "<code>WITH per_player AS (SELECT player, SUM(yards) AS total FROM plays WHERE play_type IN ('run', 'pass') GROUP BY player) SELECT player, total FROM per_player WHERE total &gt;= 50 ORDER BY total DESC</code>",
    note: "You could write this with HAVING total &gt;= 50 and no CTE. CTEs earn their keep when the intermediate result is reused or the query gets long enough that nesting hurts readability. Naming your steps is the same discipline as naming your variables.",
    sol: "WITH per_player AS (\n  SELECT player, SUM(yards) AS total\n  FROM plays\n  WHERE play_type IN ('run', 'pass')\n  GROUP BY player\n)\nSELECT player, total\nFROM per_player\nWHERE total >= 50\nORDER BY total DESC;" }
];
