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
  $graphContainer = $('#graph')
  const createTeam = function (team) {
    return `<div id="team-${team.id}" class="team" style="background: #${team.name.toHexColour()}; top: calc(60px * ${team.id}); width: 200px;">${team.name}</div>`;
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
    $team.css({
      'background': `#${team.name.toHexColour()}`,
      'top': `${((team.position - 1) * 60)}px`,
      'width': `${percentage}%`
    })
  }

  const updateGraph = function (table, min, max, gameweek) {
    $graphContainer.attr('data-gameweek', gameweek);
    for (const i in table) {
      const percentage = ((table[i].fplPoints - min) / (max - min)) * 100;
      console.log(gameweek, table[i].fplPoints, min, max, percentage)
      updateTeam(table[i], percentage)
    }
  }
  const updateLoop = function (gameweeks, index) {
    setTimeout(function () {
      const { table, minPoints, maxPoints, gameweek } = gameweeks[index];
      const min = Math.floor(minPoints / 100) * 100;
      const max = Math.ceil(maxPoints / 50) * 50;
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