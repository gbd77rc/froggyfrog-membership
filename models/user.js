var assert = require('assert');
var utility = require('../common/utility');

var User = function(args){
    assert.ok(args.email, "Email is required.");

    var user = {};
    if(args.id){
        user.id = args.id;
    }
    user.email = args.email;
    user.createdAt = args.createdAt || new Date();
    user.status = args.status || "Pending";
    user.signInCount = args.signInCount || 0;
    user.lastLoginAt = args.lastLoginAt || new Date();
    user.currentLoginAt = args.currentLoginAt || new Date();
    user.authenticationToken = args.authenticationToken || utility.randomString(18);
    user.hashedPassword = args.hashedPassword || null;
    return user;
};

module.exports = User;