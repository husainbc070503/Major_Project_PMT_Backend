const mongoose = require('mongoose');

const OtpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },

    otp: {
        type: Number,
        default: 0,
    },

    expiresIn: Number,

    requestedOn: {
        type: Date,
        default: Date.now()
    }

}, { timestamps: true });

const Otp = mongoose.model('otp', OtpSchema);
module.exports = Otp