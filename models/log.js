var assert = require("assert");

var Log = function(args){
    assert.ok(args.subject && args.entry && args.userId, "Subject, Entry and UserId must exist!");

    var log = {};
    log.subject = args.subject;
    log.entry = args.entry;
    log.userId = args.userId;
    log.createdAt = new Date();

    return log;
};

module.exports = Log;