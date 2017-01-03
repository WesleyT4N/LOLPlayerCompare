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

// var APIKEY = "RGAPI-217a0491-95a0-4107-9d45-93ac21a49b94";
// function summonerLookup(region, summonerName, playerNum) {
//   var SUMMONER_NAME = "";
//   SUMMONER_NAME = summonerName;
//
//   var REGION = "";
//   REGION = region;
//   if (SUMMONER_NAME !== "") {
//     $.ajax({
//       url: 'https://na.api.pvp.net/api/lol/'+ REGION + '/v1.4/summoner/by-name/' + SUMMONER_NAME + '?api_key=' + API_KEY,
//       type: 'GET',
//       data {
//
//       },
//       success: function (json) {
//         var SUMMONER_NAME_NO_SPACE = SUMMONER_NAME.replace(' ','');
//         SUMMONER_NAME_NO_SPACE = SUMMONER_NAME_NO_SPACE.toLowerCase().trim();
//
//         document.getElementById('summonerName' + playerNum).innerHTML = SUMMONER_NAME;
//       }
//       error: function(XMLHttpRequest, textStatus, errorThrown) {
//         alert("error getting Summoner data!");
//       }
//     })
//   } else {}
// }
