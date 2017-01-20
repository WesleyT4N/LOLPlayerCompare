var currSumm1 = undefined;
var currSumm2 = undefined;
var currDate = new Date();
var ONE_DAY = 24 * 60 * 60 * 1000;

$(function() {
    $(".main-info").hide();
    $(".detailed-info").hide();
    $("hr").hide();
    $('#compare').prop("disabled", true);
});

function newSearch(playerNum) {
    $('#player' + playerNum + 'MainInfo').slideUp();
    $('#player' + playerNum + 'DetailedInfo').slideUp();
    $('.hr-' + playerNum + '-1').slideUp();
    $('.hr-' + playerNum + '-2').slideUp();
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

function summonerLookup(playerNum) {
    var SUMMONER_NAME = "";
    var REGION = "";

    if ($("#player" + playerNum + "Region").attr('value') === "") {
        alert("Please pick a region.");
        return;
    } else {
        SUMMONER_NAME = $("#player" + playerNum + "Search").val();
        REGION = $("#player" + playerNum + "Region").attr('value');
    }

    if (SUMMONER_NAME !== "") {
        var SUMMONER_NAME_NO_SPACE = SUMMONER_NAME.replace(' ', '').toLowerCase().trim();
    }
    if (/[,!@#$%^&*()]/.test(SUMMONER_NAME)) {
        alert("Invalid Summoner Name");
        return;
    }

    if (SUMMONER_NAME !== "" && (SUMMONER_NAME_NO_SPACE !== currSumm1 && SUMMONER_NAME_NO_SPACE !== currSumm2)) {
        if (getSummoner(SUMMONER_NAME_NO_SPACE) != null &&
            currDate.getTime() - getSummoner(SUMMONER_NAME_NO_SPACE).lastVisit < ONE_DAY) {
            var summoner = getSummoner(SUMMONER_NAME_NO_SPACE);
            var lv = summoner.lastVisit;
            if (playerNum == 1)
                currSumm1 = SUMMONER_NAME_NO_SPACE;
            else
                currSumm2 = SUMMONER_NAME_NO_SPACE;
            SUMMONER_NAME = summoner.name;
            var summonerId = summoner.id;
            var profileIconNum = summoner.icon;
            REGION = summoner.region;
            $('#player' + playerNum + 'ProfileIcon').attr("src", "https://ddragon.leagueoflegends.com/cdn/6.24.1/img/profileicon/" + profileIconNum + ".png");
            $('#summonerName' + playerNum).html(SUMMONER_NAME);
            // console.log("calling using local storage");
            getSummonerRank(SUMMONER_NAME_NO_SPACE, summonerId, playerNum, REGION);
            resetTextColors();
        } else {
            $.ajax({
                type: "POST",
                url: "apiCall.php",
                dataType: "json",
                data: {
                    'url': 'https://' + REGION + '.api.pvp.net/api/lol/' + REGION + '/v1.4/summoner/by-name/' + SUMMONER_NAME_NO_SPACE + '?api_key='
                },
                success: function(json) {
                    // console.log("php received");
                    // console.log(json);
                    if (json.status !== undefined) {
                        searchError(json)
                        return;
                    }
                    if (playerNum == 1)
                        currSumm1 = SUMMONER_NAME_NO_SPACE;
                    else
                        currSumm2 = SUMMONER_NAME_NO_SPACE;
                    SUMMONER_NAME = json[SUMMONER_NAME_NO_SPACE].name;
                    var summonerId = json[SUMMONER_NAME_NO_SPACE].id;
                    var profileIconNum = json[SUMMONER_NAME_NO_SPACE].profileIconId;
                    $('#player' + playerNum + 'ProfileIcon').attr("src", "https://ddragon.leagueoflegends.com/cdn/6.24.1/img/profileicon/" + profileIconNum + ".png");
                    $('#summonerName' + playerNum).html(SUMMONER_NAME);
                    var date = new Date();
                    var summoner = {
                        search: SUMMONER_NAME_NO_SPACE,
                        name: SUMMONER_NAME,
                        id: summonerId,
                        icon: profileIconNum,
                        region: REGION,
                        lastVisit: date.getTime()
                    };
                    storeSummoner(SUMMONER_NAME_NO_SPACE, summoner);
                    $('.hr-1-2').hide();
                    $('.hr-2-2').hide();
                    $('#player1DetailedInfo').slideUp();
                    $('#player2DetailedInfo').slideUp();
                    getSummonerRank(SUMMONER_NAME_NO_SPACE, summonerId, playerNum, REGION);
                    resetTextColors();
                },
                error: function(XMLHttpRequest, textStatus, errorThrown) {
                    alert("Something went wrong when accessing server.");
                }
            });
        }
    } else {
        return;
    }
}

function searchError(data) {
    if (data.status.status_code == 404)
        notFound();
    else if (data.status.status_code == 429)
        tooManyRequests();
    return;
}


function tooManyRequests() {
    alert("Too may requests please wait 10 seconds");
    disableSearchButtons();
    setTimeout(enableSearchButtons, 10000);
}

function notFound() {
    alert("Info Not Found");
}



function storeSummoner(key, value) {
    if (typeof value === "object")
        value = JSON.stringify(value);
    localStorage.setItem(key, value);
}

function getSummoner(key) {
    var value = localStorage.getItem(key);
    if (!value)
        return null;
    if (value[0] === "{")
        value = JSON.parse(value);
    return value;
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

function getSummonerRank(name, summonerId, playerNum, reg) {
    $('#player' + playerNum + 'MainInfo').slideDown();
    $('.hr-' + playerNum + '-2').hide();
    $('#player' + playerNum + 'DetailedInfo').hide();

    if (currDate.getTime() - getSummoner(name).lastVisit < ONE_DAY && getSummoner(name).tier !== undefined) {
        // console.log("getting ranked data from storage");
        var summoner = getSummoner(name);
        var tier = summoner.tier;
        var division = summoner.division;
        var lp = summoner.lp;
        var wins = summoner.wins;
        var losses = summoner.losses;
        var winRate = summoner.winRate;
        var rankedIconLocation = summoner.rankedIcon;
        $('#summoner' + playerNum + 'Rank').html(tier + " " + division + " - " + lp + " LP");
        $('#summoner' + playerNum + 'WinRatio').html(winRate + "% " + "<br/>(" + wins + "W " + losses + "L)");
        $('#summoner' + playerNum + 'RankIcon').attr("src", rankedIconLocation);
        if (currSumm1 !== undefined && currSumm2 !== undefined &&
            $("#summoner1Rank").html() !== "Unranked" && $("#summoner2Rank").html() !== "Unranked") {
            $('#compare').prop("disabled", false);
        }
        getPlayerStats(name, summonerId, playerNum, reg);
    } else {
        $.ajax({
            type: "POST",
            url: "apiCall.php",
            dataType: "json",
            data: {
                'url': "https://" + reg + ".api.pvp.net/api/lol/" + reg + "/v2.5/league/by-summoner/" + summonerId + "/entry/" + "?api_key="
            },
            success: function(json) {
                // console.log(json);
                if (json.status !== undefined) {
                    rankedError(playerNum, json);
                    return;
                }
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
                var summoner = getSummoner(name);
                summoner.tier = tier;
                summoner.division = division;
                summoner.lp = lp;
                summoner.wins = wins;
                summoner.losses = losses;
                summoner.winRate = winRate;
                summoner.rankedIcon = rankedIconLocation;
                storeSummoner(name, summoner);
                // console.log("stored");
                $('#summoner' + playerNum + 'Rank').html(tier + " " + division + " - " + lp + " LP");
                $('#summoner' + playerNum + 'WinRatio').html(winRate + "% " + "<br/>(" + wins + "W " + losses + "L)");
                $('#summoner' + playerNum + 'RankIcon').attr("src", rankedIconLocation);
                if (currSumm1 !== undefined && currSumm2 !== undefined &&
                    $("#summoner1Rank").html() !== "Unranked" && $("#summoner2Rank").html() !== "Unranked") {
                    $('#compare').prop("disabled", false);
                }
                getPlayerStats(name, summonerId, playerNum, reg);
            },
            error: function(XMLHttpRequest, textStatus, errorThrown) {
                alert("Something went wrong when accessing php server.");
            }
        });
    }
}

function rankedError(playerNum, data) {
    $('#compare').prop("disabled", true);
    $('.hr-' + playerNum + '-1').show();
    $('#summoner' + playerNum + 'Rank').html("Unranked");
    $('#summoner' + playerNum + 'WinRatio').html("n/a");
    $('#summoner' + playerNum + 'RankIcon').attr("src", "./base_icons/provisional.png");
    if (data.status.status_code == 429)
        tooManyRequests();
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

function getPlayerStats(name, summonerId, num, reg) {
    $('.hr-' + num + '-1').show();
    if (currDate.getTime() - getSummoner(name).lastVisit < ONE_DAY && getSummoner(name).kda !== undefined) {
        // console.log("Getting player data from storage");
        var summoner = getSummoner(name);
        var favChampId = summoner.favChampId;
        var favChampWR = summoner.favChampWR;
        var kda = summoner.kda;
        var avgKills = summoner.avgKills;
        var avgDeaths = summoner.avgDeaths;
        var avgAssists = summoner.avgAssists;
        var avgCS = summoner.avgCS;
        $('#player' + num + 'KDA').html(kda);
        $('#player' + num + 'Kills').html(avgKills);
        $('#player' + num + 'Deaths').html(avgDeaths);
        $('#player' + num + 'Assists').html(avgAssists);
        $('#player' + num + 'CS').html(avgCS);
        setFavChampion(name, favChampId, num, reg);
        setMostPlayedRole(name, summonerId, num, reg);
        $("#player" + num + "MostPlayedWR").html(favChampWR);
    } else {
        $.ajax({
            type: "POST",
            url: "apiCall.php",
            dataType: "json",
            data: {
                'url': "https://" + reg + ".api.pvp.net/api/lol/" + reg + "/v1.3/stats/by-summoner/" + summonerId + "/ranked?api_key="
            },
            success: function(json) {
                // console.log(json);
                if (json.status !== undefined) {
                    statsError(num, json);
                    return;
                }
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
                var avgAssists = totalAssists / totalGames;
                avgAssists = avgAssists.toFixed(2);
                var avgCS = totalCS / totalGames;
                avgCS = avgCS.toFixed(2);
                var summoner = getSummoner(name);
                // console.log("storing new player stats");
                summoner.favChampId = favChampId;
                summoner.favChampWR = favChampWR;
                summoner.kda = kda;
                summoner.avgKills = avgKills;
                summoner.avgDeaths = avgDeaths;
                summoner.avgAssists = avgAssists;
                summoner.avgCS = avgCS;
                storeSummoner(name, summoner);
                $('#player' + num + 'KDA').html(kda);
                $('#player' + num + 'Kills').html(avgKills);
                $('#player' + num + 'Deaths').html(avgDeaths);
                $('#player' + num + 'Assists').html(avgAssists);
                $('#player' + num + 'CS').html(avgCS);
                setFavChampion(name, favChampId, num, reg);
                setMostPlayedRole(name, summonerId, num, reg);
                $("#player" + num + "MostPlayedWR").html(favChampWR);
            },
            error: function(XMLHttpRequest, textStatus, errorThrown) {
                alert("Something went wrong when accessing php server");
            }
        });
    }
}

function statsError(num, data) {
    $('#player' + num + 'KDA').html("n/a");
    $('#player' + num + 'Kills').html("n/a");
    $('#player' + num + 'Deaths').html("n/a");
    $('#player' + num + 'Assists').html("n/a");
    $('#player' + num + 'CS').html("n/a");
    $("#player" + num + "MostPlayedWR").html("n/a");
    $("#player" + num + "MostPlayedIcon").hide();
    $("#player" + num + "MostPlayedRole").html("n/a");
    if (data.status.status_code == 429)
        tooManyRequests();
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
    var winRate = (totalWins / totalGames * 100).toFixed(2);
    return winRate + "%";
}

function setFavChampion(name, id, num, reg) {

    if (currDate.getTime() - getSummoner(name).lastVisit < ONE_DAY && getSummoner(name).champName !== undefined) {
        // console.log("getting favorite champion from storage");
        var summoner = getSummoner(name);
        var champName = summoner.champName;
        var iconURL = summoner.iconURL;
        $("#player" + num + "MostPlayedChamp").html(champName);
        $("#player" + num + "MostPlayedIcon").attr("src", iconURL);
        $("#player" + num + "MostPlayedIcon").show();
    } else {
        $.ajax({
            type: "POST",
            url: "apiCall.php",
            dataType: "json",
            data: {
                'url': "https://global.api.pvp.net/api/lol/static-data/" + reg + "/v1.2/champion/" + id + "?champData=image&api_key="
            },
            success: function(json) {
                // console.log(json);
                if (json.status !== undefined) {
                    favChampError(num, json);
                    return;
                }
                var champName = json.name;
                var champImgName = json.image.full;
                var iconURL = "https://ddragon.leagueoflegends.com/cdn/6.24.1/img/champion/" + champImgName;
                var summoner = getSummoner(name);
                summoner.champName = champName;
                summoner.iconURL = iconURL;
                storeSummoner(name, summoner);
                // console.log("storing favorite champion");
                $("#player" + num + "MostPlayedChamp").html(champName);
                $("#player" + num + "MostPlayedIcon").attr("src", iconURL);
                $("#player" + num + "MostPlayedIcon").show();
            },
            error: function(XMLHttpRequest, textStatus, errorThrown) {
                alert("Something went wrong when accessing php server");
            }
        });
    }
}

function favChampError(num, data) {
    $("#player" + num + "MostPlayedChamp").html("n/a");
    if (data.status.status_code == 429)
        tooManyRequests();
}

function setMostPlayedRole(name, summId, num, reg) {
    if (currDate.getTime() - getSummoner(name).lastVisit < ONE_DAY && getSummoner(name).main !== undefined) {
        // console.log("getting most played role from storage");
        var summoner = getSummoner(name);
        var main = summoner.main;
        $("#player" + num + "MostPlayedRole").html(main);
    } else {
        $.ajax({
            type: "POST",
            url: "apiCall.php",
            dataType: "json",
            data: {
                'url': "https://" + reg + ".api.pvp.net/api/lol/" + reg + "/v2.2/matchlist/by-summoner/" + summId + "?rankedQueues=TEAM_BUILDER_RANKED_SOLO&api_key="
            },
            success: function(json) {
                // console.log(json);
                if (json.status !== undefined) {
                    mostPlayedRoleError(num, json);
                    return;
                }
                var main = getMostPlayedRole(json.matches);
                var summoner = getSummoner(name);
                summoner.main = main;
                // console.log("Storing main role");
                storeSummoner(name, summoner);
                $("#player" + num + "MostPlayedRole").html(main);
            },
            error: function(XMLHttpRequest, textStatus, errorThrown) {
                alert("Something went wrong when accessing php server.");
            }
        });
    }
}

function mostPlayedRoleError(num, data) {
    $("#player" + num + "MostPlayedRole").html("n/a");
    if (data.status.status_code == 429)
        tooManyRequests();
}

function getMostPlayedRole(matches) {
    var roleCount = {
        Top: 0,
        Mid: 0,
        Jungle: 0,
        ADC: 0,
        Support: 0
    };
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
        Bronze: 0,
        Silver: 1,
        Gold: 2,
        Platinum: 3,
        Diamond: 4,
        Master: 5,
        Challenger: 6
    }
    var divisionValues = {
        I: 1,
        II: 2,
        III: 3,
        IV: 4,
        V: 5
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
