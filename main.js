var currSumm1;
var currSumm2;
$(function() {
  $(".main-info").hide();
  $(".detailed-info").hide();
  $("hr").hide();
  $('#compare').prop("disabled", true);
});

function newSearch(playerNum) {
  $('#player'+playerNum+'MainInfo').slideUp();
  $('#player'+playerNum+'DetailedInfo').slideUp();
  $('.hr-'+playerNum+'-1').slideUp();
  $('.hr-'+playerNum+'-2').slideUp();
}

function disableSearchButtons() {
  $('#search1').prop("disabled", true);
  $('#search2').prop("disabled", true);
}

function enableSearchButtons() {
  $('#search1').prop("disabled", false);
  $('#search2').prop("disabled", false);
}

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

  if ($("#player"+playerNum+"Region").attr('value') === "") {
    alert("Please pick a region.");
    return;
  } else {
    SUMMONER_NAME = $("#player"+playerNum+"Search").val();
    REGION = $("#player"+playerNum+"Region").attr('value');
  }

  if (SUMMONER_NAME !== "") {
    var SUMMONER_NAME_NO_SPACE = SUMMONER_NAME.replace(' ','').toLowerCase().trim();
  }
  if (/[,!@#$%^&*()]/.test(SUMMONER_NAME)) {
    alert("Invalid Summoner Name");
    return;
  }

  if (SUMMONER_NAME !== "" && (SUMMONER_NAME_NO_SPACE !== currSumm1 && SUMMONER_NAME_NO_SPACE !== currSumm2)) {
    $.ajax({
      url: 'https://na.api.pvp.net/api/lol/'+ REGION + '/v1.4/summoner/by-name/' + SUMMONER_NAME + '?api_key=' + API_KEY,
      type: 'GET',
      data: {

      },
      success: function (json) {
        if (playerNum == 1)
          currSumm1 = SUMMONER_NAME_NO_SPACE;
        else
          currSumm2 = SUMMONER_NAME_NO_SPACE;
        SUMMONER_NAME = json[SUMMONER_NAME_NO_SPACE].name;
        var summonerId = json[SUMMONER_NAME_NO_SPACE].id;
        var profileIconNum = json[SUMMONER_NAME_NO_SPACE].profileIconId;
        document.getElementById('player' + playerNum + 'ProfileIcon').setAttribute("src",
        "https://ddragon.leagueoflegends.com/cdn/6.24.1/img/profileicon/"+ profileIconNum+ ".png");
        document.getElementById('summonerName' + playerNum).innerHTML = SUMMONER_NAME;
        getSummonerRank(summonerId, playerNum, REGION);
        $('#player'+playerNum+'MainInfo').css("visibility", "hidden");
        $('#player'+playerNum+'MainInfo').slideDown();
        $('#player1DetailedInfo').slideUp();
        $('#player2DetailedInfo').slideUp();
        resetTextColors();
        $('#player'+playerNum+'MainInfo').css("visibility", "visible");
      },
      error: function (XMLHttpRequest, textStatus, errorThrown) {
        if (errorThrown === "Too Many Requests") {
          alert("Too may requests please wait 10 seconds");
          disableSearchButtons();
          setTimeout(enableSearchButtons, 10000);
        } else {
          alert("Invalid Summoner Name");
        }
      }
    });
  } else { return;}
}

