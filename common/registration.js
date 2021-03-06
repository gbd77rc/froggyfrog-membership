var Application = require('../models/application');
var User = require('../models/user');
var db = require('secondthought');
var assert = require('assert');
var bc = require('bcrypt-nodejs');
var Log = require('../models/log');

var Emitter = require('events').EventEmitter;
var util = require('util');


var RegResult = function () {
    var result = {
        success: false,
        message: null,
        userId: null
    };
    return result;
};

var Registration = function(db) {
    Emitter.call(this);
    var self = this;
    var db = db;
    var continueWith = null;

    var validateInputs = function (app) {
        if (!app.email || !app.password) {
            app.setInvalid("Email and password are required");
            self.emit("invalid", app);
        } else if (app.password !== app.confirm) {
            app.setInvalid("Password/Confirm must match");
            self.emit("invalid", app);
        } else {
            app.validate();
            self.emit("validated", app);
        }
    };

    var checkIfUserExists = function (app) {
        db.users.exists({email: app.email}, function(err, exists){
            assert.ok(err==null,err);
            if(exists){
                app.setInvalid("This email already exists");
                self.emit("invalid",app);
            } else {
                self.emit("user-doesnt-exist", app);
            }
        });
    };

    var createUser = function(app){
        // Create the user
        var user = new User(app);
        user.status = "Approved";
        user.signInCount++;
        // Hash the password
        user.hashedPassword= bc.hashSync(app.password);

        db.users.save(user, function(err, newUser){
            assert.ok(err==null,err);
            app.user = newUser;
            self.emit("user-created", app);
        });
    };

    var addLogEntry = function(app){
        var log = new Log({
            subject:"Registration",
            userId:app.user.id,
            entry:"Successfully Registered!"
        });

        db.logs.save(log,function(err,newLog){
            assert.ok(err==null,err);
            app.log = newLog;
            self.emit("log-created",app);
        });
    }

    self.applyForMembership = function (args,next) {
        continueWith = next;
        var app = new Application(args);

        self.emit("application-received",app);
    };

    var registrationOk = function(app){
        var regResult = new RegResult();
        regResult.success = true;
        regResult.message = "Welcome!";
        regResult.user = app.user;
        regResult.log = app.log;
        self.emit("registered", regResult);

        if(continueWith){
            continueWith(null,regResult);
        }
    };

    var registrationNotOk = function(app){
        var regResult = new RegResult();
        regResult.success = false;
        regResult.message = app.message;
        self.emit("not-registered", regResult);

        if(continueWith){
            continueWith(null,regResult);
        }
    };

    // events

    self.on("application-received", validateInputs);
    self.on("validated", checkIfUserExists);
    self.on("user-doesnt-exist", createUser);
    self.on("user-created", addLogEntry);
    self.on("log-created", registrationOk);

    // oh NO
    self.on("invalid",registrationNotOk);

    return self;
};

util.inherits(Registration,Emitter);

module.exports = Registration;