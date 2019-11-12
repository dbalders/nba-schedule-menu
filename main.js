const { app, BrowserWindow, ipcMain, Tray } = require('electron');
const fetch = require('electron-fetch')
const path = require('path');
const fs = require('fs')
var schedule = require('node-schedule');
require('update-electron-app')()

//setup auto launch
//test auto update

let tray = undefined
let window = undefined

// Don't show the app in the doc
app.dock.hide()

app.on('ready', () => {
    nbaAPI()
    schedule.scheduleJob('*/10 * * * *', function () {
        nbaAPI()
    });
})

const createTray = () => {
    tray = new Tray(path.join('basketball.png'))
    tray.on('click', function (event) {
        toggleWindow()
    });
}

const getWindowPosition = () => {
    const windowBounds = window.getBounds();
    const trayBounds = tray.getBounds();

    // Center window horizontally below the tray icon
    const x = Math.round(trayBounds.x + (trayBounds.width / 2) - (windowBounds.width / 2));

    // Position window 4 pixels vertically below the tray icon
    const y = Math.round(trayBounds.y + trayBounds.height + 4);

    return { x: x, y: y };
}

const createWindow = () => {
    window = new BrowserWindow({
        width: 250,
        height: 450,
        show: false,
        frame: false,
        fullscreenable: false,
        resizable: true,
        transparent: false,
        webPreferences: {
            backgroundThrottling: false,
            nodeIntegration: true
        }
    })
    //   window.webContents.openDevTools()
    window.loadURL(`file://${path.join(__dirname, 'index.html')}`)

    // Hide the window when it loses focus
    window.on('blur', () => {
        if (!window.webContents.isDevToolsOpened()) {
            window.hide()
        }
    })
}

//Need to add in some sort of api call to update the nba.json all the time

const nbaAPI = () => {
    var date = new Date()
    var dd = String(date.getDate()).padStart(2, '0');
    var mm = String(date.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = date.getFullYear();
    var fullDate = mm + '/' + dd + '/' + yyyy;
    var url = 'https://stats.nba.com/stats/scoreboardV2?DayOffset=0&LeagueID=00&gameDate=' + fullDate;

    const https = require('https');

    https.get(url, (resp) => {
        let data = '';

        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
            data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
            fs.writeFileSync('nba.json', data);
            createTray()
            createWindow()
        });

    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });
}

const toggleWindow = () => {
    window.isVisible() ? window.hide() : showWindow();
}

const showWindow = () => {
    const position = getWindowPosition();
    window.setPosition(position.x, position.y, false);
    window.show();
}

ipcMain.on('show-window', () => {
    showWindow()
})