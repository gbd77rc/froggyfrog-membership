var should = require('should');

var User = require('../models/user');

describe("User", function(){
    describe("defaults", function(){
        var user = {};
        before(function(){
            user = new User({
                email: "richard@social-vue.com"
            });
        });

        it("email is richard@social-vue.com", function(){
            user.email.should.equal("richard@social-vue.com");
        });
        it("has an authentication token", function(){
            user.authenticationToken.should.be.defined;
        });
        it("has a pending status", function(){
            user.status.should.equal("Pending");
        });
        it("has a created date", function(){
            user.createdAt.should.be.defined;
        });
        it("has a signInCount of 0", function(){
            user.signInCount.should.equal(0);
        });
        it("has lastLoginAt", function(){
            user.lastLoginAt.should.be.defined;
        });
        it("has currentLoginAt", function(){
            user.currentLoginAt.should.be.defined;
        });
    });
});