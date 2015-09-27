var sqlite3 = require('sqlite3').verbose();
var async = require('async');
var crypto = require('crypto');

var remote = require('remote');
var app = remote.require('app');
var path = require("path");

var AESCrypt = {};

AESCrypt.decrypt = function(cryptkey, iv, encryptdata) {
    encryptdata = new Buffer(encryptdata, 'base64').toString('binary');

    var decipher = crypto.createDecipheriv('aes-256-cbc', cryptkey, iv),
    decoded  = decipher.update(encryptdata, "binary", "utf8");

    decoded += decipher.final("utf8");
    return decoded;
}

AESCrypt.encrypt = function(cryptkey, iv, cleardata) {
    var encipher = crypto.createCipheriv('aes-256-cbc', cryptkey, iv),
    encryptdata  = encipher.update(cleardata, "utf8", "binary");

    encryptdata += encipher.final("binary");
    encode_encryptdata = new Buffer(encryptdata, 'binary').toString('base64');
    return encode_encryptdata;
}


var dbPath = path.join(app.getPath("userData"), "password.db3");
console.log("password db path:" + dbPath);
function createTableIfNotExists(cb) {
    var db = new sqlite3.Database(dbPath, function(err) {
        if (err) {
            if (cb) cb(err);
        } else {
            async.series({
                key_db: function(callback) {
                    db.run("CREATE TABLE IF NOT EXISTS master_key (id INTEGER PRIMARY KEY, key TEXT)", [], function(err) {
                        callback(err, null);
                    });
                },
                password_db: function(callback) {
                    db.run("CREATE TABLE IF NOT EXISTS password (id INTEGER PRIMARY KEY AUTOINCREMENT, provider TEXT, name TEXT, password TEXT, iv TEXT)", [], function(err) {
                        callback(err, null);
                    });
                }
            }, function(err, results) {
                if (cb) cb(err);
            });
        }
    });

    db.close();
}


function insertPassword(serviceProvider, userName, password, iv, cb) {
    //每次都需要打开db，如果只打开一次，程序会崩溃，原因未知
    var db = new sqlite3.Database(dbPath, function(err) {
        if (err) {
            if (cb) cb(err, 0);
            return
        }
        db.run("INSERT INTO password VALUES(?, ?, ?, ?, ?)", [null, serviceProvider, userName, password, iv], function(err) {
            if (cb) cb(err, this.lastID);
        });
    });
    db.close();
}

function removePassword(id, cb) {
    var db = new sqlite3.Database(dbPath, function(err) {
        if (err) {
            if (cb) cb(err);
            return
        }

        db.run("DELETE FROM password where id=?", [id], function(err) {
            if (cb) cb(err);
        });
    });
    db.close();
}

function updatePassword(id, serviceProvider, userName, password, iv, cb) {
    var db = new sqlite3.Database(dbPath, function(err) {
        if (err) {
            if (cb) cb(err);
            return
        }

        db.run("UPDATE password SET provider=?, name=?, password=?, iv=? WHERE id=?", [serviceProvider, userName, password, iv, id], function(err) {
            if (cb) cb(err);
        });
    });
    db.close();
}

function listPassword(cb) {
    var db = new sqlite3.Database(dbPath, function(err) {
        if (err) {
            if (cb) cb(err, null);
            return
        }

        db.all("SELECT id, provider, name, password, iv FROM password", function(err, rows) {
            if (cb) cb(err, rows);
        });
    });
    db.close();
}

exports.createTableIfNotExists = createTableIfNotExists;
exports.listPassword = listPassword;
exports.removePassword = removePassword;


function hashKey(key) {
    var cryptkey = crypto.createHash('sha256').update(key).digest();
    return cryptkey;
}

exports.insertPassword = function(serviceProvider, userName, password, key, cb) {
    var cryptkey = hashKey(key);
    var iv = crypto.randomBytes(16);
    var ivBase64 = iv.toString('base64');

    var encrypted = AESCrypt.encrypt(cryptkey, iv, password);
    insertPassword(serviceProvider, userName, encrypted, ivBase64, cb);
};

exports.updatePassword = function(id, serviceProvider, userName, password, key,  cb) {
    var cryptkey = hashKey(key);
    var iv = crypto.randomBytes(16);
    var ivBase64 = iv.toString('base64');

    var encrypted = AESCrypt.encrypt(cryptkey, iv, password);
    updatePassword(id, serviceProvider, userName, encrypted, ivBase64, cb);
}

exports.decrypt = function(key, password, ivBase64) {
    var cryptkey = hashKey(key);
    var iv = new Buffer(ivBase64, "base64");
    return AESCrypt.decrypt(cryptkey, iv, password);
}

function signKey(key) {
    var cryptkey   = crypto.createHash('md5').update(key).digest("hex");
    return cryptkey;
}

exports.saveCryptKey = function(key, cb) {
    var cryptkey   = signKey(key);

    var db = new sqlite3.Database(dbPath, function(err) {
        if (err) {
            if (cb) cb(err);
            return
        }

        db.run("REPLACE INTO master_key VALUES(?, ?)", [1, cryptkey], function(err) {
            cb(err);
        });

    });
    db.close();
}

exports.updateCryptKey = function(oldKey, newKey, cb) {
    
}

exports.getCryptKey = function(cb) {
    var db = new sqlite3.Database(dbPath, function(err) {
        if (err) {
            if (cb) cb(err, "");
            return
        }

        db.get("SELECT id, key FROM master_key", function(err, row) {
            if (err) {
                cb(err, "");
            } else {
                if (row) {
                    cb(null, row.key);
                } else {
                    cb(null, "");
                }
            }
        });
    });
    db.close();
}

exports.isCryptKeyEqual = function(key, signedKey) {
    var cryptkey  = signKey(key);
    return (cryptkey === signedKey);
}
