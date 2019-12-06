// Hash any string into an integer value
// Then we'll use the int and convert to hex.
function hashCode(str) {
  var hash = 0;
  for (var i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash;
}

// Convert an int to hexadecimal with a max length
// of six characters.
function intToARGB(i) {
  var hex = ((i >> 24) & 0xFF).toString(16) +
    ((i >> 16) & 0xFF).toString(16) +
    ((i >> 8) & 0xFF).toString(16) +
    (i & 0xFF).toString(16);
  // Sometimes the string returned will be too short so we 
  // add zeros to pad it out, which later get removed if
  // the length is greater than six.
  hex += '000000';
  return hex.substring(0, 6);
}

// Extend the string type to allow converting to hex for quick access.
String.prototype.toHexColour = function () {
  return intToARGB(hashCode(this));
}
$(document).ready(function () {
  $graph = $('#graph')
  $graphContainer = $graph.find('.graph-container')
  $graphMin = $graph.find('.graph-min')
  $graphMax = $graph.find('.graph-max')
  const createTeam = function (team) {
    return `<div id="team-${team.id}" data-points="0" class="team" style="background: #${team.name.toHexColour()}; top: calc(60px * ${team.id - 1}); width: 200px;">${team.name}</div>`;
  }

  const createGraph = function (table) {
    let html = '';
    for (const i in table) {
      html += createTeam(table[i])
    }
    $graphContainer.html(html)
  }

  const updateTeam = function (team, percentage) {
    $team = $(`#team-${team.id}`)
    $team.attr('data-points', team.totalPoints)
    $team.css({
      'background': `#${team.name.toHexColour()}`,
      'top': `${((team.position - 1) * 60)}px`,
      'width': `${percentage}%`
    })
  }

  const updateGraph = function (table, min, max, gameweek) {
    $graph.attr('data-gameweek', gameweek);
    $graphMin.html(min);
    $graphMax.html(max);
    const range = max - min;
    for (const i in table) {
      const percentage = ((table[i].totalPoints - min) / (range)) * 100;
      updateTeam(table[i], percentage)
    }
  }
  const updateLoop = function (gameweeks, index) {
    setTimeout(function () {
      const { table, minLeaguePoints, maxLeaguePoints, gameweek } = gameweeks[index];
      const min = Math.floor(minLeaguePoints / 10) * 10;
      const max = maxLeaguePoints + 3;//Math.ceil(maxLeaguePoints / 10) * 10;
      updateGraph(table, min, max, gameweek)
      index++
      if (gameweeks.length > index)
        updateLoop(gameweeks, index)
    }, 2000)
  }

  $.get('/api/gameweeks/tables', function (response) {
    createGraph(response[0].table)

    $('a.start').bind('click', function () {
      updateLoop(response, 0)
    })
  })
});