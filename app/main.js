const electron = require('electron');
var app = electron.app;
var BrowserWindow = electron.BrowserWindow;
var Tray = electron.Tray;
var Menu = electron.Menu;
var dialog = electron.dialog;
var shell = electron.shell;

var fs = require('fs');
var path = require('path');
var net = require('net');

const DEBUG = false;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is GCed.
global.mainWindow = null;
global.menu = null;


function generateRandomPassword(length) {
    var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
    var randomstring = '';
    for (var i = 0; i < length; i++) {
        var rnum = Math.floor(Math.random() * chars.length);
        randomstring += chars.substring(rnum, rnum + 1);
    }
    return randomstring;
}

function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        frame: true,
        backgroundColor:'#ffffff',
        'web-preferences': {
            'plugins': true,
        }
    });

    // Open the devtools.
    if (DEBUG) {
        mainWindow.openDevTools();
    }

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        mainWindow = null;
    });

    mainWindow.loadURL('file://' + __dirname + '/index.html');
}

function main() {
    app.on('window-all-closed', function () {
        // On OS X it is common for applications and their menu bar
        // to stay active until the user quits explicitly with Cmd + Q
        if (process.platform != 'darwin') {
            app.quit();
        }
    });

    //v0.30.2
    app.on('activate-with-no-open-windows', function() {
        console.log("activate-with-no-open-windows");
        if (!mainWindow) {
            createMainWindow();
        }
    });

    //v0.34.2
    app.on("activate", function(event, hasVisibleWindows) {
        console.log("app activate:" + hasVisibleWindows);
        if (!mainWindow) {
            createMainWindow();
        }
    });

    console.log("exec path:" + process.execPath);
    console.log("user data path:" + app.getPath("userData"));
    console.log("app path:" + app.getAppPath());

    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    app.on('ready', function () {
        console.log("ready");
        createMainWindow();
        if (process.platform == 'darwin') {
            var name = app.getName();
            var template = [
                {
                    label: name,
                    submenu: [
                        {
                            label: '生成密码',
                            click: function () {
                                var r = generateRandomPassword(16);
                                console.log("password:" + r);
                                dialog.showMessageBox({type: "info", message: "随机密码", detail: r, buttons: ["确定"]});
                            }
                        },
                        {
                            label: '备份',
                            click: function () {
                                var dbPath = path.join(app.getPath("userData"), "password.db3");
                                console.log("password db path:" + dbPath);
                                shell.showItemInFolder(dbPath)
                            }
                        },
                        {
                            label: '退出',
                            accelerator: 'Command+Q',
                            click: function () {
                                app.quit();
                            }
                        },
                        {type: "separator"},
                        {label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:"},
                        {label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:"}
                    ]
                },
            ];
            menu = Menu.buildFromTemplate(template);
            Menu.setApplicationMenu(menu);
        }
    });
}

main();
