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
                '<td><span class="pass">******</span><a href="#" class="btn btn-success" data-action="show">查看</a></td>' +
                '<td>' +
                '<a href="#" data-action="update" class="btn btn-info">修改</a>' +
                '<a href="#" data-action="remove" class="btn btn-remove">删除</a>' +
                '</td>' +
                '</tr>', row.id, row.iv, row.password, row.provider, row.name, row.provider, row.name))
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

    },
    generateRandomPassword: function (length) {
        var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
        var randomstring = '';
        for (var i = 0; i < length; i++) {
            var rnum = Math.floor(Math.random() * chars.length);
            randomstring += chars.substring(rnum, rnum + 1);
        }
        return randomstring;
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
    var create = function () {
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
                helper.tip('创建成功！');
                document.getElementById('form').reset();
                loadList();
            } else {
                helper.tip('创建失败！');
            }
        });
    };
    var update = function () {
        console.log("update");
        var update = document.getElementById('update_wrap'),
            passwordID = update.querySelector('input[name="id"]').value,
            serviceProvider = update.querySelector('input[name="serviceProvider"]').value,
            userName = update.querySelector('input[name="userName"]').value,
            pass2 = update.querySelector('input[name="pass"]').value.trim(),
            secretKey = update.querySelector('input[name="secretKey"]').value.trim();
        if (!serviceProvider) {
            helper.tip('服务商不能为空!');
            return false;
        }
        if (!userName) {
            helper.tip('用户名不能为空!');
            return false;
        }
        if (!pass2) {
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
                helper.tip('修改成功！');
                loadList();
                document.querySelector('.dialog').style.display = 'none';
            } else {
                helper.tip('修改失败！');
            }
        })
    };
    var remove = function (id) {
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
                remove(id);
            } else if (action == 'update') {
                var update = document.getElementById('update_wrap');
                update.querySelector('input[name="id"]').value = id;
                update.querySelector('input[name="serviceProvider"]').value = provider;
                update.querySelector('input[name="userName"]').value = user;
                update.style.display = 'block';
            } else if (action == 'show') {
                var show = document.getElementById('show_wrap');
                show.querySelector('input[name="id"]').value = id;
                show.style.display = 'block';
            }
            e.preventDefault();
        }
    };
    var show = function () {
        var show = document.getElementById('show_wrap'),
            id = show.querySelector('input[name="id"]').value,
            secretKey = show.querySelector('input[name="secretKey"]').value,
            tr = document.querySelector('tbody tr[data-id="' + id + '"]'),
            pass = tr.dataset.password,
            iv = tr.dataset.iv;
        try {
            var p = password.decrypt(secretKey, pass, iv);
            //tr.querySelector('.pass').innerText = p;
            document.getElementById('show_pass').innerText = '密码：' + p;
            //document.getElementById('show_wrap').style.display = 'none';

        } catch (e) {
            helper.tip('密钥错误！');

        }
    };
    document.getElementById('cancel_update').onclick = function () {
        document.getElementById('update_wrap').style.display = 'none';
    };
    document.getElementById('update').onclick = function () {
        update();
    };
    document.getElementById("create").onclick = function () {
        create();
    };
    document.getElementById("show").onclick = function () {
        show();
    };
    document.getElementById('cancel_show').onclick = function () {
        document.getElementById('show_pass').innerText = '';
        document.getElementById('show_wrap').querySelector('input[name="secretKey"]').value = '';
        document.getElementById('show_wrap').style.display = 'none';
    };
    //document.getElementById('create_random').onclick = function () {
        //alert(helper.generateRandomPassword(16));
    //};
    loadList();
};
