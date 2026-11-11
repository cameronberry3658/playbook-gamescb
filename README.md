# Playbook: football-style coding practice games

Three browser games that teach programming the way a football program teaches football: start with the three-point stance, drill it until it's automatic, then run it live.

Every play you call is a coding challenge. Solve it and you move the chains. Miss it and you get stuffed, throw an incompletion, or get picked off. Each game runs entirely in the browser with no backend.

| Game | Language | Engine | Drills |
|------|----------|--------|--------|
| [Playbook.py](games/playbook-py.html) | Python 3 | [Skulpt](https://skulpt.org/) (Python compiled to JS) | 33 |
| [Playbook.sql](games/playbook-sql.html) | SQL (SQLite) | [sql.js](https://sql.js.org/) (SQLite compiled to JS) | 33 |
| [Playbook.js](games/playbook-js.html) | JavaScript | Native, sandboxed in a Web Worker | 26 |

## How the games work

**Training Camp.** A linear track of drills starting at the fundamentals (functions, variables, `SELECT *`, `WHERE`) and building to recursion, state machines, joins, and CTEs. Every drill opens with a **chalk talk**: what the concept is, a football translation of it, and a worked example on the board. Hints and the film room (solution plus a line-by-line walkthrough) are free in camp.

**Game Day.** Eight possessions. Each one opens with a kickoff trivia question built from real NFL data (spin a random team, answer a question about its division, stadium, or Super Bowl count). A right answer starts the drive at the 40, a wrong one at the 20. Then call plays from the huddle:

| Play | Difficulty | Yards | On a miss |
|------|------------|-------|-----------|
| Fundamentals | Basics | 2 to 5 | No gain |
| Run | Easy | 3 to 7 | Stuffed at the line |
| Short Pass | Medium | 8 to 15 | Incomplete |
| Deep Shot | Hard | 22 to 38 | 30% chance of an interception |

Timeouts buy hints (three per possession). Fourth down offers a field goal (an easy drill for 3 points) or a punt. Progress is saved in the browser with `localStorage`.

**The SQL database** has four tables: all 32 NFL teams, 62 all-time legends, a 48-play game log, and a facility badge access log used for security audit queries (failed-swipe detection, the same shape as brute-force login detection).

## Running locally

Open any file in `games/` directly in a browser. The Python and SQL games load their engines from a CDN, so they need an internet connection the first time.

## Building from source

The Python and SQL games share one engine. Sources live in `src/`:

```
src/
  shell.html   page template
  style.css    shared styles (light and dark themes)
  engine.js    game state, scoreboard, field, trivia kickoff, camp and game modes
  nfl.js       NFL teams and legends data, trivia generator
  py.js        Python adapter (Skulpt) and 33 drills
  sql.js       SQL adapter (sql.js), seed database, and 33 drills
  build.py     assembles games/playbook-py.html and games/playbook-sql.html
```

```
python3 src/build.py
```

## Adding a drill

Each drill is one object in `py.js` or `sql.js` with a `teach` block (chalk talk), a `prompt`, tests or an expected query, a `hint`, a `note` for the film room, and a `sol`. Add it to the `CH` array under the right `tier` and rebuild.

## Credits

Built by Cam Berry. Game design borrows the "spin a random team" kickoff from the First Down Studio trivia games.
