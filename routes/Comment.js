const FetchUser = require('../middleware/FetchUser');
const Comment = require('../models/Comments');
const Team = require('../models/Team');
const router = require('express').Router();

router.post('/addComment', FetchUser, async (req, res) => {
    const { comment, project, team } = req.body;

    try {
        if (!comment)
            return res.status(400).json({ success: false, message: 'Please add comment' });

        let cmt = await Comment.create({ comment, user: req.user, team, project });
        cmt = await Comment.findById(cmt._id)
            .populate('user', '-password')
            .populate('team')
            .populate('project');

        cmt = await Team.populate(cmt, {
            path: "team.teamLeader",
            select: "-password"
        })

        cmt = await Team.populate(cmt, {
            path: "team.members",
            select: "-password"
        })

        res.status(200).json({ success: true, cmt });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

router.get('/getComments/:id', FetchUser, async (req, res) => {
    try {
        const comments = await Comment.find({ project: req.params.id })
            .populate('user', '-password')
            .populate('project');
            
        res.status(200).json({ success: true, comments });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

router.delete('/deleteComment/:id', FetchUser, async (req, res) => {
    try {
        const comment = await Comment.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, comment });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
})

module.exports = router;