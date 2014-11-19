var events = require('events');
var util = require('util');
var bc = require('bcrypt-nodejs');
var User = require('../models/user');
var Log = require('../models/log');
var assert = require('assert');

var AuthResult = function(creds){
    var result = {
        credentials:creds,
        success: false,
        message: null,
        user: null,
        log:null
    };
    return result;
};

var Authentication = function(db){
    var self = this;
    var continueWith = null;

    events.EventEmitter.call(self);

    //validate credentials
    var validateCredentials = function(authResult){
        if ( authResult.credentials.email && authResult.credentials.password){
            self.emit("credentials-ok", authResult);
        } else {
            authResult.message = "Credentials Missing";
            self.emit("invalid", authResult);
        }
    };

    //find the user
    var findUser = function(authResults){
        db.users.first({email:authResults.credentials.email}, function(err,found){
            assert.ok(err === null, err);
            if(found){
                authResults.user = new User(found);
                self.emit("user-found",authResults);
            } else {
                authResults.message = "Invalid Credentials";
                self.emit("invalid",authResults);
            }
        });
    };

    //compare passwords
    var comparePassword = function(authResult){
        var matched = bc.compareSync(authResult.credentials.password, authResult.user.hashedPassword);
        if ( matched ){
            self.emit("password-accepted", authResult);
        } else {
            authResult.message = "Invalid Credentials";
            self.emit("invalid",authResult);
        }
    };

    //bump the stats
    var updateUser = function(authResult){
        var user = authResult.user;
        user.signInCount++;
        user.lastLoginAt = user.currentLoginAt;
        user.currentLoginAt = new Date();

        var updates = {
            signInCount : user.signInCount,
            lastLoginAt : user.lastLoginAt,
            currentLoginAt : user.currentLoginAt
        };

        db.users.updateOnly(updates, user.id, function(err, updates){
            assert.ok(err === null, err);
            self.emit("stats-updated", authResult);
        });
    };

    var createLog = function(authResult){
        var log = new Log({subject:"Authentication", userId:authResult.user.id, entry: "Successfully logged in...."});

        db.logs.save(log,function(err, newLog){
            assert.ok(err === null, err);
            authResult.log = newLog;
            self.emit("log-created", authResult);
        });
    };

    self.authenticate = function(creds,next){
        continueWith = next;
        var authResult = new AuthResult(creds);
        self.emit("login-received",authResult);
    };

    var authOk = function(authResult){
        authResult.success = true;
        authResult.message = "Welcome!";

        self.emit("authenticated", authResult);
        self.emit("completed", authResult);

        if(continueWith){
            continueWith(null,authResult);
        }
    };

    var authNotOk = function(authResult){
        authResult.success = false;
        self.emit("not-authenticated", authResult);
        self.emit("completed", authResult);

        if(continueWith){
            continueWith(null,authResult);
        }
    };


    self.on("login-received", validateCredentials);
    self.on("credentials-ok", findUser);
    self.on("user-found", comparePassword);
    self.on("password-accepted", updateUser);
    self.on("stats-updated", createLog);
    self.on("log-created", authOk);


    self.on("invalid", authNotOk);
};



util.inherits(Authentication,events.EventEmitter);
module.exports = Authentication;