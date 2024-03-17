require('dotenv').config();
const FetchUser = require('../middleware/FetchUser');
const ValidateInput = require('../middleware/ValidateInput');
const Task = require('../models/Tasks');
const AddTask = require('../validators/TaskValidator');
const router = require('express').Router();
const nodemailer = require('nodemailer');

const sendMail = async (email, teamLeaderName) => {
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
        subject: 'Project Management App - Task Assignment',
        html: `<h4>Your teamleader ${teamLeaderName} has assigned task to you!. Please login and check details!</h4>`
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
        subject: 'Project Management App - Task Due',
        html: `<h4>This is to notify that your task is pending and is not completed. Please complete it before time. <br> Thank you</h4>`
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

const sendVerificationMail = async (email) => {
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
        html: `<h4>Your team leader has verified your work. <br> If verified properly then it will go directly to the guide for further verification else view it in in progress stage with fault message. <br><br>Thank you</h4>`
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

const deleteNotificationMailToLeader = async (name, email, task) => {
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
        subject: 'Project Management App - Task Deletion',
        html: `<p>
        Hello, this is admin from PMA. This mail is to inform you that one of your team member ${name} has not completed the task or not submitted the task. <br>
        Hence, I have deleted the task. Now you can assign new task and inform your team member to complete it before time. <br>
        <h4>Task Details: </h4>
        <h4>Name: </h4><span>${task?.name}</span>
        <h4>Description: </h4><span>${task?.description}</span><br>
        Thank You
        </p>`
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

const deleteNotificationMailToMember = async (email) => {
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
        subject: 'Project Management App - Task Deletion',
        html: `<h4>You have not completed your task and been deleted. Your team leader will assign new task and complete it well before time!!</h4>`
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

router.post('/addTask', ValidateInput(AddTask), FetchUser, async (req, res) => {
    try {
        var task = await Task.create(req.body);
        task = await Task.findById(task._id)
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
        })

        sendMail(task.assignedTo.email, task.project.team.teamLeader.name)
        res.status(200).json({ success: true, task });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

router.put('/updateTaskText/:id', FetchUser, async (req, res) => {
    try {
        var task = await Task.findByIdAndUpdate(req.params.id, { ...req.body }, { new: true })
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
        })

        res.status(200).json({ success: true, task });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

router.put('/updateTaskStage/:id', FetchUser, async (req, res) => {
    const { stage, attachment } = req.body;

    try {
        var task = await Task.findByIdAndUpdate(req.params.id, { stage, attachment, isVerifiedByTeamLeader: false, isVerifiedByGuide: false, assignedUserRequestedToChangeStage: false, leaderMessage: "", guideMessage: "" }, { new: true })
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
        })

        res.status(200).json({ success: true, task });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

router.put('/uploadCodeFile/:id', FetchUser, async (req, res) => {
    const { codeFile } = req.body;

    try {
        var task = await Task.findByIdAndUpdate(req.params.id, { codeFile }, { new: true })
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
        })

        res.status(200).json({ success: true, task });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

router.put('/uploadedToGithub/:id', FetchUser, async (req, res) => {
    try {
        var task = await Task.findByIdAndUpdate(req.params.id, { codeFile: { uploadedToGit: true } }, { new: true })
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
        })

        res.status(200).json({ success: true, task });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

router.put('/requestTask/:id', FetchUser, async (req, res) => {
    try {
        var task = await Task.findByIdAndUpdate(req.params.id, { assignedUserRequestedToChangeStage: true }, { new: true })
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
        })

        res.status(200).json({ success: true, task });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

router.delete('/deleteTask/:id', FetchUser, async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, task });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

router.delete('/adminDeleteTask/:id', FetchUser, async (req, res) => {
    try {
        const { assignedToName, assignedToEmail, teamLeaderEmail } = req.query;
        const task = await Task.findByIdAndDelete(req.params.id);

        deleteNotificationMailToLeader(assignedToName, teamLeaderEmail, task);
        deleteNotificationMailToMember(assignedToEmail);

        res.status(200).json({ success: true, task });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
})

router.get('/getAllTasks/:id', FetchUser, async (req, res) => {
    try {
        var tasks = await Task.find({ project: req.params.id })
            .populate('project')
            .populate('assignedTo');

        tasks = await Task.populate(tasks, {
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

        res.status(200).json({ success: true, tasks });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

router.get('/tasks', FetchUser, async (req, res) => {
    try {
        var tasks = await Task.find()
            .populate('project')
            .populate('assignedTo');

        tasks = await Task.populate(tasks, {
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

        res.status(200).json({ success: true, tasks });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
})

router.put('/teamLeaderVerifyTask/:id', FetchUser, async (req, res) => {
    try {
        var task = await Task.findByIdAndUpdate(req.params.id, { isVerifiedByTeamLeader: true, stage: "to verify by guide" }, { new: true })
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

        sendVerificationMail(task?.assignedTo?.email);
        res.status(200).json({ success: true, task });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

router.put('/teamLeaderUnVerifyTask/:id', FetchUser, async (req, res) => {
    try {
        const { message } = req.body;
        var task = await Task.findByIdAndUpdate(req.params.id, { isVerifiedByTeamLeader: true, leaderMessage: message, stage: "inProgress" }, { new: true })
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

        sendVerificationMail(task?.assignedTo?.email);
        res.status(200).json({ success: true, task });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

router.post('/sendDueEmail', FetchUser, async (req, res) => {
    try {
        const { email } = req.body;
        sendDueNotification(email);
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message })
    }
});

module.exports = router;