const {
    ipcRenderer,
    shell
} = require('electron');
const con = require('electron').remote.getGlobal('console');
var remote = require('electron').remote;
const fs = require('fs');

const getData = () => {

    var gamesArray = new Array();
    var menuItems = new Array();

    const nbaJson = JSON.parse(fs.readFileSync('./nba.json', 'utf8'));
    const todayTimeTv = nbaJson.resultSets[0].rowSet;
    const todayTeamInfo = nbaJson.resultSets[1].rowSet;

    for (var i = 0; i < todayTimeTv.length; i++) {
        var homeTeamId = todayTimeTv[i][6];
        var awayTeamId = todayTimeTv[i][7];
        var homeTeamName;
        var awayTeamName;
        var homeTeamRecord;
        var awayTeamRecord;


        for (var j = 0; j < todayTeamInfo.length; j++) {
            var loopedTeamId = todayTeamInfo[j][3]

            if (loopedTeamId === homeTeamId) {
                homeTeamName = todayTeamInfo[j][4];
                homeTeamRecord = todayTeamInfo[j][7];
            }

            if (loopedTeamId === awayTeamId) {
                awayTeamName = todayTeamInfo[j][4];
                awayTeamRecord = todayTeamInfo[j][7]
            }
        }

        //find the teams name and record here by searching through the todayTeamInfo array

        gamesArray.push({
            homeTeamId: homeTeamId,
            homeTeamName: homeTeamName,
            homeTeamRecord: homeTeamRecord,
            awayTeamId: awayTeamId,
            awayTeamName: awayTeamName,
            awayTeamRecord: awayTeamRecord,
            gameTime: todayTimeTv[i][4],
            gameId: todayTimeTv[i][2],
            channel: todayTimeTv[i][11],
            gameURL: 'https://stats.nba.com/game/' + todayTimeTv[i][2]
        })
    }

    const gamesList = document.getElementById('games-container');
    var gameItems = "";

    for (var i = 0; i < gamesArray.length; i++) {
        var gameURL = gamesArray[i].gameURL;
        var channel = gamesArray[i].channel;
        if (channel === null) {
            channel = "";
        }

        gameItems +=
            `<div class="game-container flex" data-game-id="${gamesArray[i].gameId}">
                <div class="game flex">
                    <div class="team-names flex-vertical">
                        <div class="team-name">${gamesArray[i].homeTeamName}</div>
                        <div class="team-name">${gamesArray[i].awayTeamName}</div>
                    </div>
                    <div class="game-info">
                        <div class="game-time">${gamesArray[i].gameTime}</div>
                        <div class="game-channel">${channel}</div>
                    </div>
                </div>
            </div>`
    }

    gamesList.innerHTML = gameItems

    win = remote.getCurrentWindow();
    var currentWindow = win.getSize();
    var contentHeight = gamesList.offsetHeight;
    win.setSize(currentWindow[0], contentHeight);

    const gameLinks = document.getElementsByClassName('game-container');

    for (var i = 0; i < gameLinks.length; i++) {
        gameLinks[i].onclick = function() {
            var gameId = this.getAttribute('data-game-id')
            shell.openExternal('https://stats.nba.com/game/' + gameId)
        }
    }
}

document.addEventListener('DOMContentLoaded', getData);