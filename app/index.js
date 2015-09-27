var password = require("./password.js");

var util = require("util");
var async = require("async");

//需要用户输入
var secretKey = "11111111";
var serviceProvider = "weixin";
var userName = "test";
var pass = "test";
var pass2 = "test2";


onload = function() {
    //程序启动加载列表数据
    async.waterfall([
        function(callback) {
            password.createTableIfNotExists(function(err) {
                if (err) {
                    console.log("open password db err:" + err);
                } else {
                    console.log("open password db success");
                }
                callback(err)
            });
        },
        function(callback) {
            password.listPassword(function(err, rows) {
                callback(err, rows);
            });
        }
    ], function(err, rows) {
        if (err) {
            //alert
            console.log("db err:" + err);
            return;
        }
        for (var i = 0; i < rows.length; i++) {
            var row = rows[i];
            console.log(util.format("%d:%s:%s:%s:%s", row.id, row.provider, row.name, row.password, row.iv));

            var p = password.decrypt(secretKey, row.password, row.iv);
            console.log("clear password:" + p);
        }
    });


    //for test
    var passwordID = 0;


    var createButton = document.getElementById("create");
    createButton.onclick = function(e) {
        console.log("create");
        async.waterfall([
            function(callback) {
                //获取上次使用的密钥
                password.getCryptKey(function(err, signedKey) {
                    callback(err, signedKey);
                });
            },
            function(signedKey, callback) {
                if (!signedKey) {
                    //密钥为空
                    password.saveCryptKey(secretKey, function(err) {
                        callback(err);
                    });
                } else if (!password.isCryptKeyEqual(secretKey, signedKey)) {
                    //新的密钥和上次不一样， alert
                    callback("err");
                    return;
                } else {
                    callback(null);
                }
            },
            function(callback) {
                password.insertPassword(serviceProvider, userName, pass,
                                        secretKey, 
                                        function(err, id) {
                                            callback(err, id)
                                        });
            }
        ], function(err, id) {
            console.log("new password id:" + id + " err:" + err);
            passwordID = id;
            if (!err) {
                //alert insert success
            } else {
                //todo insert to list
            }
        });
    }

    var updateButton = document.getElementById("update");
    updateButton.onclick = function(e) {
        console.log("update");    
        async.waterfall([
            function(callback) {
                //获取上次使用的密钥
                password.getCryptKey(function(err, signedKey) {
                    callback(err, signedKey);
                    if (err) {
                        //alert
                    }
                });
            },
            function(signedKey, callback) {
                if (!password.isCryptKeyEqual(secretKey, signedKey)) {
                    //新的密钥和上次不一样， alert
                    callback("err");
                    return;
                }
                password.updatePassword(passwordID, serviceProvider,
                                        userName, pass2, 
                                        secretKey,
                                        function(err) {
                                            console.log("update password:" + passwordID + "err:" + err);
                                            callback(err);
                                        });                
            }], function(err) {
                if (!err) {
                    //alert update success
                }
            });
    }

    var removeButton = document.getElementById("remove");
    removeButton.onclick = function(e) {
        //todo alert is really delete?
        password.removePassword(passwordID, function(err) {
            console.log("remove password err:" + err);
            //alert remove success
        });
    }

    var listButton = document.getElementById("list");
    listButton.onclick = function(e) {
        password.listPassword(function(err, rows) {
            for (var i = 0; i < rows.length; i++) {
                var row = rows[i];
                console.log(util.format("%d:%s:%s:%s:%s", row.id, row.provider, row.name, row.password, row.iv));

                var p = password.decrypt(secretKey, row.password, row.iv);
                console.log("clear password:" + p);
            }
        });
    }
}
