const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },

    teamLeader: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
    },

    members: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        }
    ],

}, { timestamps: true });

const Team = mongoose.model('team', TeamSchema);
module.exports = Team;