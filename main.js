$(function() {
  $(".main-info").hide();
  $(".detailed-info").hide();
  $("hr").hide();
});

function setRegion(regionVal, selectorId) {
  regionVal = $(regionVal).attr("value");
  $(selectorId).text(regionVal);
  regionVal = regionVal.toLowerCase();
  $(selectorId).attr("value", regionVal);
}

  var API_KEY = "RGAPI-217a0491-95a0-4107-9d45-93ac21a49b94";
function summonerLookup(playerNum) {
  var SUMMONER_NAME = "";
  var REGION = "";

  if (playerNum == 1) {
    if ($("#player1Region").attr('value') === "") {
      alert("Please pick a region.");
      return;
    }
    SUMMONER_NAME = $("#player1Search").val();
    REGION = $("#player1Region").attr('value');

  } else if (playerNum == 2) {
    if ($("#player2Region").attr('value') === "") {
      alert("Please pick a region.");
      return;
    }
    SUMMONER_NAME = $("#player2Search").val();
    REGION = $("#player2Region").attr('value');
  }

  if (SUMMONER_NAME !== "") {
    $.ajax({
      url: 'https://na.api.pvp.net/api/lol/'+ REGION + '/v1.4/summoner/by-name/' + SUMMONER_NAME + '?api_key=' + API_KEY,
      type: 'GET',
      data: {

      },
      success: function (json) {
        var SUMMONER_NAME_NO_SPACE = SUMMONER_NAME.replace(' ','');
        SUMMONER_NAME_NO_SPACE = SUMMONER_NAME_NO_SPACE.toLowerCase().trim();

        SUMMONER_NAME = json[SUMMONER_NAME_NO_SPACE].name;
        var summonerId = json[SUMMONER_NAME_NO_SPACE].id;
        var profileIconNum = json[SUMMONER_NAME_NO_SPACE].profileIconId;
        document.getElementById('player' + playerNum + 'ProfileIcon').setAttribute("src",
        "http://ddragon.leagueoflegends.com/cdn/6.24.1/img/profileicon/"+ profileIconNum+ ".png");
        document.getElementById('summonerName' + playerNum).innerHTML = SUMMONER_NAME;
        getSummonerRank(summonerId, playerNum, REGION);
        if (playerNum == 1) {
          $('#player1MainInfo').show();
        } else if (playerNum == 2) {
          $("#player2MainInfo").show();
        }
      },
      error: function (XMLHttpRequest, textStatus, errorThrown) {
        alert("Error getting Summoner data !");
      }
    });
  } else {}
}
//Might be able to save API calls by saving in a plyer object
function getSummonerRank(summonerId, playerNum, reg) {
  $.ajax({
    url: "https://na.api.pvp.net/api/lol/" + reg + "/v2.5/league/by-summoner/"+ summonerId +"/entry/" + '?api_key=' + API_KEY,
    type: 'GET',
    data: {

    },
    success: function(json) {
      var tier = json[summonerId][0].tier;
      tier = tier.toLowerCase().split('')
      tier[0] = tier[0].toUpperCase();
      tier = tier.join('');

      var division = json[summonerId][0].entries[0].division;
      var lp = json[summonerId][0].entries[0].leaguePoints;
      var wins = json[summonerId][0].entries[0].wins;
      var losses = json[summonerId][0].entries[0].losses
      var winRate = wins / (wins + losses) * 100;
      document.getElementById('summoner' + playerNum + 'Rank').innerHTML = tier + " " + division + " - " + lp + " LP";
      document.getElementById('summoner' + playerNum + 'WinRatio').innerHTML = "Win Ratio: " + winRate + "% " +
       "(" + wins + "W " + losses + "L)" ;
    },
    error: function (XMLHttpRequest, textStatus, errorThrown) {
      alert("Error getting Summoner data !");
    }
  });
}
