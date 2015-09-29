var password = require("./password.js");

var util = require("util");
var async = require("async");

//需要用户输入
var secretKey = "11111111";
var serviceProvider = "weixin";
var userName = "test";
var pass = "test";
var pass2 = "test2";
var params = {
    timer: 0
};
var htmlLayout = {
    buildList: function (rows) {
        var html = [];
        for (var row of rows) {
            html.push(util.format(' <tr data-id="%d" data-iv="%s" data-password="%s" data-provider="%s" data-user="%s">' +
                '<td>%s</td>' +
                '<td>%s</td>' +
                '<td>******<a href="#" class="btn btn-success" data-action="show">查看</a></td>' +
                '<td>' +
                '<a href="#" data-action="update" class="btn btn-info">修改</a>' +
                '<a href="#" data-action="remove" class="btn btn-remove">删除</a>' +
                '</td>' +
                '</tr>', row.id, row.iv, row.password, row.provider, row.provider, row.name, row.name))
        }
        return html.join('');
    }
};
var helper = {
    tip: function (msg, timer) {
        timer = timer || 3000;
        clearTimeout(params.timer);
        var tip = document.querySelector('.tip');
        tip.querySelector('span').innerText = msg;
        tip.style.display = 'block';
        params.timer = setTimeout(function () {
            tip.style.display = 'none';
        }, timer);

    }
};


onload = function () {
    //程序启动加载列表数据
    var loadList = function () {

        async.waterfall([
            function (callback) {
                password.createTableIfNotExists(function (err) {
                    if (err) {
                        console.log("open password db err:" + err);
                    } else {
                        console.log("open password db success");
                    }
                    callback(err)
                });
            },
            function (callback) {
                password.listPassword(function (err, rows) {
                    callback(err, rows);
                });
            }
        ], function (err, rows) {
            if (err) {
                //alert
                console.log("db err:" + err);
                return;
            }
            document.querySelector('#list tbody').innerHTML = htmlLayout.buildList(rows);
            //for (var i = 0; i < rows.length; i++) {
            //    var row = rows[i];
            //
            //    console.log(util.format("%d:%s:%s:%s:%s", row.id, row.provider, row.name, row.password, row.iv));
            //
            //    var p = password.decrypt(secretKey, row.password, row.iv);
            //    console.log("clear password:" + p);
            //}
        });
    };
    //for test
    var passwordID = 0;


    var createButton = document.getElementById("create");
    createButton.onclick = function () {
        console.log("create");
        var serviceProvider = document.getElementById('serviceProvider').value.trim(),
            userName = document.getElementById('userName').value.trim(),
            pass = document.getElementById('pass').value.trim(),
            secretKey = document.getElementById('secretKey').value.trim();
        if (!serviceProvider) {
            helper.tip('服务商不能为空!');
            return false;
        }
        if (!userName) {
            helper.tip('用户名不能为空!');
            return false;
        }
        if (!pass) {
            helper.tip('密码不能为空!');
            return false;
        }
        if (!secretKey) {
            helper.tip('密钥不能为空!');
            return false;
        }
        async.waterfall([
            function (callback) {
                //获取上次使用的密钥
                password.getCryptKey(function (err, signedKey) {
                    callback(err, signedKey);
                });
            },
            function (signedKey, callback) {
                if (!signedKey) {
                    //密钥为空
                    password.saveCryptKey(secretKey, function (err) {
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
            function (callback) {
                password.insertPassword(serviceProvider, userName, pass,
                    secretKey,
                    function (err, id) {
                        callback(err, id)
                    });
            }
        ], function (err, id) {
            console.log("new password id:" + id + " err:" + err);
            passwordID = id;
            if (!err) {
                //alert insert success
            } else {
                //todo insert to list
                loadList();
            }
        });
    };

    var updateButton = document.getElementById("update");
    updateButton.onclick = function (e) {
        console.log("update");
        async.waterfall([
            function (callback) {
                //获取上次使用的密钥
                password.getCryptKey(function (err, signedKey) {
                    callback(err, signedKey);
                    if (err) {
                        //alert
                    }
                });
            },
            function (signedKey, callback) {
                if (!password.isCryptKeyEqual(secretKey, signedKey)) {
                    //新的密钥和上次不一样， alert
                    callback("err");
                    return;
                }
                password.updatePassword(passwordID, serviceProvider,
                    userName, pass2,
                    secretKey,
                    function (err) {
                        console.log("update password:" + passwordID + "err:" + err);
                        callback(err);
                    });
            }], function (err) {
            if (!err) {
                //alert update success
            }
        });
    };
    /*
     var removeButton = document.getElementById("remove");
     removeButton.onclick = function (e) {
     //todo alert is really delete?
     password.removePassword(passwordID, function (err) {
     console.log("remove password err:" + err);
     //alert remove success
     });
     };
     */
    var removePassword = function (id) {
        if (confirm('确认删除？')) {
            password.removePassword(id, function (err) {
                if (!err) {
                    helper.tip('删除成功');
                    loadList();
                } else {
                    helper.tip('删除失败');
                }
            });
        }
    };
    document.querySelector('#list tbody').onclick = function (e) {
        var node = e.target,
            action = node.dataset.action;
        if (action) {
            var tr = node.parentNode.parentNode,
                id = tr.dataset.id,
                iv = tr.dataset.iv,
                password = tr.dataset.password,
                user = tr.dataset.user,
                provider = tr.dataset.provider;
            if (action == 'remove') {
                removePassword(id);
            } else if (action == 'update') {
                var update = document.getElementById('update_wrap');
                update.querySelector('input[name="id"]').value = id;
                update.querySelector('input[name="serviceProvider"]').value = provider;
                update.querySelector('input[name="userName"]').value = user;
                update.style.display = 'block';

            } else if (action == 'show') {

            }
            e.preventDefault();
        }
    };
    document.getElementById('cancel').onclick = function () {
        document.getElementById('update_wrap').style.display = 'none';
    };
    //var listButton = document.getElementById("list");
    //listButton.onclick = function (e) {
    //    password.listPassword(function (err, rows) {
    //        for (var i = 0; i < rows.length; i++) {
    //            var row = rows[i];
    //            console.log(util.format("%d:%s:%s:%s:%s", row.id, row.provider, row.name, row.password, row.iv));
    //
    //            var p = password.decrypt(secretKey, row.password, row.iv);
    //            console.log("clear password:" + p);
    //        }
    //    });
    //}
    loadList();
};
