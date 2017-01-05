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
        getPlayerStats(summonerId, playerNum, REGION)
        $('#player'+playerNum+'MainInfo').show();
        $('#player'+playerNum+'DetailedInfo').show();
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
      if (tier === "Master" || tier === "Challenger")
        var division = "";
      else
        var division = json[summonerId][0].entries[0].division;
      var lp = json[summonerId][0].entries[0].leaguePoints;
      var wins = json[summonerId][0].entries[0].wins;
      var losses = json[summonerId][0].entries[0].losses
      var winRate = wins / (wins + losses) * 100;
      winRate = winRate.toFixed(2);
      var rankedIconLocation = setRankedIcon(tier, division);
      $('.hr-'+playerNum).show();
      document.getElementById('summoner' + playerNum + 'Rank').innerHTML = tier + " " + division + " - " + lp + " LP";
      document.getElementById('summoner' + playerNum + 'WinRatio').innerHTML = "Win Ratio: " + winRate + "% " +
      "<br/>(" + wins + "W " + losses + "L)" ;
      document.getElementById('summoner' + playerNum +'RankIcon').setAttribute("src", rankedIconLocation);
    },
    error: function (XMLHttpRequest, textStatus, errorThrown) {
      if (errorThrown === "Not Found") {
        document.getElementById('summoner' + playerNum + 'Rank').innerHTML = "Unranked";
        document.getElementById('summoner' + playerNum + 'WinRatio').innerHTML = "Win Ratio: n/a ";
        document.getElementById('summoner' + playerNum +'RankIcon').setAttribute("src", "./base_icons/provisional.png");
      }
    }
  });
}

function setRankedIcon(tier, division) {
  tier = tier.toLowerCase();
  division = division.toLowerCase();
  if (tier === "master" || tier === "challenger")
  var location = "./base_icons/" + tier + ".png";
  else
  var location = "./tier_icons/" + tier + "_" + division + ".png";
  return location
}

function getPlayerStats(summonerId, num, reg) {
  $.ajax({
    url: "https://na.api.pvp.net/api/lol/"+ reg + "/v1.3/stats/by-summoner/"+ summonerId + "/ranked?api_key=" + API_KEY,
    type: 'GET',
    data: {

    },
    success: function(json) {
      var data = json.champions;
      var totals;
      for (var key in data) {
        if (data[key].id == 0)
        totals = data[key];
      }
      totals = totals.stats;
      var favChampId = getFavoriteChampionId(data);
      var favChampWR = getFavChampWinRate(data, favChampId);
      var totalKills = totals.totalChampionKills;
      var totalDeaths = totals.totalDeathsPerSession;
      var totalAssists = totals.totalAssists;
      var totalCS = totals.totalMinionKills + totals.totalNeutralMinionsKilled;
      var totalGames = totals.totalSessionsPlayed;
      var kda = (totalKills + totalAssists) / totalDeaths;
      kda = kda.toFixed(2) + " : 1";

      var avgKills = totalKills / totalGames;
      avgKills = avgKills.toFixed(2);
      var avgDeaths = totalDeaths / totalGames;
      avgDeaths = avgDeaths.toFixed(2);
      var avgAssists =  totalAssists / totalGames;
      avgAssists = avgAssists.toFixed(2);
      var avgCS = totalCS / totalGames;
      avgCS = avgCS.toFixed(2);
      setFavChampion(favChampId, num, reg);
      document.getElementById('player'+num+'KDA').innerHTML = kda;
      document.getElementById('player'+num+'Kills').innerHTML = avgKills;
      document.getElementById('player'+num+'Deaths').innerHTML = avgDeaths;
      document.getElementById('player'+num+'Assists').innerHTML = avgAssists;
      document.getElementById('player'+num+'CS').innerHTML = avgCS;
      document.getElementById("player"+num+"MostPlayedWR").innerHTML = favChampWR;
    },
    error: function (XMLHttpRequest, textStatus, errorThrown) {
      document.getElementById('player'+num+'KDA').innerHTML = "n/a";
      document.getElementById('player'+num+'Kills').innerHTML = "n/a";
      document.getElementById('player'+num+'Deaths').innerHTML = "n/a";
      document.getElementById('player'+num+'Assists').innerHTML = "n/a";
      document.getElementById('player'+num+'CS').innerHTML = "n/a";
    }
  });
}

function getFavoriteChampionId(data) {
  var maxGames = 0;
  var champId;
  for (var key in data) {
    var n = data[key].stats.totalSessionsPlayed;
    if (n > maxGames && data[key].id != 0) {
      maxGames = n;
      champId = data[key].id;
    }
  }
  return champId;
}

function getFavChampWinRate(data, favChampId) {
  var totalWins;
  var totalGames;
  for (var key in data) {
    if (data[key].id == favChampId) {
      totalWins = data[key].stats.totalSessionsWon;
      totalGames = data[key].stats.totalSessionsPlayed;
    }
  }
  var winRate = (totalWins/totalGames*100).toFixed(2);
  return winRate + "%";
}

function setFavChampion(id, num, reg) {
  $.ajax({
    url:"https://global.api.pvp.net/api/lol/static-data/"+ reg+"/v1.2/champion/"+id+"?champData=image&api_key=" + API_KEY,
    type: 'GET',
    data: {

    },
    success: function(json) {
      var champName = json.name;
      var champImgName = json.image.full;
      var iconURL = "http://ddragon.leagueoflegends.com/cdn/6.24.1/img/champion/" + champImgName;
      document.getElementById("player"+num+"MostPlayedChamp").innerHTML = champName;
      document.getElementById("player"+num+"MostPlayedIcon").setAttribute("src", iconURL);
    },
    error: function (XMLHttpRequest, textStatus, errorThrown) {
      document.getElementById("player"+num+"MostPlayedChamp").innerHTML = "n/a";
    }
  });
}
