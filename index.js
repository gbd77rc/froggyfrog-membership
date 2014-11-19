var events = require('events');
var util = require('util');
var Registration = require("./common/registration");
var Authentication = require('./common/authentication');
var db = require('secondthought');
var assert = require('assert');

var Membership = function(dbName){
    var self = this;
    events.EventEmitter.call(self);

    self.findUserByToken = function(token, next){
        db.connect({db:dbName}, function(err,db){
            assert.ok(err===null,err);

            db.users.first({authenticationToken : token}, next);
        });
    };

    self.authenticate = function(email,password,next){
        db.connect({db:dbName}, function(err,db){
            var auth = new Authentication(db);

            // Make sure we have subscribe to the events before actually doing the work or we will miss them!
            auth.on("authenticated", function(authResult){
                self.emit("authenticated", authResult);
            });

            auth.on("not-authenticated", function(authResult){
                self.emit("not-authenticated", authResult);
            });

            auth.authenticate({email:email, password:password}, next);
        });
    };

    self.register = function(email, password, confirm, next){
        db.connect({db:dbName}, function(err,db){
            var reg = new Registration(db);

            // Make sure we have subscribe to the events before actually doing the work or we will miss them!
            reg.on("registered", function(regResult){
                self.emit("registered", regResult);
            });

            reg.on("not-registered", function(regResult){
                self.emit("not-registered", regResult);
            });

            reg.applyForMembership({email:email, password:password, confirm:confirm}, next);
        });
    };
};

util.inherits(Membership, events.EventEmitter);
module.exports = Membership;