var url = "data/giants2021schedule.json";
var today = new Date();
var nextGame = null;
var todaysGame = null;
var linescore_url_dyn = "";
var linescore_url_root = "http://gd2.mlb.com/components/game/mlb/year_2021/";
var y_url = "";
var opponent,
  gameFinished = false,
  result = "won";
var giantsRuns, opponentRuns;

function isDateLaterThan(a, b) {
  return a > b;
}

function refreshPage() {
  location.reload();
}

/* from https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Date */
function ISODateString(d) {
  function pad(n) {
    return n < 10 ? "0" + n : n;
  }
  return (
    d.getUTCFullYear() +
    "-" +
    pad(d.getUTCMonth() + 1) +
    "-" +
    pad(d.getUTCDate())
  );
}

function populatescore(_json) {
  $("#game .awayteam").append(_json.away_team_name);
  $("#game .hometeam").append(_json.home_team_name);
  $.each(_json.linescore.inning, function(i, inning) {
    $("#game .awayscore .score" + (i + 1)).append(inning.away);
    $("#game .homescore .score" + (i + 1)).append(inning.home);
    if (i > 8) {
      $("#game .boxheader").append("<td class='inning'>" + (i + 1) + "</td>");
      $("#game .awayscore").append(
        "<td class='score" + (i + 1) + "'>" + inning.away + "</td>"
      );
      $("#game .homescore").append(
        "<td class='score" + (i + 1) + "'>" + inning.home + "</td>"
      );
    }
  });
  if (_json.linescore.r.away) {
    $("#game .awayscore").append(
      "<td class='awayruns'>" + _json.linescore.r.away + "</td>"
    );
  } else $("#game .awayscore").append("<td class='awayruns'>0</td>");
  if (_json.linescore.r.home) {
    $("#game .homescore").append(
      "<td class='homeruns'>" + _json.linescore.r.home + "</td>"
    );
  } else $("#game .homescore").append("<td class='homeruns'>0</td>");

  if (_json.home_team_name === "Giants") {
    giantsRuns = _json.linescore.r.home;
    opponentRuns = _json.linescore.r.away;
    $("#game .homeruns").addClass("giants");
    $("#game .awayruns").addClass("opponent");
  } else {
    giantsRuns = _json.linescore.r.away;
    opponentRuns = _json.linescore.r.home;
    $("#game .homeruns").addClass("opponent");
    $("#game .awayruns").addClass("giants");
  }

  if (parseInt(giantsRuns, 10) < parseInt(opponentRuns, 10)) result = "lost";
  else if (parseInt(giantsRuns, 10) === parseInt(opponentRuns, 10))
    result = "tied"; //this can only happen in spring training
  if (_json.status.status === "Final") {
    gameFinished = true;
    $("#game .boxheader").append("<td class='inning'>F</td>");
    $("#game .summary").text("The Giants played the " + opponent + " at ");
    $("#game .location").text(_json.venue);
    $("#game .tstart").remove();
    $("#game .location").append(" and " + result + ".");
  } else {
    $("#game .boxheader").append("<td class='inning'>R</td>");
  }
  $(".boxscore").show();
}

function make_y_url(_url) {
  var _y_prefix =
    "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20json%20where%20url%3D'";
  var _encoded = encodeURIComponent(_url);
  var _y_url =
    _y_prefix + _encoded + "'&format=json&diagnostics=true&callback=?";
  return _y_url;
}

function getLinescoreLink(gridLink) {
  var giantsLinescoreURL = gridLink.split("grid.json")[0];
  $.getJSON(gridLink, function findGiantsScoreLinkFromGames(json) {}).done(
    function getLinscoreFromLink(json) {
      $.each(json.data.games.game, function searchForGiantsGame(i, game) {
        if (
          game.away_team_name === "Giants" ||
          game.home_team_name === "Giants"
        ) {
          giantsLinescoreURL =
            giantsLinescoreURL +
            "gid_" +
            game.id.replace(/[\/-]/g, "_") +
            "/linescore.json";
          return false;
        }
      });

      $.getJSON(giantsLinescoreURL, function(json) {}).done(function(json) {
        if (json.data.game.status !== "Preview") {
          populatescore(json);
        }
      });
    }
  );
}

$(document).ready(function() {
  // Format date as MM/DD/YY
  var curr_date = today.getDate();
  var curr_month = today.getMonth() + 1;
  var curr_year = today.getFullYear();

  // Check for game today
  $.getJSON(url, function(data) {
    var nextGameDate;

    $.each(data.games, function(i, game) {
      nextGameDate = new Date(game.date);
      if (!nextGame && isDateLaterThan(nextGameDate, today)) {
        nextGame = game;
        opponent = nextGame.opponent;
        return false;
      }
      if (
        today.getYear() == nextGameDate.getYear() &&
        today.getMonth() == nextGameDate.getMonth() &&
        today.getDate() == nextGameDate.getDate()
      ) {
        todaysGame = game;
        opponent = todaysGame.opponent;
        return false;
      }
    });

    if (todaysGame) {
      var gridLink;
      if (curr_month < 10) {
        gridLink = linescore_url_root + "month_0";

        if (curr_date < 10) {
          gridLink =
            gridLink +
            curr_month +
            "/day_0" +
            curr_date +
            "/" +
            "master_scoreboard.json";
        } else {
          gridLink =
            gridLink +
            curr_month +
            "/day_" +
            curr_date +
            "/" +
            "master_scoreboard.json";
        }
      } else {
        if (curr_date < 10) {
          gridLink =
            gridLink +
            curr_month +
            "/day_0" +
            curr_date +
            "/" +
            "master_scoreboard.json";
        } else {
          gridLink =
            gridLink +
            curr_month +
            "/day_" +
            curr_date +
            "/" +
            "master_scoreboard.json";
        }
      }

      $.getJSON(gridLink, function() {}).done(function(data) {
        $.each(data.data.games.game, function(i, game) {
          if (game.away_code === "sfn") {
            populatescore(game);
          }
          if (game.home_code === "sfn") {
            populatescore(game);
          }
        });
        // if (data.game.status !== 'Preview') {
        //   populatescore(game);
        // }
      });

      $(".fill-in").text("YES");
      $("#game .summary").text("The Giants play the " + opponent + " at ");
      $("#game .location").text(" at " + todaysGame.location + ".");
      $("#game .tstart").text(todaysGame.time);

      $("#game abbr").attr("title", ISODateString(nextGameDate));
      if (todaysGame.location == "Oracle Park") {
        $("body").addClass("home");
        $("#yesno .homeaway").text("At home");
      } else {
        $("body").addClass("away");
        $("#yesno .homeaway").text("Away");
      }
      $("#game").show();
    } else {
      // Formate next game date as day of the week
      var weekday = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
      ];
      var nextGameDay = weekday[nextGameDate.getDay()];
      $(".fill-in").text("NO");
      $("#game .summary").text("The Giants will play the " + opponent);
      $("#game .day").text(" on " + nextGameDay);
      $("#game .tstart").text(nextGame.time);
      $("#game .location").text(" at " + nextGame.location + ".");
      $("#game").show();
    }
  });
  // automatically reload the page once every 1/2 hour
  setTimeout("refreshPage()", 1000 * 60 * 60 * 0.5);
});
