import pathlib, sys
B = pathlib.Path(__file__).parent
read = lambda n: (B / n).read_text()
shell, style, engine, nfl = read("shell.html"), read("style.css"), read("engine.js"), read("nfl.js")

GAMES = {
    "py": dict(
        out="playbook-py.html", title="Playbook.py", brand='Playbook<span>.py</span>',
        tagline="Call a play. Write the Python. Move the chains.", lang="Python",
        libs='<script src="https://cdn.jsdelivr.net/npm/skulpt@1.2.0/dist/skulpt.min.js"></script>\n<script src="https://cdn.jsdelivr.net/npm/skulpt@1.2.0/dist/skulpt-stdlib.js"></script>',
        sidebar=""),
    "sql": dict(
        out="playbook-sql.html", title="Playbook.sql", brand='Playbook<span>.sql</span>',
        tagline="Call a play. Write the query. Move the chains.", lang="SQL",
        libs='<script src="https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/sql-asm.js"></script>',
        sidebar='<section class="panel"><h3>The database</h3><p class="side-note">Four tables. Column names are exactly as shown.</p><div class="schema" id="schema"></div></section>'),
}
for key, g in GAMES.items():
    html = (shell.replace("{{TITLE}}", g["title"]).replace("{{BRAND}}", g["brand"]).replace("{{TAGLINE}}", g["tagline"])
            .replace("{{LANG}}", g["lang"]).replace("{{LIBS}}", g["libs"]).replace("{{SIDEBAR}}", g["sidebar"])
            .replace("{{STYLE}}", style).replace("{{NFL}}", nfl).replace("{{CONTENT}}", read(key + ".js")).replace("{{ENGINE}}", engine))
    (B.parent / "games" / g["out"]).write_text(html)
    print(g["out"], len(html) // 1024, "KB")
