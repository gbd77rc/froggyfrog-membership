exports.randomString = function(length){
    length = length || 12;
    var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    var result = "";
    for(var i=0;i < length; i++){
        var rnum = Math.floor(Math.random() * chars.length);
        result += chars.substring(rnum,rnum+1);
    }
    return result;
};