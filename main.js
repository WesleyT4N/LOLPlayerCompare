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

$player1MainInfo = $('#player1MainInfo');
$player2MainInfo =  $('#player2MainInfo');
$player1DetailedInfo = $('#player1DetailedInfo');
$player2DetailedInfo = $('#player2DetailedInfo');
$player1hr1 = $('.hr-1-1');
$player2hr1 = $('.hr-2-1');
$player1hr2 = $('.hr-1-2');
$player2hr2 =  $('.hr-2-2');
function newSearch(playerNum) {
    var mainInfo, detailedInfo, hr1, hr2;
    if (playerNum == 1) {
        mainInfo = $player1MainInfo;
        detailedInfo = $player1DetailedInfo;
        hr1 = $player1hr1;
        hr2 = $player1hr2;
    } else {
        mainInfo = $player2MainInfo;
        detailedInfo = $player2DetailedInfo;
        hr1 = $player2hr1;
        hr2 = $player2hr2;
    }
    mainInfo.slideUp();
    detailedInfo.slideUp();
    hr1.slideUp();
    hr2.slideUp();
}

$searchBtn1 = $("#search1");
$searchBtn2 = $("#search2");
function disableSearchButtons() {
    $searchBtn1.prop("disabled", true);
    $searchBtn2.prop("disabled", true)
}

function enableSearchButtons() {
    $searchBtn1.prop("disabled", false);
    $searchBtn2.prop("disabled", false);
}

function showDefaultImg() {
    var defaultImgURL = "https://ddragon.leagueoflegends.com/cdn/6.24.1/img/profileicon/0.png";
    if (this.src != defaultImgURL) {
        this.src = defaultImgURL;
        console.log("switching");
    }
}

