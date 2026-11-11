/* NFL reference data used by the trivia kickoff (and, in the SQL game, loaded into the database).
   Super Bowl counts are through Super Bowl LX (February 2026). */
const TEAMS = [
  // abbr, name, location, conference, division, stadium, first_season, super_bowls
  ["ARI","Cardinals","Arizona","NFC","West","State Farm Stadium",1920,0],
  ["ATL","Falcons","Atlanta","NFC","South","Mercedes-Benz Stadium",1966,0],
  ["BAL","Ravens","Baltimore","AFC","North","M&T Bank Stadium",1996,2],
  ["BUF","Bills","Buffalo","AFC","East","Highmark Stadium",1960,0],
  ["CAR","Panthers","Carolina","NFC","South","Bank of America Stadium",1995,0],
  ["CHI","Bears","Chicago","NFC","North","Soldier Field",1920,1],
  ["CIN","Bengals","Cincinnati","AFC","North","Paycor Stadium",1968,0],
  ["CLE","Browns","Cleveland","AFC","North","Huntington Bank Field",1946,0],
  ["DAL","Cowboys","Dallas","NFC","East","AT&T Stadium",1960,5],
  ["DEN","Broncos","Denver","AFC","West","Empower Field at Mile High",1960,3],
  ["DET","Lions","Detroit","NFC","North","Ford Field",1930,0],
  ["GB","Packers","Green Bay","NFC","North","Lambeau Field",1921,4],
  ["HOU","Texans","Houston","AFC","South","NRG Stadium",2002,0],
  ["IND","Colts","Indianapolis","AFC","South","Lucas Oil Stadium",1953,2],
  ["JAX","Jaguars","Jacksonville","AFC","South","EverBank Stadium",1995,0],
  ["KC","Chiefs","Kansas City","AFC","West","Arrowhead Stadium",1960,4],
  ["LV","Raiders","Las Vegas","AFC","West","Allegiant Stadium",1960,3],
  ["LAC","Chargers","Los Angeles","AFC","West","SoFi Stadium",1960,0],
  ["LAR","Rams","Los Angeles","NFC","West","SoFi Stadium",1937,2],
  ["MIA","Dolphins","Miami","AFC","East","Hard Rock Stadium",1966,2],
  ["MIN","Vikings","Minnesota","NFC","North","U.S. Bank Stadium",1961,0],
  ["NE","Patriots","New England","AFC","East","Gillette Stadium",1960,6],
  ["NO","Saints","New Orleans","NFC","South","Caesars Superdome",1967,1],
  ["NYG","Giants","New York","NFC","East","MetLife Stadium",1925,4],
  ["NYJ","Jets","New York","AFC","East","MetLife Stadium",1960,1],
  ["PHI","Eagles","Philadelphia","NFC","East","Lincoln Financial Field",1933,2],
  ["PIT","Steelers","Pittsburgh","AFC","North","Acrisure Stadium",1933,6],
  ["SF","49ers","San Francisco","NFC","West","Levi's Stadium",1946,5],
  ["SEA","Seahawks","Seattle","NFC","West","Lumen Field",1976,2],
  ["TB","Buccaneers","Tampa Bay","NFC","South","Raymond James Stadium",1976,2],
  ["TEN","Titans","Tennessee","AFC","South","Nissan Stadium",1960,0],
  ["WAS","Commanders","Washington","NFC","East","Northwest Stadium",1932,3]
].map(r => ({ abbr: r[0], name: r[1], location: r[2], conference: r[3], division: r[4], stadium: r[5], first_season: r[6], super_bowls: r[7] }));

