const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
    comment: {
        type: String,
        required: true,
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
    },

    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'project'
    },

    team: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'team'
    },

    dateTime: {
        type: Date,
        default: Date.now(),
    }

}, { timestamps: true });

const Comment = mongoose.model('comment', CommentSchema);
module.exports = Comment