function setRegion(regionVal, selectorId) {
    var val = $(regionVal).attr("value");
    var regionName = $(regionVal).attr("name");
    $(selectorId).text(regionName);
    $(selectorId).attr("value", val);
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
            var summonerId = summoner.summonerId;
            var accId = summoner.accountId;
            var profileIconNum = summoner.icon;
            REGION = summoner.region;
            $('#player' + playerNum + 'ProfileIcon').attr("src", "https://ddragon.leagueoflegends.com/cdn/6.24.1/img/profileicon/" + profileIconNum + ".png");
            $('#summonerName' + playerNum).html(SUMMONER_NAME);
            console.log("calling using local storage");
            getSummonerRank(SUMMONER_NAME_NO_SPACE, summonerId, accId, playerNum, REGION);
        } else {
            $.ajax({
                type: "POST",
                url: "apiCall.php",
                dataType: "json",
                data: {
                    'url': 'https://' + REGION + '.api.riotgames.com/lol/summoner/v3/summoners/by-name/' + SUMMONER_NAME_NO_SPACE + '?api_key='
                },
                success: function(json) {
                    console.log("api call made");
                    if (json.status !== undefined) {
                        searchError(json)
                        return;
                    }
                    if (playerNum == 1)
                        currSumm1 = SUMMONER_NAME_NO_SPACE;
                    else
                        currSumm2 = SUMMONER_NAME_NO_SPACE;
                    SUMMONER_NAME = json.name;
                    var summonerId = json.id;
                    var accId = json.accountId;
                    var profileIconNum = json.profileIconId;
                    $('#player' + playerNum + 'ProfileIcon').attr("src", "https://ddragon.leagueoflegends.com/cdn/6.24.1/img/profileicon/" + profileIconNum + ".png");
                    $('#summonerName' + playerNum).html(SUMMONER_NAME);
                    var date = new Date();
                    var summoner = {
                        search: SUMMONER_NAME_NO_SPACE,
                        name: SUMMONER_NAME,
                        summonerid: summonerId,
                        accountId: accId,
                        icon: profileIconNum,
                        region: REGION,
                        lastVisit: date.getTime()
                    };
                    storeSummoner(SUMMONER_NAME_NO_SPACE, summoner);
                    getSummonerRank(SUMMONER_NAME_NO_SPACE, summonerId, accId, playerNum, REGION);
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
    $summoner1Rank = $("#summoner1Rank");
    $summoner2Rank = $("#summoner2Rank");
    $summoner1WR = $("#summoner1WinRatio");
    $summoner2WR = $("#summoner2WinRatio");
    $summoner1KDA = $("#player1KDA");
    $summoner2KDA = $("#player2KDA");
    $summoner1Kills = $("#player1Kills");
    $summoner2Kills = $("#player2Kills");
    $summoner1Deaths = $("#player1Deaths");
    $summoner2Deaths = $("#player2Deaths");
    $summoner1Assists = $("#player1Assists");
    $summoner2Assists = $("#player2Assists");
    $summoner1CS = $("#player1CS");
    $summoner2CS = $("#player2CS");

    $summoner1Rank.css("color", "black");
    $summoner2Rank.css("color", "black");
    $summoner1WR.css("color", "black");
    $summoner2WR.css("color", "black");
    $summoner1KDA.css("color", "black");
    $summoner1KDA.html($summoner1KDA.html().split(" <")[0]);
    $summoner2KDA.css("color", "black");
    $summoner2KDA.html($summoner2KDA.html().split("</span> ")[1]);
    $summoner1Kills.css("color", "black");
    $summoner1Kills.html($summoner1Kills.html().split(" ")[0]);
    $summoner2Kills.css("color", "black");
    $summoner2Kills.html($summoner2Kills.html().split(" ")[4]);
    $summoner1Deaths.css("color", "black");
    $summoner1Deaths.html($summoner1Deaths.html().split(" ")[0]);
    $summoner2Deaths.css("color", "black");
    $summoner2Deaths.html($summoner2Deaths.html().split(" ")[4]);
    $summoner1Assists.css("color", "black");
    $summoner1Assists.html($summoner1Assists.html().split(" ")[0]);
    $summoner2Assists.css("color", "black");
    $summoner2Assists.html($summoner2Assists.html().split(" ")[4]);
    $summoner1CS.css("color", "black");
    $summoner1CS.html($summoner1CS.html().split(" ")[0]);
    $summoner2CS.css("color", "black");
    $summoner2CS.html($summoner2CS.html().split(" ")[4]);
}

function getSummonerRank(name, summonerId, accountId, playerNum, reg) {
    resetTextColors();
    
    $('.hr-' + playerNum + '-1').show();
    $('#player' + playerNum + 'MainInfo').slideDown();
    $('#player1DetailedInfo').slideUp();
    $('#player2DetailedInfo').slideUp();
    $('.hr-' + playerNum + '-2').show();
    if (currDate.getTime() - getSummoner(name).lastVisit < ONE_DAY && getSummoner(name).tier !== undefined) {
        console.log("getting ranked data from storage");
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
        getPlayerStats(name, summonerId, accountId, playerNum, reg);
    } else {
        $.ajax({
            type: "POST",
            url: "apiCall.php",
            dataType: "json",
            data: {
                'url': "https://" + reg + ".api.riotgames.com/lol/league/v3/positions/by-summoner/" + summonerId + "?api_key="
            },
            success: function(json) {
                console.log("api call made");

                if (json.status !== undefined) {
                    rankedError(playerNum, json);
                    return;
                }
                var tier = json[0].tier;
                tier = tier.toLowerCase().split('')
                tier[0] = tier[0].toUpperCase();
                tier = tier.join('');
                if (tier === "Master" || tier === "Challenger")
                    var division = "";
                else
                    var division = json[0].rank;
                var lp = json[0].leaguePoints;
                var wins = json[0].wins;
                var losses = json[0].losses
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
                $('#summoner' + playerNum + 'Rank').html(tier + " " + division + " - " + lp + " LP");
                $('#summoner' + playerNum + 'WinRatio').html(winRate + "% " + "<br/>(" + wins + "W " + losses + "L)");
                $('#summoner' + playerNum + 'RankIcon').attr("src", rankedIconLocation);
                if (currSumm1 !== undefined && currSumm2 !== undefined &&
                    $("#summoner1Rank").html() !== "Unranked" && $("#summoner2Rank").html() !== "Unranked") {
                    $('#compare').prop("disabled", false);
                }
                getPlayerStats(name, summonerId, accountId, playerNum, reg);
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

function getPlayerStats(name, summonerId, accId, num, reg) {
    if (currDate.getTime() - getSummoner(name).lastVisit < ONE_DAY && getSummoner(name).kda !== undefined) {
        console.log("Getting player data from storage");
        var summoner = getSummoner(name);
        var favChampId = summoner.favChampId;
        var favChampWR = summoner.favChampWR;
        var kda = summoner.kda;
        var avgKills = summoner.avgKills;
        var avgDeaths = summoner.avgDeaths;
        var avgAssists = summoner.avgAssists;
        var avgCS = summoner.avgCS;
        var mainRole = summoner.main;
        $('#player' + num + 'KDA').html(kda);
        $('#player' + num + 'Kills').html(avgKills);
        $('#player' + num + 'Deaths').html(avgDeaths);
        $('#player' + num + 'Assists').html(avgAssists);
        $('#player' + num + 'CS').html(avgCS);
        $("#player" + num + "MostPlayedWR").html(favChampWR);
        $("#player" + num + "MostPlayedRole").html(mainRole);
        setFavChampion(name, favChampId, num, reg);
    } else {
        $.ajax({
            type: "POST",
            url: "apiCall.php",
            dataType: "json",
            data: {
                'url': "https://" + reg + ".api.riotgames.com/lol/match/v3/matchlists/by-account/" + accId + "?queue=420&season=9&api_key="
            },
            success: function(json) {
                console.log("api call made");
                if (json.status !== undefined) {
                    statsError(num, json);
                    return;
                }
                var statCounter = {
                    kills: 0,
                    deaths: 0,
                    assists: 0,
                    cs: 0,
                    games: 0
                }
                var champCounter = {};
                var favChampRecord = {
                    wins: 0,
                    totalGames: 0
                };
                var matches = json.matches;

                for (var i = 0; i < matches.length; i++) {
                    var champion = matches[i].champion;
                    if (champCounter.hasOwnProperty(champion)) {
                        champCounter[champion] += 1;
                    } else {
                        champCounter[champion] = 1;
                    }
                }
                var favChampId = 0;
                var max = 0;
                for (var champId in champCounter) {
                    if (champCounter.hasOwnProperty(champId)) {
                        var count = champCounter[champId];
                        if (count > max) {
                            max = count;
                            favChampId = champId;
                        }
                    }
                }
                var matchCount = [];
                for (var i = 0; i < 5; i++) {
                    var matchData = getMatchData(matches[i].gameId, accId, reg);
                    matchData.done(function(json) {
                        var matchTotals = handleData(json, accId);
                        statCounter.kills += matchTotals.kills;
                        statCounter.deaths += matchTotals.deaths;
                        statCounter.assists += matchTotals.assists;
                        statCounter.cs += matchTotals.cs;
                        if (matchTotals.champion == favChampId) {
                            if (matchTotals.win === true) {
                                favChampRecord.wins++;
                            }
                            favChampRecord.totalGames++;
                        }
                        statCounter.games++;
                    });
                    matchCount.push(matchData);
                }

                $.when.apply($, matchCount)
                    .done(function() {
                        var avgKills = (statCounter.kills / statCounter.games).toFixed(1);
                        var avgDeaths = (statCounter.deaths / statCounter.games).toFixed(1);
                        var avgAssists = (statCounter.assists / statCounter.games).toFixed(1);
                        var avgCS = (statCounter.cs / statCounter.games).toFixed(1);
                        var kda = ((statCounter.kills + statCounter.assists) / statCounter.deaths).toFixed(2) + " : 1";

                        var favChampWR = (favChampRecord.wins / favChampRecord.totalGames).toFixed(1) * 100 + "%";
                        var summoner = getSummoner(name);
                        var mainRole = getMostPlayedRole(matches);
                        summoner.kda = kda;
                        summoner.avgKills = avgKills;
                        summoner.avgDeaths = avgDeaths;
                        summoner.avgAssists = avgAssists;
                        summoner.avgCS = avgCS;
                        summoner.main = mainRole;
                        summoner.favChampWR = favChampWR;
                        storeSummoner(name, summoner);
                        setFavChampion(name, favChampId, num, reg);
                        $('#player' + num + 'KDA').html(kda);
                        $('#player' + num + 'Kills').html(avgKills);
                        $('#player' + num + 'Deaths').html(avgDeaths);
                        $('#player' + num + 'Assists').html(avgAssists);
                        $('#player' + num + 'CS').html(avgCS);
                        $("#player" + num + "MostPlayedWR").html(favChampWR);
                        $("#player" + num + "MostPlayedRole").html(mainRole);
                    }).fail(function() {
                        alert("Match fetch error");
                    });
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

function getMatchData(matchId, accId, reg) {
    console.log("api call made");
    return $.ajax({
        type: "POST",
        url: "apiCall.php",
        dataType: "json",
        data: {
            'url': "https://" + reg + ".api.riotgames.com/lol/match/v3/matches/" + matchId + "?api_key="
        }
    });
}

function handleData(json, accId) {
    var playerId;
    json.participantIdentities.forEach(function(participant) {
        if (participant.player.accountId == accId) {
            playerId = participant.participantId;
        }
    });
    var data = json.participants[playerId - 1].stats;
    var kills = data.kills;
    var assists = data.assists;
    var deaths = data.deaths;
    var cs = data.totalMinionsKilled + data.neutralMinionsKilled + data.wardsKilled;
    var champion = json.participants[playerId - 1].championId;
    var win = data.win;
    var totals = {
        kills,
        assists,
        deaths,
        cs,
        champion,
        win
    }
    return totals;
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

function setFavChampion(name, id, num, reg) {

    if (currDate.getTime() - getSummoner(name).lastVisit < ONE_DAY && getSummoner(name).champName !== undefined) {
        console.log("getting favorite champion from storage");
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
                'url': "https://" + reg + ".api.riotgames.com/lol/static-data/v3/champions/" + id + "?locale=en_US&tags=image&api_key="
            },
            success: function(json) {
                console.log("api call made");
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
    matches.forEach(function(m) {
        role = m.lane;
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
                if (m.role === "DUO_CARRY")
                    roleCount.ADC++;
                else
                    roleCount.Support++;
                break;
            default:
                break;
        }
    });

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