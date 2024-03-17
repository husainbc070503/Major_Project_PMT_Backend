const FetchUser = require('../middleware/FetchUser');
const Team = require('../models/Team');
const User = require('../models/User');
const router = require('express').Router();

router.post('/createTeam', FetchUser, async (req, res) => {
    const { name, members } = req.body;

    try {
        var tempMembers = JSON.parse(members);
        tempMembers.unshift(req.user);

        var team = await Team.create({ name, members: tempMembers, teamLeader: req.user });
        team = await Team.findById(team._id)
            .populate('members', '-password')
            .populate('teamLeader', '-password');

        tempMembers?.map(async (item) => await User.findByIdAndUpdate(item, { addedToTeam: true }, { new: true }))

        res.status(200).json({ success: true, team });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

router.put('/addToTeam/:id', FetchUser, async (req, res) => {
    const { user } = req.body;

    try {
        const team = await Team.findByIdAndUpdate(req.params.id, { $push: { members: user } }, { new: true })
            .populate('members', '-password')
            .populate('teamLeader', '-password');

        await User.findByIdAndUpdate({ _id: user._id }, { addedToTeam: true }, { new: true });
        res.status(200).json({ success: true, team });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

router.put('/removeFromTeam/:id', FetchUser, async (req, res) => {
    const { user } = req.body;

    try {
        const team = await Team.findByIdAndUpdate(req.params.id, { $pull: { members: user } }, { new: true })
            .populate('members', '-password')
            .populate('teamLeader', '-password');

        await User.findByIdAndUpdate({ _id: user }, { addedToTeam: false }, { new: true });
        res.status(200).json({ success: true, team });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

router.put('/updateTeam/:id', FetchUser, async (req, res) => {
    const { name } = req.body;
    try {
        const team = await Team.findByIdAndUpdate(req.params.id, { name }, { new: true })
            .populate('members', '-password')
            .populate('teamLeader', '-password');

        res.status(200).json({ success: true, team });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

router.get('/getTeams', FetchUser, async (req, res) => {
    try {
        const teams = await Team.find()
            .populate('members', '-password')
            .populate('teamLeader', '-password');

        res.status(200).json({ success: true, teams })
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

router.get('/teams', FetchUser, async (req, res) => {
    try {
        const teams = await Team.find()
            .populate('members', '-password')
            .populate('teamLeader', '-password');

        res.status(200).json({ success: true, teams });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

module.exports = router;