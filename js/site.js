function isDateLaterThan(a, b) {
  return a > b;
}

/* from https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Date */
function ISODateString(d){  
    function pad(n){return n<10 ? '0'+n : n}  
    return d.getUTCFullYear()+'-'  
        + pad(d.getUTCMonth()+1)+'-'  
        + pad(d.getUTCDate());
}  

function populatescore(json) {
    $("#game .awayteam").append(json.data.game.away_team_name);
    $.each(json.data.game.linescore, function(i, inning) {
        $("#game .awayscore .score" + (i + 1)).append(inning.away_inning_runs);
    });
    $("#game .awayruns").append(json.data.game.away_team_runs);
    $("#game .hometeam").append(json.data.game.home_team_name);
    $.each(json.data.game.linescore, function(i, inning) {
        $("#game .homescore .score" + (i + 1)).append(inning.home_inning_runs);
    });
    $("#game .homeruns").append(json.data.game.home_team_runs);

    if (json.data.game.venue == "AT&T Park") {
        $("#game .homeruns").addClass("giants");
        $("#game .awayruns").addClass("opponent");
        $("#game .hometeam").text("Giants");
        $("#game .awayteam").text(json.data.game.away_team_name);
    }
     else {
        $("#game .homeruns").addClass("opponent");
        $("#game .awayruns").addClass("giants");
        $("#game .awayteam").text("Giants");
        $("#game .hometeam").text(json.data.game.home_team_name);
    }
}


$(document).ready(function(){
    var url = 'data/giants2012schedule.json';
    var url='http://dev.pablo/isthereagiantsgametoday/data/giants2012schedule.json'; 
    var today = new Date();
    var nextGame = null;
    var todaysGame = null;
    
    // Format date as MM/DD/YY
    var curr_date = today.getDate();
    var curr_month = today.getMonth() + 1;
    var curr_year = today.getFullYear();
    // var dateString = curr_month + "/" + curr_date + "/" + curr_year;

    // Create datepicker
    // $("#datecheck").html('Checking <input id="datepicker" type="text">');
	// $( "#datepicker" ).datepicker();

    // $(".datepicker").datepicker.("setDate", dateString);
    console.log("ready");
    // Check for game today
    // $.getJSON(url,function(data){
    //     console.log("fire");
    //     console.log(data);
    //     var nextGameDate;
    //     var callbackstring = '';
        // $.each(data.games,function(i,game){
        //     nextGameDate = new Date(game.date);
        //     if (!nextGame && isDateLaterThan(nextGameDate, today)) {
        //         nextGame = game;
        //         console.log(nextGame);
        //         return false; 
        //     }
        //     if(today.getYear() == nextGameDate.getYear() && today.getMonth() == nextGameDate.getMonth() && today.getDate() == nextGameDate.getDate()) {
        //         todaysGame = game;
        //         console.log(todaysGame);
        //         return false;
        //     }  
        // });
        // if (todaysGame) {
        //     if (curr_month < 10) {
        //       if (curr_date<10) {
        //         linescore_url_dyn = 'http://gd2.mlb.com/components/game/mlb/year_2012/month_0' + 
        //         curr_month + '/day_0' + curr_date + '/' + todaysGame.url + '/linescore.json' + callbackstring;
        //       } 
        //       else {
        //         linescore_url_dyn = 'http://gd2.mlb.com/components/game/mlb/year_2012/month_0' + 
        //         curr_month + '/day_' + curr_date + '/' + todaysGame.url + '/linescore.json' + callbackstring;
        //       }
        //     }
        //     else {
        //       if (curr_date<10)
        //       {
        //         linescore_url_dyn = 'http://gd2.mlb.com/components/game/mlb/year_2012/month_' + 
        //         curr_month + '/day_0' + curr_date + '/' + todaysGame.url + '/linescore.json' + callbackstring;
        //       } 
        //       else {
        //         linescore_url_dyn = 'http://gd2.mlb.com/components/game/mlb/year_2012/month_' + 
        //         curr_month + '/day_' + curr_date + '/' + todaysGame.url + '/linescore.json' + callbackstring;
        //       }
        //     }
        //     // console.log(linescore_url_dyn);
        // }
        // var linescore_url_dyn = 'http://gd2.mlb.com/components/game/mlb/year_2012/month_04/day_27/gid_2012_04_27_sdnmlb_sfnmlb_1/linescore.json';

    
    // Create datepicker
    // $("#datecheck").html('Checking <input id="datepicker" type="text">');
    // $("#datepicker").datepicker();

    // $(".datepicker").datepicker.("setDate", dateString);

    // Check for game today               
    $.getJSON(url, function(json){
        var nextGameDate;
        
        $.each(json.games,function(i,game){
            nextGameDate = new Date(game.date);
               
            // Uncomment for debugging 
            // console.log("Today: " + today + " - Looking at game: " + nextGameDate);

          if (!nextGame && isDateLaterThan(nextGameDate, today)){
            nextGame = game;
            return false; // break the loop
          }
          
            if(today.getYear() == nextGameDate.getYear() && today.getMonth() == nextGameDate.getMonth() && today.getDate() == nextGameDate.getDate()) {
              todaysGame = game;
              return false; // break the loop
            }            
        });
        
        if (todaysGame) {
            $(".fill-in").text("YES");
            $("#game .summary").text("Giants play the " + todaysGame.opponent);
            $("#game .location").text(todaysGame.location);
            $("#game .tstart").text(todaysGame.time);
            
            $("#game abbr").attr('title', ISODateString(nextGameDate));
            if (todaysGame.location == "AT&T Park") {
                $("body").addClass("home");
                $("#yesno .homeaway").text("At home");
             }
             else {
                $("body").addClass("away");
                $("#yesno .homeaway").text("Away");
                $("#yesno").css("border-color", "#000");
             }
            $("#game").show();
        }
        else {
          console.log("nextGame date: " + nextGame.date);
          $(".fill-in").text("NO");
          $("#game .date").text(nextGame.date);
          $("#game .summary").text("Giants will play the " + nextGame.opponent);
          $("#game .location").text(nextGame.location);
          
          // Formate next game date as day of the week
          var weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
          var nextGameDay = weekday[nextGameDate.getDay()];
          // console.log("nextGameDate: " + nextGameDate);
          // Format next game date as day of the week
          var weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
          var nextGameDay = weekday[nextGameDate.getDay()];
          $("#game .day").text("on " + nextGameDay);
          $("#game .tstart").text(nextGame.time);
          // if (nextGame.location == "AT&T Park") {
          //  $("#nextgame .location").addClass("homegame");
          //   $("body").addClass("homegame-bg");
          // }
          $("#game").show();
        }
    });             
});    