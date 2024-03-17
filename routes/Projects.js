const { Authorization, Redirect } = require('../handlers/LinkedinHandler');
const FetchUser = require('../middleware/FetchUser');
const ValidateInput = require('../middleware/ValidateInput');
const Project = require('../models/Projects');
const Team = require('../models/Team');
const User = require('../models/User');
const AddProject = require('../validators/ProjectValidator');
const router = require('express').Router();
const nodemailer = require('nodemailer');

const sendDueNotification = async (email) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        port: 587,
        secure: true,
        auth: {
            user: process.env.USER,
            pass: process.env.PASSWORD
        },
        tls: { rejectUnauthorized: false }
    });

    const options = {
        from: process.env.USER,
        to: email,
        subject: 'Project Management App - Project Due',
        html: `<h4>This is to notify that your project end date is approaching and it's still not completed. <br> Please update the end date as you are the team leader you can edit. <br> Thank you</h4>`
    }

    await new Promise((resolve, reject) => {
        transporter.sendMail(options, (err, info) => {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                console.log('Email Sent Successfully.');
                resolve(info);
            }
        });
    });
}

/* Create Project */
router.post('/createProject', FetchUser, ValidateInput(AddProject), async (req, res) => {
    try {
        let project = await Project.create({ ...req.body, user: req.user._id });
        project = await Project.findById(project._id).populate('user', '-password').populate('team');

        project = await Team.populate(project, {
            path: "team.teamLeader",
            select: "-password"
        })

        project = await Team.populate(project, {
            path: "team.members",
            select: "-password"
        })

        res.status(200).json({ success: true, project });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

router.put('/updateProject/:id', FetchUser, async (req, res) => {
    try {
        let project = await Project.findByIdAndUpdate(req.params.id, { ...req.body }, { new: true })
            .populate('user', '-password')
            .populate('team');

        project = await Team.populate(project, {
            path: "team.teamLeader",
            select: "-password"
        })

        project = await Team.populate(project, {
            path: "team.members",
            select: "-password"
        })

        res.status(200).json({ success: true, project });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

router.delete('/deleteProject/:id', FetchUser, async (req, res) => {
    try {
        const project = await Project.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, project });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

router.get('/getAllProjects', FetchUser, async (req, res) => {
    try {
        const projects = await Project.find({ user: req.user._id, isTeamProject: false })
            .populate('user', '-pasword')
            .sort({ start: 1 });

        res.status(200).json({ success: true, projects });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

router.get('/projects', FetchUser, async (req, res) => {
    try {
        var projects = await Project.find({ isTeamProject: true })
            .populate('user', '-password')
            .populate('guide', '-password')
            .populate('team')

        projects = await Project.populate(projects, {
            path: 'team',
            populate: [
                {
                    path: 'teamLeader',
                    select: "-password"
                }, {
                    path: "members",
                    select: "-password"
                }
            ]
        })

        res.status(200).json({ success: true, projects });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
})

router.get('/getProject/:id', FetchUser, async (req, res) => {
    try {
        let project = await Project.findById(req.params.id)
            .populate('user', '-password')
            .populate('guide', '-password')
            .populate('team')

        project = await Team.populate(project, {
            path: "team.teamLeader",
            select: "-password"
        })

        project = await Team.populate(project, {
            path: "team.members",
            select: "-password"
        })

        res.status(200).json({ success: true, project });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

router.get('/getTeamProjects/:id', FetchUser, async (req, res) => {
    try {
        let projects = await Project.find({ team: req.params.id })
            .populate('user', '-password')
            .populate('guide', '-password')
            .populate('team')
            .sort({ updatedAt: 1 });

        projects = await Project.populate(projects, {
            path: "team",
            populate: [
                {
                    path: 'teamLeader',
                    select: "-password"
                }, {
                    path: "members",
                    select: "-password"
                }
            ]
        });

        res.status(200).json({ success: true, projects });

    } catch (error) {
        res.status(400).json({ success: true, message: error.message });
    }
});

router.put('/requestGuide/:id/:pid', FetchUser, async (req, res) => {
    try {
        const { status, guide } = req.body;
        const { id, pid } = req.params;

        var project = await Project.findOneAndUpdate({ _id: pid, team: id }, { approvalStatus: status, guide }, { new: true })
            .populate('team')
            .populate('user', '-password')
            .populate('guide', '-password');

        project = await Project.populate(project, {
            path: "team",
            populate: [
                {
                    path: 'teamLeader',
                    select: "-password"
                }, {
                    path: "members",
                    select: "-password"
                }
            ]
        });

        res.status(200).json({ success: true, project });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

router.put('/deleteMeetEvent/:id', FetchUser, async (req, res) => {
    try {
        var project = await Project.findByIdAndUpdate(req.params.id, { meetDetails: null }, { new: true })
            .populate('team')
            .populate('user', '-password')
            .populate('guide', '-password');

        project = await Project.populate(project, {
            path: "team",
            populate: [
                {
                    path: 'teamLeader',
                    select: "-password"
                }, {
                    path: "members",
                    select: "-password"
                }
            ]
        });

        res.status(200).json({ success: true, project });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

router.put('/updateGitDetails/:id', FetchUser, async (req, res) => {
    try {
        var project = await Project.findByIdAndUpdate(req.params.id, { gitHubDetails: { ...req.body } }, { new: true })
            .populate('team')
            .populate('user', '-password')
            .populate('guide', '-password');

        project = await Project.populate(project, {
            path: "team",
            populate: [
                {
                    path: 'teamLeader',
                    select: "-password"
                }, {
                    path: "members",
                    select: "-password"
                }
            ]
        });

        res.status(200).json({ success: true, project });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

var postBody = {};
router.post('/post/linkedin/authorize', FetchUser, async (req, res) => {
    try {
        postBody = req.body;
        res.status(200).json({ success: true, url: Authorization() });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

router.get('/post/linkedin/redirect', async (req, res) => {
    try {
        res.redirect(await Redirect(req.query.code, postBody));
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

router.put('/giveRating/:id/:gid', FetchUser, async (req, res) => {
    try {
        const { rating, feedbackToGuide } = req.body;
        const { gid, id } = req.params;

        var guide = await User.findById(gid);
        var value = ((guide.rating + rating) / 2).toFixed(1);

        const pro = await Project.findByIdAndUpdate(id, { feedbackToGuide }, { new: true });
        await User.findByIdAndUpdate(gid, { rating: value }, { new: true });

        res.status(200).json({ success: true, pro });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

router.put('/guideFeedback/:id', FetchUser, async (req, res) => {
    try {
        const pro = await Project.findByIdAndUpdate(req.params.id, { ...req.body }, { new: true });
        res.status(200).json({ success: true, pro });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

router.post('/sendDueProject', FetchUser, async (req, res) => {
    try {
        const { email } = req.body;
        sendDueNotification(email);
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message })
    }
});

module.exports = router;