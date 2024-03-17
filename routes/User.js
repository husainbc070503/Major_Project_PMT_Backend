require('dotenv').config();
const router = require('express').Router();
const User = require('../models/User');
const FetchUser = require('../middleware/FetchUser');
const nodemailer = require('nodemailer');
const Otp = require('../models/Otp');
const ValidateInput = require('../middleware/ValidateInput');
const { Register, Login, SendOtp, PasswordChange } = require('../validators/AuthValidator');
const bcryptjs = require('bcryptjs');
const { google } = require('googleapis');
const Project = require('../models/Projects');
const uuidv4 = require('uuid').v4;

const sendMail = async (name, email, otp) => {
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
        subject: 'Project Management Tool - Change Password OTP',
        html: `<h4>Dear, ${name} <br> Thank you for choosing PMT. <br> To ensure the security of your account, please use the following One-Time Password (OTP) for updating password: <br>
        <h2> OTP: ${otp} </h2></h4> <h4> If you didn't requested this OTP or have any concerns about your account security, please contact our support team immediately. <br>Thank you for your cooperation.</h4>`
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

const sendVerificationMail = async (email, otp) => {
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
        subject: 'Project Management App - Verify Email',
        html: `<h4>To verify your email address, please enter the below OTP. <br><h2>${otp}</h2> It is only valid for 5 minutes.<br> Thank you!!</h4>`
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

const passwordUpdateMail = async (name, email) => {
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
        subject: 'Project Management Tool - Password Updated',
        html: `<h4>Dear, ${name} <br> Thank you for choosing PMT. <br> Your password for your account has been updated. If it wasn't you, please contact us immediately. <br> Thank you</h4></h4>`
    }

    await new Promise((resolve, reject) => {
        transporter.sendMail(options, (err, info) => {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                console.log("Emailed successfully");
                resolve(info);
            }
        })
    })
}

const oAuth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'https://project-pmt.netlify.app'
    // 'http://localhost:3000'
);

router.get('/callback', async (req, res) => {
    try {
        const authUrl = oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: ['https://www.googleapis.com/auth/calendar'],
            response_type: 'code',
        });

        res.status(200).json(authUrl);

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
});

router.post('/create-event', async (req, res) => {
    try {
        const { code } = req.query;
        const { summary, description, location, start, end, members, _id } = req.body;

        const { tokens } = await oAuth2Client.getToken(code);
        oAuth2Client.setCredentials(tokens);

        const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });
        await calendar.events.insert(
            {
                calendarId: 'primary',
                conferenceDataVersion: 1,
                resource: {
                    summary: summary,
                    description: description,
                    location: location,
                    start: {
                        dateTime: new Date(start),
                        timeZone: 'Asia/Kolkata',
                    },
                    end: {
                        dateTime: new Date(end),
                        timeZone: 'Asia/Kolkata',
                    },
                    attendees: members,
                    reminders: {
                        useDefault: false,
                        overrides: [
                            { method: 'email', minutes: 5 },
                            { method: 'popup', minutes: 10 },
                        ],
                    },
                    colorId: Math.floor(Math.random() * 11) + 1,
                    conferenceData: {
                        createRequest: {
                            conferenceSolutionKey: {
                                type: "hangoutsMeet"
                            },
                            requestId: uuidv4(),
                        },
                    },
                },
            },
            async (err, event) => {
                if (err) {
                    console.error('Error creating event:', err);
                    return;
                }

                var project = await Project.findByIdAndUpdate(_id, {
                    meetDetails:
                    {
                        hangoutLink: event.data.hangoutLink,
                        startDateTime: new Date(start),
                        endDateTime: new Date(end)
                    }
                }, { new: true })
                    .populate('user', '-password')
                    .populate('team')
                    .populate('guide');

                project = await Project.populate(project, {
                    path: 'team',
                    populate: [
                        { path: 'teamLeader', select: '-password' },
                        { path: 'members', select: '-password' }
                    ]
                })

                return res.status(200).json({ success: true, project });
            }
        );

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
});


router.post('/register', ValidateInput(Register), async (req, res) => {
    try {
        var user = await User.findOne({ email: req.body.email });
        if (user)
            return res.status(400).json({ success: false, message: 'User already exists' });

        const admin = await User.findOne({ role: "admin" });
        if (req.body.role === 'admin' && admin)
            return res.status(400).json({ success: false, message: 'Only one admin per project' });

        user = await User.create({ ...req.body });
        res.status(200).json({ success: true, user });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message })
    }
});

router.post('/login', ValidateInput(Login), async (req, res) => {
    const { email, password, role } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user || !await user.validatePassword(password))
            return res.status(400).json({ success: false, message: 'Invalid Credentials' });

        if (role !== user?.role)
            return res.status(400).json({ success: false, message: "Role not valid" })

        console.log(await user.generateToken());
        res.status(200).json({ success: true, user: { user, token: await user.generateToken() } });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message })
    }
});

router.get('/getUser', FetchUser, async (req, res) => {
    const keyword = req.query.search ? {
        $or: [
            { name: { $regex: req.query.search, $options: "i" } },
            { email: { $regex: req.query.search, $options: "i" } }
        ]
    } : { success: false, message: "No user found" };

    try {
        const user = await User.find(keyword).find({ _id: { $ne: req.user._id }, addedToTeam: false });
        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message })
    }
});

router.put('/updateProfile', FetchUser, async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.user._id, { ...req.body }, { new: true });
        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message })
    }
});

router.post('/sendOtp', ValidateInput(SendOtp), async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user)
            return res.status(400).json({ success: false, message: 'No user Fetched. Please Register' });

        const otp = await Otp.create({
            email,
            otp: Math.floor(1000 + Math.random() * 9000),
            expiresIn: new Date().getTime() * 5 * 60 * 1000
        })

        sendMail(user.name, email, otp.otp);
        res.status(200).json({ success: true, otp });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message })
    }
});

router.post('/verifyEmail', ValidateInput(SendOtp), async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (user)
            return res.status(200).json({ success: false, message: "User already exists!" })

        const otp = await Otp.create({
            email,
            otp: Math.floor(1000 + Math.random() * 9000),
            expiresIn: new Date().getTime() * 5 * 60 * 1000
        });

        sendVerificationMail(email, otp.otp);
        res.status(200).json({ success: true });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

router.post('/verify', async (req, res) => {
    try {
        const { otp, email } = req.body;
        const isOtp = await Otp.findOne({ otp, email });

        if (isOtp)
            return res.status(200).json({ success: true });

        return res.status(200).json({ success: false });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
})

router.put('/changePassword', ValidateInput(PasswordChange), async (req, res) => {
    const { otp, password, email } = req.body;

    try {
        const validOtp = await Otp.findOne({ email, otp });

        if (validOtp) {
            const diff = validOtp.expiresIn - new Date().getTime();

            if (diff < 0)
                return res.status(400).json({ success: false, message: 'OTP Expired' });

            const salt = await bcryptjs.genSalt(10);
            const secPass = await bcryptjs.hash(password, salt);

            const user = await User.findOneAndUpdate({ email }, { password: secPass }, { new: true });
            passwordUpdateMail(user.name, email);
            res.status(200).json({ success: true, user });
        }
        else {
            return res.status(400).json({ success: false, message: 'Invalid OTP' })
        }
    } catch (error) {
        res.status(400).json({ success: false, message: error.message })
    }
});

router.get('/users', FetchUser, async (req, res) => {
    try {
        const users = await User.find({ role: "user" });
        res.status(200).json({ success: true, users });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

module.exports = router;