const LEGENDS = [
  // name, team (current franchise abbr), pos, number, first_year, last_year (null = still active)
  ["Barry Sanders","DET","RB",20,1989,1998],["Calvin Johnson","DET","WR",81,2007,2015],["Ndamukong Suh","DET","DT",90,2010,2014],
  ["Jerry Rice","SF","WR",80,1985,2000],["Joe Montana","SF","QB",16,1979,1992],
  ["Tom Brady","NE","QB",12,2000,2019],["Vince Wilfork","NE","NT",75,2004,2014],["Richard Seymour","NE","DE",93,2001,2008],
  ["Peyton Manning","IND","QB",18,1998,2011],["Walter Payton","CHI","RB",34,1975,1987],
  ["Lawrence Taylor","NYG","LB",56,1981,1993],["Michael Strahan","NYG","DE",92,1993,2007],["Reggie White","PHI","DE",92,1985,1992],
  ["Jim Brown","CLE","RB",32,1957,1965],["Emmitt Smith","DAL","RB",22,1990,2002],["Dan Marino","MIA","QB",13,1983,1999],
  ["Brett Favre","GB","QB",4,1992,2007],["Aaron Donald","LAR","DT",99,2014,2023],["Kurt Warner","LAR","QB",13,1998,2003],
  ["Marshall Faulk","LAR","RB",28,1999,2005],["Deacon Jones","LAR","DE",75,1961,1971],
  ["Ray Lewis","BAL","LB",52,1996,2012],["Ed Reed","BAL","S",20,2002,2012],["Haloti Ngata","BAL","DT",92,2006,2014],
  ["Troy Polamalu","PIT","S",43,2003,2014],["Ben Roethlisberger","PIT","QB",7,2004,2021],["Joe Greene","PIT","DT",75,1969,1981],
  ["Drew Brees","NO","QB",9,2006,2020],["Adrian Peterson","MIN","RB",28,2007,2016],["Randy Moss","MIN","WR",84,1998,2004],
  ["John Randle","MIN","DT",93,1990,2000],["Alan Page","MIN","DT",88,1967,1978],["Steve Largent","SEA","WR",80,1976,1989],
  ["Earl Campbell","TEN","RB",34,1978,1984],["Warren Moon","TEN","QB",1,1984,1993],["Steve McNair","TEN","QB",9,1997,2005],
  ["Eddie George","TEN","RB",27,1996,2003],["Derrick Henry","TEN","RB",22,2016,2023],
  ["Derrick Thomas","KC","LB",58,1989,1999],["Tony Gonzalez","KC","TE",88,1997,2008],["Patrick Mahomes","KC","QB",15,2017,null],
  ["Travis Kelce","KC","TE",87,2013,null],["Chris Jones","KC","DT",95,2016,null],
  ["Josh Allen","BUF","QB",17,2018,null],["Jim Kelly","BUF","QB",12,1986,1996],["Bruce Smith","BUF","DE",78,1985,1999],["Thurman Thomas","BUF","RB",34,1988,1999],
  ["LaDainian Tomlinson","LAC","RB",21,2001,2009],["Junior Seau","LAC","LB",55,1990,2002],["Dan Fouts","LAC","QB",14,1973,1987],
  ["John Elway","DEN","QB",7,1983,1998],["Terrell Davis","DEN","RB",30,1995,2001],["Von Miller","DEN","LB",58,2011,2021],
  ["Julius Peppers","CAR","DE",90,2002,2009],["Cam Newton","CAR","QB",1,2011,2019],["Luke Kuechly","CAR","LB",59,2012,2019],
  ["Michael Vick","ATL","QB",7,2001,2006],["Julio Jones","ATL","WR",11,2011,2020],["Matt Ryan","ATL","QB",2,2008,2021],
  ["Larry Fitzgerald","ARI","WR",11,2004,2020],["Warren Sapp","TB","DT",99,1995,2003],["J.J. Watt","HOU","DE",99,2011,2020]
].map(r => ({ name: r[0], team: r[1], pos: r[2], number: r[3], first_year: r[4], last_year: r[5] }));

/* Trivia kickoff: spin a random team, ask one question built from the data above. */
function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
function uniq(a) { return [...new Set(a)]; }

function makeTrivia() {
  const t = pick(TEAMS);
  const full = t.location + " " + t.name;
  const divName = x => x.conference + " " + x.division;
  const kind = pick(["div", "stadium", "sb", "mate", "conf"]);
  let q, answer, options, fact, sql;
  if (kind === "div") {
    q = "Which division do the " + full + " play in?";
    answer = divName(t);
    options = shuffle([answer, ...shuffle(uniq(TEAMS.map(divName)).filter(d => d !== answer)).slice(0, 3)]);
    sql = "SELECT conference, division FROM teams WHERE name = '" + t.name + "';";
  } else if (kind === "stadium") {
    q = "Where do the " + full + " play their home games?";
    answer = t.stadium;
    options = shuffle([answer, ...shuffle(uniq(TEAMS.map(x => x.stadium)).filter(s => s !== answer)).slice(0, 3)]);
    sql = "SELECT stadium FROM teams WHERE name = '" + t.name + "';";
  } else if (kind === "sb") {
    const other = pick(TEAMS.filter(x => x.abbr !== t.abbr && x.super_bowls !== t.super_bowls));
    q = "Who has more Super Bowl wins: the " + t.name + " or the " + other.name + "?";
    answer = t.super_bowls > other.super_bowls ? t.name : other.name;
    options = shuffle([t.name, other.name]);
    fact = t.name + " " + t.super_bowls + ", " + other.name + " " + other.super_bowls + " (through Super Bowl LX).";
    sql = "SELECT name, super_bowls FROM teams WHERE name IN ('" + t.name + "', '" + other.name + "') ORDER BY super_bowls DESC;";
  } else if (kind === "mate") {
    const mates = TEAMS.filter(x => x.abbr !== t.abbr && x.conference === t.conference && x.division === t.division);
    const m = pick(mates);
    q = "Which of these teams is in the same division as the " + full + "?";
    answer = m.location + " " + m.name;
    const others = shuffle(TEAMS.filter(x => !(x.conference === t.conference && x.division === t.division))).slice(0, 3).map(x => x.location + " " + x.name);
    options = shuffle([answer, ...others]);
    fact = "The " + divName(t) + ": " + [t, ...mates].map(x => x.name).join(", ") + ".";
    sql = "SELECT name FROM teams WHERE conference = '" + t.conference + "' AND division = '" + t.division + "';";
  } else {
    q = "Which conference are the " + full + " in?";
    answer = t.conference;
    options = ["AFC", "NFC"];
    sql = "SELECT conference FROM teams WHERE name = '" + t.name + "';";
  }
  if (!fact) fact = full + ": " + divName(t) + ", " + t.stadium + ", " + t.super_bowls + " Super Bowl win" + (t.super_bowls === 1 ? "" : "s") + ", first season " + t.first_season + ".";
  return { team: t, q, answer, options, fact, sql };
}
