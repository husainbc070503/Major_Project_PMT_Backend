require('dotenv').config();
const FetchUser = require('../middleware/FetchUser');
const Contact = require('../models/Contact');
const router = require('express').Router();
const nodemailer = require('nodemailer');

const sendReply = async (email, reply, message) => {
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
        subject: 'Project Managament App - Contact reply from administrator',
        html: `<p>Admin has reviewed your message and reverted with following message: </p><h4>Your question - ${message}</h4><h4>Admin Reply - ${reply}</h4>`
    }

    await new Promise((resolve, reject) => {
        transporter.sendMail(options, (err, info) => {
            if (err) {
                console.log(err.message)
                reject(err);
            } else {
                console.log('Email sent successfully')
                resolve(info);
            }
        });
    });
}

router.post('/contact', async (req, res) => {
    try {
        const { name, email, phone, message } = req.body;

        if (!name)
            return res.status(400).json({ success: false, message: "Name is required" });

        if (!email)
            return res.status(400).json({ success: false, message: "Email is required" });

        if (!phone)
            return res.status(400).json({ success: false, message: "Phone No. is required" });

        if (!message)
            return res.status(400).json({ success: false, message: "Message is required" });

        const contact = await Contact.create({ name, email, message, phone });
        res.status(200).json({ success: true, contact });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

router.get('/contacts', FetchUser, async (req, res) => {
    try {
        const contacts = await Contact.find();
        res.status(200).json({ success: true, contacts });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

router.delete('/reply/:id', FetchUser, async (req, res) => {
    try {
        const { email, reply, message } = req.body;
        sendReply(email, reply, message);
        await Contact.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

module.exports = router;