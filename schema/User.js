var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

var userSchema = mongoose.Schema({
    local            : {
        email        : String,
        password     : String,
        settings     : {
            name         : String,
            city         : String,
            state        : String,
            country      : String,
        },
        trades       : {
            forMe         : Array,
            fromMe        : Array,
            approved     : Array,
            cancelled     : Array,
        }
    }
});

userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

module.exports = mongoose.model('User', userSchema);