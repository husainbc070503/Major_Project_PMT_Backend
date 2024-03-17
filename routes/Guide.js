const FetchUser = require('../middleware/FetchUser');
const Project = require('../models/Projects');
const Task = require('../models/Tasks');
const Team = require('../models/Team');
const User = require('../models/User');
const router = require('express').Router();
const nodemailer = require('nodemailer');

const sendMail = async (email) => {
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
        subject: 'Project Management App - Task Verfication',
        html: `<h4>Guide has verified your work you kept under review. <br> If verified properly then it will go direct to complete stage else view it in in progress stage with guide message. <br><br> Thank you</h4>`
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

router.get('/guides', FetchUser, async (req, res) => {
    try {
        const guides = await User.find({ role: "guide" });
        res.status(200).json({ success: true, guides });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

router.put('/acceptApproval/:id/:pid', FetchUser, async (req, res) => {
    try {
        const { guide, status } = req.body;
        const { id, pid } = req.params;

        var project = await Project.findOneAndUpdate({ _id: pid, team: id }, { approvalStatus: status }, { new: true })
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

        var guideObj = await User.findByIdAndUpdate(guide, { $push: { projects: project } }, { new: true });
        guideObj = await User.populate(guideObj, {
            path: 'projects',
            populate: [
                { path: 'user', select: '-password' },
                {
                    path: 'team', populate: [
                        {
                            path: 'teamLeader',
                            select: "-password"
                        }, {
                            path: "members",
                            select: "-password"
                        }
                    ]
                },
                { path: 'guide', select: "-password" }
            ]
        });

        res.status(200).json({ success: true, result: { project, guideObj } });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message })
    }
});

router.put('/rejectApproval/:id/:pid', FetchUser, async (req, res) => {
    try {
        const { status } = req.body;
        var project = await Team.findOneAndUpdate({ _id: pid, team: id }, { approvalStatus: status, guide: null }, { new: true })
            .populate('team')
            .populate('user', '-password')

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
        res.status(400).json({ success: false, message: error.message })
    }
});

router.put('/verifyTask/:id', FetchUser, async (req, res) => {
    try {
        var task = await Task.findByIdAndUpdate(req.params.id, { isVerifiedByGuide: true, stage: "completed" }, { new: true })
            .populate('project')
            .populate('assignedTo');

        task = await Task.populate(task, {
            path: 'project',
            populate: [
                { path: 'user', select: '-password' },
                {
                    path: 'team',
                    populate: [
                        { path: 'teamLeader', select: '-password' },
                        { path: 'members', select: '-password' }
                    ]
                }
            ]
        });

        sendMail(task?.assignedTo?.email);
        res.status(200).json({ success: true, task });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

router.put('/unverifyTask/:id', FetchUser, async (req, res) => {
    try {
        const { message } = req.body;
        var task = await Task.findByIdAndUpdate(req.params.id, { isVerifiedByGuide: true, guideMessage: message, stage: "inProgress" }, { new: true })
            .populate('project')
            .populate('assignedTo');

        task = await Task.populate(task, {
            path: 'project',
            populate: [
                { path: 'user', select: '-password' },
                {
                    path: 'team',
                    populate: [
                        { path: 'teamLeader', select: '-password' },
                        { path: 'members', select: '-password' }
                    ]
                }
            ]
        });

        sendMail(task?.assignedTo?.email);
        res.status(200).json({ success: true, task });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

module.exports = router;