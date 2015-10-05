var app = require('app');  // Module to control application life.
var shell = require('shell');
var BrowserWindow = require('browser-window');  // Module to create native browser window.
var fs = require('fs');
var path = require('path');
var net = require('net');
var util = require('util');
var Menu = require('menu');
var dialog = require('dialog');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is GCed.
global.mainWindow = null;
global.menu = null;


function generateRandomPassword(length) {
    var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
    var randomstring = '';
    for (var i=0; i<length; i++) {
        var rnum = Math.floor(Math.random() * chars.length);
        randomstring += chars.substring(rnum,rnum+1);
    }
    return randomstring;                       
}

function main() {
    app.on('window-all-closed', function() {
        // On OS X it is common for applications and their menu bar
        // to stay active until the user quits explicitly with Cmd + Q
        if (process.platform != 'darwin') {
            app.quit();
        }
    });

    console.log("exec path:" + process.execPath);
    console.log("user data path:" + app.getPath("userData"));
    console.log("app path:" + app.getAppPath());

    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    app.on('ready', function() {
        // Create the browser window.
        mainWindow = new BrowserWindow({width: 800, height: 600, frame:true, 
                                        'web-preferences': {
                                            'plugins': true,
                                        }});

        // Open the devtools.
        //mainWindow.openDevTools();

        // Emitted when the window is closed.
        mainWindow.on('closed', function() {
            mainWindow = null;
        });

        mainWindow.loadUrl('file://' + __dirname + '/index.html');

        if (process.platform == 'darwin') {
            var name = require('app').getName();
            var template = [
                {
                    label: name,
                    submenu: [
                        {
                            label: '生成密码',
                            click: function() {
                                var r = generateRandomPassword(16);
                                console.log("password:" + r);
                                dialog.showMessageBox({type:"info", message:"随机密码", detail:r, buttons:["确定"]});
                            }
                        },
                        {
                            label: '退出',
                            accelerator: 'Command+Q',
                            click: function() { app.quit(); }
                        },
                    ]
                },
            ];
            menu = Menu.buildFromTemplate(template);
            Menu.setApplicationMenu(menu);
        }
    });
}

main();

