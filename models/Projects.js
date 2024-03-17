const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },

    description: {
        type: String,
        required: true,
        trim: true,
    },

    start: String,
    end: String,

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },

    isTeamProject: {
        type: Boolean,
        default: false,
    },

    team: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'team',
    },

    guide: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },

    approvalStatus: {
        type: String,
        enum: ['requested', 'accepted', 'rejected'],
        default: 'requested',
    },

    noOfTasks: Number,

    meetDetails: {
        startDateTime: Date,
        endDateTime: Date,
        hangoutLink: String,
    },

    gitHubDetails: {
        ownerName: String,
        repository: String,
        token: String,
    },

    projectGithubRepository: String,

    feedbackToGuide: String,
    feedbackFromGuide: String,

}, { timestamps: true });

const Project = mongoose.model('project', ProjectSchema);
module.exports = Project;