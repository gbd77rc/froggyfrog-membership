var Registration = require('../common/registration');
var db = require('secondthought');
var assert = require('assert');
var Auth = require('../common/authentication');


describe("Authentication",function(){
    var reg = {};
    var auth = {};
    before(function(done){
        db.connect({db:"membership"}, function(err, db){
            reg = new Registration(db);
            auth = new Auth(db);
            db.users.destroyAll(function(err) {
                reg.applyForMembership({
                    email: "test@test.com",
                    password: "pwd",
                    confirm: "pwd"
                }, function (err, regResult) {
                    assert.ok(regResult.success);
                    done();
                });
            });
        });
    });

    describe("a valid login", function(){
        var authResult = {};
        before(function(done){
            // Log them in
            auth.authenticate({email:"test@test.com", password:"pwd"}, function(err,result){
                assert.ok(err===null,err);
                authResult = result;
                done();
            });
        });
        it("is successful", function(){
            authResult.success.should.equal(true);
        });
        it("returns a user",function(){
            authResult.user.should.be.defined;
        });
        it("creates a log entry", function(){
            authResult.log.should.be.defined;
        });
        it("updates the user stats",function(){
            authResult.user.signInCount.should.be.greaterThan(1);
        });
    });
    describe("empty email", function(){
        var authResult = {};
        before(function(done){
            // Log them in
            auth.authenticate({email:"", password:"pwd"}, function(err,result){
                assert.ok(err===null,err);
                authResult = result;
                done();
            });
        });
        it("is not successful",function(){
            authResult.success.should.equal(false);
        });
        it("returns a message saying 'Invalid login'",function(){
            authResult.message.should.equal("Credentials Missing");
        });
    });
    describe("empty password", function(){
        var authResult = {};
        before(function(done){
            // Log them in
            auth.authenticate({email:"test@test.com", password:""}, function(err,result){
                assert.ok(err===null,err);
                authResult = result;
                done();
            });
        });
        it("is not successful",function(){
            authResult.success.should.equal(false);
        });
        it("returns a message saying 'Invalid login'",function(){
            authResult.message.should.equal("Credentials Missing");
        });
    });
    describe("password does not match", function(){
        var authResult = {};
        before(function(done){
            // Log them in
            auth.authenticate({email:"test@test.com", password:"test1"}, function(err,result){
                assert.ok(err===null,err);
                authResult = result;
                done();
            });
        });
        it("is not successful",function(){
            authResult.success.should.equal(false);
        });
        it("returns a message saying 'Invalid Credentials'",function(){
            authResult.message.should.equal("Invalid Credentials");
        });
    });

    describe("email not found", function(){
        var authResult = {};
        before(function(done){
            // Log them in
            auth.authenticate({email:"test2@test.com", password:"test1"}, function(err,result){
                assert.ok(err===null,err);
                authResult = result;
                done();
            });
        });
        it("is not successful",function(){
            authResult.success.should.equal(false);
        });
        it("returns a message saying 'Invalid Credentials'",function(){
            authResult.message.should.equal("Invalid Credentials");
        });
    });
});