function resetTextColors() {
  $("#summoner1Rank").css("color", "black");
  $("#summoner2Rank").css("color", "black");
  $("#summoner1WinRatio").css("color", "black");
  $("#summoner2WinRatio").css("color", "black");
  $("#player1KDA").css("color", "black");
  $("#player1KDA").html($("#player1KDA").html().split(" <")[0]);
  $("#player2KDA").css("color", "black");
  $("#player2KDA").html($("#player2KDA").html().split("</span> ")[1]);
  $("#player1Kills").css("color", "black");
  $("#player1Kills").html($("#player1Kills").html().split(" ")[0]);
  $("#player2Kills").css("color", "black");
  $("#player2Kills").html($("#player2Kills").html().split(" ")[4]);
  $("#player1Deaths").css("color", "black");
  $("#player1Deaths").html($("#player1Deaths").html().split(" ")[0]);
  $("#player2Deaths").css("color", "black");
  $("#player2Deaths").html($("#player2Deaths").html().split(" ")[4]);
  $("#player1Assists").css("color", "black");
  $("#player1Assists").html($("#player1Assists").html().split(" ")[0]);
  $("#player2Assists").css("color", "black");
  $("#player2Assists").html($("#player2Assists").html().split(" ")[4]);
  $("#player1CS").css("color", "black");
  $("#player1CS").html($("#player1CS").html().split(" ")[0]);
  $("#player2CS").css("color", "black");
  $("#player2CS").html($("#player2CS").html().split(" ")[4]);
}

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
      $('.hr-'+playerNum+'-1').show();
      $('.hr-'+playerNum+'-2').show();
      getPlayerStats(summonerId, playerNum, reg);
      document.getElementById('summoner' + playerNum + 'Rank').innerHTML = tier + " " + division + " - " + lp + " LP";
      document.getElementById('summoner' + playerNum + 'WinRatio').innerHTML = winRate + "% " +
      "<br/>(" + wins + "W " + losses + "L)" ;
      document.getElementById('summoner' + playerNum +'RankIcon').setAttribute("src", rankedIconLocation);
      if (currSumm1 !== undefined && currSumm2 !== undefined &&
        $("#summoner1Rank").html() !== "Unranked" && $("#summoner2Rank").html() !== "Unranked") {
          $('#compare').prop("disabled", false);
        }
      },
      error: function (XMLHttpRequest, textStatus, errorThrown) {
        if (errorThrown === "Not Found") {
          $('#compare').prop("disabled", true);
          $('.hr-'+playerNum+'-1').show();
          document.getElementById('summoner' + playerNum + 'Rank').innerHTML = "Unranked";
          document.getElementById('summoner' + playerNum + 'WinRatio').innerHTML = "n/a";
          document.getElementById('summoner' + playerNum +'RankIcon').setAttribute("src", "./base_icons/provisional.png");
          document.getElementById('player'+playerNum+'KDA').innerHTML = "n/a";
          document.getElementById('player'+playerNum+'Kills').innerHTML = "n/a";
          document.getElementById('player'+playerNum+'Deaths').innerHTML = "n/a";
          document.getElementById('player'+playerNum+'Assists').innerHTML = "n/a";
          document.getElementById('player'+playerNum+'CS').innerHTML = "n/a";
          document.getElementById("player"+playerNum+"MostPlayedChamp").innerHTML = "n/a";
          $("#player"+playerNum+"MostPlayedIcon").hide();
          document.getElementById("player"+playerNum+"MostPlayedRole").innerHTML = "n/a";
        } else if (errorThrown === "Too Many Requests") {
          alert("Too may requests please wait 10 seconds");
          disableSearchButtons();
          setTimeout(enableSearchButtons, 10000);
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
          if (data[key].id == 0) {
            totals = data[key];
            break;
          }
        }
        totals = totals.stats;
        var favChampId = getFavoriteChampionId(data);
        var favChampWR = getFavChampWinRate(data, favChampId);
        var totalKills = totals.totalChampionKills;
        var totalDeaths = totals.totalDeathsPerSession;
        var totalAssists = totals.totalAssists;
        var totalCS = totals.totalMinionKills;
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
        setMostPlayedRole(summonerId, num, reg);
        $("#player"+num+"MostPlayedIcon").show();
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
        document.getElementById("player"+num+"MostPlayedChamp").innerHTML = "n/a";
        $("#player"+num+"MostPlayedIcon").hide();
        document.getElementById("player"+num+"MostPlayedRole").innerHTML = "n/a";
        if (errorThrown === "Too Many Requests") {
          alert("Too may requests please wait 10 seconds");
          disableSearchButtons();
          setTimeout(enableSearchButtons, 10000);
        }
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
        break;
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
        var iconURL = "https://ddragon.leagueoflegends.com/cdn/6.24.1/img/champion/" + champImgName;
        document.getElementById("player"+num+"MostPlayedChamp").innerHTML = champName;
        document.getElementById("player"+num+"MostPlayedIcon").setAttribute("src", iconURL);
      },
      error: function (XMLHttpRequest, textStatus, errorThrown) {
        document.getElementById("player"+num+"MostPlayedChamp").innerHTML = "n/a";
        if (errorThrown === "Too Many Requests") {
          alert("Too may requests please wait 10 seconds");
          disableSearchButtons();
          setTimeout(enableSearchButtons, 10000);
        }
      }
    });
  }

  function setMostPlayedRole(summId, num, reg) {
    $.ajax({
      url: "https://na.api.pvp.net/api/lol/"+reg+"/v2.2/matchlist/by-summoner/"+summId+"?rankedQueues=TEAM_BUILDER_RANKED_SOLO&api_key=" + API_KEY,
      type: 'GET',
      data: {

      },
      success: function(json) {
        var main = getMostPlayedRole(json.matches);
        document.getElementById("player"+num+"MostPlayedRole").innerHTML = main;
      },
      error: function (XMLHttpRequest, textStatus, errorThrown) {
        document.getElementById("player"+num+"MostPlayedRole").innerHTML = "n/a";
        if (errorThrown === "Too Many Requests") {
          alert("Too may requests please wait 10 seconds");
          disableSearchButtons();
          setTimeout(enableSearchButtons, 10000);
        }
      }
    });
  }
  function getMostPlayedRole(matches) {
    var roleCount = {Top: 0, Mid: 0, Jungle: 0, ADC: 0, Support: 0};
    var role;
    for (var m in matches) {
      role = matches[m].lane;
      switch (role) {
        case 'MID':
        roleCount.Mid++;
        break;
        case 'TOP':
        roleCount.Top++;
        break;
        case 'JUNGLE':
        roleCount.Jungle++;
        break;
        case 'BOTTOM':
        if (matches[m].role === "DUO_CARRY")
        roleCount.ADC++;
        else
        roleCount.Support++;
        break;
        default:
        break;
      }
    }

    var maxGames = 0;
    var mainRole;
    for (var key in roleCount) {
      if (roleCount[key] > maxGames) {
        maxGames = roleCount[key];
        mainRole = key;
      }
    }
    return mainRole;
  }

  function compare() {
    compareRank();
    compareStats();
    $('#compare').prop("disabled", true);
  }

  function compareRank() {
    $('.hr-1-1').slideDown();
    $('.hr-2-1').slideDown();
    $('#player1MainInfo').slideDown();
    $('#player2MainInfo').slideDown();
    $('.hr-1-2').show();
    $('.hr-2-2').show();
    $('#player1DetailedInfo').slideDown();
    $('#player2DetailedInfo').slideDown();
    var tierValues = {
      Bronze: 0, Silver: 1, Gold: 2, Platinum: 3, Diamond: 4, Master: 5, Challenger: 6
    }
    var divisionValues = {
      I : 1, II: 2, III:3, IV:4, V: 5
    }
    var player1Rank = $("#summoner1Rank").html().split(" ");
    var player2Rank = $("#summoner2Rank").html().split(" ");
    var player1Tier = player1Rank[0];
    var player2Tier = player2Rank[0];
    if (tierValues[player1Tier] > tierValues[player2Tier]) {
      $("#summoner1Rank").css("color", "#175CC4");
      $("#summoner2Rank").css("color", "red");
    } else if (tierValues[player1Tier] < tierValues[player2Tier]) {
      $("#summoner1Rank").css("color", "red");
      $("#summoner2Rank").css("color", "#175CC4");
    } else {
      var player1Div = player1Rank[1];
      var player2Div = player2Rank[1];
      if (divisionValues[player1Div] < divisionValues[player2Div]) {
        $("#summoner1Rank").css("color", "#175CC4");
        $("#summoner2Rank").css("color", "red");
      } else if (divisionValues[player1Div] > divisionValues[player2Div]) {
        $("#summoner1Rank").css("color", "red");
        $("#summoner2Rank").css("color", "#175CC4");
      } else {
        var player1LP = player1Rank[3];
        var player2LP = player2Rank[3];
        if (player1LP > player2LP) {
          $("#summoner1Rank").css("color", "#175CC4");
          $("#summoner2Rank").css("color", "red");
        } else if (player1LP < player2LP) {
          $("#summoner1Rank").css("color", "red");
          $("#summoner2Rank").css("color", "#175CC4");
        } else {
          $("#summoner1Rank").css("color", "#175CC4");
          $("#summoner2Rank").css("color", "#175CC4");
        }
      }
    }

    var player1WR = $("#summoner1WinRatio").html().split(" ")[0].replace("%", "");
    var player2WR = $("#summoner2WinRatio").html().split(" ")[0].replace("%", "");
    if (parseFloat(player1WR) > parseFloat(player2WR)) {
      $("#summoner1WinRatio").css("color", "#175CC4");
      $("#summoner2WinRatio").css("color", "red");
    } else if (parseFloat(player1WR) < parseFloat(player2WR)) {
      $("#summoner1WinRatio").css("color", "red");
      $("#summoner2WinRatio").css("color", "#175CC4");
    } else {
      $("#summoner1WinRatio").css("color", "#175CC4");
      $("#summoner2WinRatio").css("color", "#175CC4");
    }
  }

  function compareStats() {
    var player1KDA = $("#player1KDA").html().split(" ")[0];
    var player2KDA = $("#player2KDA").html().split(" ")[0];
    var KDAdiff = Math.abs(player1KDA - player2KDA).toFixed(2);
    if (parseFloat(player1KDA) > parseFloat(player2KDA)) {
      $("#player1KDA").css("color", "#175CC4");
      $("#player1KDA").append(" <span style=\"font-size: 18px;\">(+ " + KDAdiff + ")</span>");
      $("#player2KDA").css("color", "red");
      $("#player2KDA").prepend("<span style=\"font-size: 18px;\">(- " + KDAdiff + ")</span> ");
    } else if (parseFloat(player1KDA) < parseFloat(player2KDA)) {
      $("#player1KDA").css("color", "red");
      $("#player1KDA").append(" <span style=\"font-size: 18px;\">(- " + KDAdiff + ")</span>");
      $("#player2KDA").css("color", "#175CC4");
      $("#player2KDA").prepend("<span style=\"font-size: 18px;\">(+ " + KDAdiff + ")</span> ");
    } else {
      $("#player1KDA").css("color", "#175CC4");
      $("#player2KDA").css("color", "#175CC4");
    }

    var player1AvgKills = $("#player1Kills").html();
    var player2AvgKills = $("#player2Kills").html();
    var killDiff = Math.abs(player1AvgKills - player2AvgKills).toFixed(2);
    if (parseFloat(player1AvgKills) > parseFloat(player2AvgKills)) {
      $("#player1Kills").css("color", "#175CC4");
      $("#player1Kills").append(" <span style=\"font-size: 14px;\">(+ " + killDiff + ")</span>");
      $("#player2Kills").css("color", "red");
      $("#player2Kills").prepend("<span style=\"font-size: 14px;\">(- " + killDiff + ")</span> ");
    } else if (parseFloat(player1AvgKills) < parseFloat(player2AvgKills)) {
      $("#player1Kills").css("color", "red");
      $("#player1Kills").append(" <span style=\"font-size: 14px;\">(- " + killDiff + ")</span>");
      $("#player2Kills").css("color", "#175CC4");
      $("#player2Kills").prepend("<span style=\"font-size: 14px;\">(+ " + killDiff + ")</span> ");
    } else {
      $("#player1Kills").css("color", "#175CC4");
      $("#player2Kills").css("color", "#175CC4");
    }

    var player1AvgDeaths = $("#player1Deaths").html();
    var player2AvgDeaths = $("#player2Deaths").html();
    var deathDiff = Math.abs(player1AvgDeaths - player2AvgDeaths).toFixed(2);
    if (parseFloat(player1AvgDeaths) < parseFloat(player2AvgDeaths)) {
      $("#player1Deaths").css("color", "#175CC4");
      $("#player1Deaths").append(" <span style=\"font-size: 14px;\">(- " + deathDiff + ")</span>");
      $("#player2Deaths").css("color", "red");
      $("#player2Deaths").prepend("<span style=\"font-size: 14px;\">(+ " + deathDiff + ")</span> ");
    } else if (parseFloat(player1AvgDeaths) > parseFloat(player2AvgDeaths)) {
      $("#player1Deaths").css("color", "red");
      $("#player1Deaths").append(" <span style=\"font-size: 14px;\">(+ " + deathDiff + ")</span>");
      $("#player2Deaths").css("color", "#175CC4");
      $("#player2Deaths").prepend("<span style=\"font-size: 14px;\">(- " + deathDiff + ")</span> ");
    } else {
      $("#player1Deaths").css("color", "#175CC4");
      $("#player2Deaths").css("color", "#175CC4");
    }

    var player1AvgAssists = $("#player1Assists").html();
    var player2AvgAssists = $("#player2Assists").html();
    var assistDiff = Math.abs(player1AvgAssists - player2AvgAssists).toFixed(2);
    if (parseFloat(player1AvgAssists) > parseFloat(player2AvgAssists)) {
      $("#player1Assists").css("color", "#175CC4");
      $("#player1Assists").append(" <span style=\"font-size: 14px;\">(+ " + assistDiff + ")</span>");
      $("#player2Assists").css("color", "red");
      $("#player2Assists").prepend("<span style=\"font-size: 14px;\">(- " + assistDiff + ")</span> ");
    } else if (parseFloat(player1AvgAssists) < parseFloat(player2AvgAssists)) {
      $("#player1Assists").css("color", "red");
      $("#player1Assists").append(" <span style=\"font-size: 14px;\">(- " + assistDiff + ")</span>");
      $("#player2Assists").css("color", "#175CC4");
      $("#player2Assists").prepend("<span style=\"font-size: 14px;\">(+ " + assistDiff + ")</span> ");
    } else {
      $("#player1Assists").css("color", "#175CC4");
      $("#player2Assists").css("color", "#175CC4");
    }

    var player1AvgCS = $("#player1CS").html();
    var player2AvgCS = $("#player2CS").html();
    var CSDiff = Math.abs(player1AvgCS - player2AvgCS).toFixed(2);
    if (parseFloat(player1AvgCS) > parseFloat(player2AvgCS)) {
      $("#player1CS").css("color", "#175CC4");
      $("#player1CS").append(" <span style=\"font-size: 14px;\">(+ " + CSDiff + ")</span>");
      $("#player2CS").css("color", "red");
      $("#player2CS").prepend("<span style=\"font-size: 14px;\">(- " + CSDiff + ") </span>");
    } else if (parseFloat(player1AvgCS) < parseFloat(player2AvgCS)) {
      $("#player1CS").css("color", "red");
      $("#player1CS").append(" <span style=\"font-size: 14px;\">(- " + CSDiff + ")</span>");
      $("#player2CS").css("color", "#175CC4");
      $("#player2CS").prepend("<span style=\"font-size: 14px;\">(+ " + CSDiff + ") </span>");
    } else {
      $("#player1CS").css("color", "#175CC4");
      $("#player2CS").css("color", "#175CC4");
    }
  }
