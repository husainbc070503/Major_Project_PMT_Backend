const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },

    description: {
        type: String,
        required: true,
        trim: true,
    },

    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'project',
    },

    stage: {
        type: String,
        enum: ['todo', 'inProgress', 'to verify by teamLeader', 'to verify by guide', 'completed'],
        default: 'todo',
    },

    dueDate: {
        type: Date,
        default: Date.now(),
    },

    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
    },

    isVerifiedByTeamLeader: {
        type: Boolean,
        default: false
    },

    isVerifiedByGuide: {
        type: Boolean,
        default: false
    },

    attachment: {
        fileName: String,
        file: String
    },

    codeFile: {
        fileName: String,
        file: String,
        uploadedToGit: false
    },

    assignedUserRequestedToChangeStage: {
        type: Boolean,
        default: false
    },

    leaderMessage: String,
    guideMessage: String,

}, { timestamps: true });

const Task = mongoose.model('task', TaskSchema);
module.exports = Task;