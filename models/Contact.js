const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true
    },

    phone: {
        type: Number,
        required: true
    },

    message: {
        type: String,
        required: true
    },

    contactedOn: {
        type: Date,
        default: Date.now()
    }

}, { timestamps: true });

const Contact = mongoose.model('contact', ContactSchema);
module.exports = Contact;