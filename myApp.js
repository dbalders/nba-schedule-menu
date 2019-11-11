const { app, Menu, Tray } = require('electron');
const shell = require('electron').shell
const path = require('path');
var fs = require('fs');

const { menubar } = require('menubar');

const iconPath = path.join('basketball.png');

app.on('ready', () => {
  const tray = new Tray(iconPath);
  
  var gamesArray = new Array();
  var menuItems = new Array();

  const nbaJson = JSON.parse(fs.readFileSync('./nba.json', 'utf8'));
  const todayTimeTv = nbaJson.resultSets[0].rowSet;
  const todayTeamInfo = nbaJson.resultSets[1].rowSet;

  for (var i = 0; i < todayTimeTv.length; i++) {
      var teamIdsArray = new Array();
      teamIdsArray.push(todayTimeTv[i][6]);
      teamIdsArray.push(todayTimeTv[i][7]);

      gamesArray.push({
          teamIds: teamIdsArray,
          gameTime: todayTimeTv[i][4],
          gameId: todayTimeTv[i][2],
          channel: todayTimeTv[i][11]
      })
  }


  for (var i = 0; i < gamesArray.length; i++) {
    menuItems.push({
        label: gamesArray[i].gameId,
        type: 'normal'
    })
  }

  //So, this is working, but the problem is that its just a list and looks terrible. Need to make it dynamic html to look nice.
  //https://github.com/maxogden/menubar
  //Prob using the BrowserWindow and appending to an innerhtml UL with all the stuff and css
  //Also need to hook into the nba stats api

  const contextMenu = Menu.buildFromTemplate(menuItems);
  tray.setContextMenu(contextMenu);

//   new MenuItem

  const mb = menubar({
    tray
  });

  mb.on('ready', () => {
    console.log('Menubar app is ready.');
    // your app code here
  });
});