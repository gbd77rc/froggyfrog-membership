var Registration = require('../common/registration');
var db = require('secondthought');

describe("Registration",function(){
    var reg = {};
    before(function(done){
        db.connect({db:"membership"}, function(err, db){
            reg = new Registration(db);
            done();
        });
    });
    describe("a valid application", function(){
        var regResult = {};
        before(function(done){
            db.users.destroyAll(function(err) {
                reg.applyForMembership({
                    email: "richard@social-vue.com",
                    password: "pwd",
                    confirm: "pwd"
                }, function (err, result) {
                    regResult = result;
                    done();
                });
            });
        });
        it("is successful", function(){
            regResult.message.should.equal('Welcome!');
            regResult.success.should.equal(true);
        });
        it("create a user",function(){
            regResult.user.should.be.defined;
        });
        it("create a log entry",function(){
            regResult.log.should.be.defined;
        });
        it("set the user's status to approved", function(){
            regResult.user.status.should.equal("Approved");
        });
        it("offers a welcome message", function(){
            regResult.message.should.equal("Welcome!");
        });
        it("increments the signInCount",function(){
            regResult.user.signInCount.should.greaterThan(0);
        });
    });

    describe("an empty or null email",function(){
        var regResult = {};
        before(function(done){
            db.users.destroyAll(function(err) {
                reg.applyForMembership({
                    email: "",
                    password: "pwd",
                    confirm: "pwd"
                }, function (err, result) {
                    regResult = result;
                    done();
                });
            });
        });
        it("is not successful", function(){
            regResult.success.should.equal(false);
        });
        it("tells user that email is required", function(){
            regResult.message.should.equal("Email and password are required");
        });

    });

    describe("empty or null password", function(){
        var regResult = {};
        before(function(done){
            db.users.destroyAll(function(err) {
                reg.applyForMembership({
                    email: "richard@social-vue.com",
                    password: "",
                    confirm:  ""
                }, function (err, result) {
                    regResult = result;
                    done();
                });
            });
        });
        it("is not successful", function(){
            regResult.success.should.equal(false);
        });
        it("tells user that email/password is required", function(){
            regResult.message.should.equal("Email and password are required");
        });
    });

    describe("password and confirm mismatch", function(){
        var regResult = {};
        before(function(done){
            db.users.destroyAll(function(err) {
                reg.applyForMembership({
                    email: "richard@social-vue.com",
                    password: "Test1",
                    confirm:  "Test2"
                }, function (err, result) {
                    regResult = result;
                    done();
                });
            });
        });
        it("is not successful", function(){
            regResult.success.should.equal(false);
        });
        it("tells user that passwords should match", function(){
            regResult.message.should.equal("Password/Confirm must match");
        });
    });

    describe("email already exists", function(){
        var regResult = {};
        before(function(done){
            reg.applyForMembership({
                email: "test2@social-vue.com",
                password: "Test1",
                confirm:  "Test1"
            }, function (err, result) {
                reg.applyForMembership({
                    email: "test2@social-vue.com",
                    password: "Test1",
                    confirm:  "Test1"
                }, function (err, result) {
                    regResult = result;
                    done();
                });
            });
        });
        it("is not successful", function(){
            regResult.success.should.equal(false);
        });
        it("tells user that email already exists", function(){
            regResult.message.should.equal("This email already exists");
        });
    });
});