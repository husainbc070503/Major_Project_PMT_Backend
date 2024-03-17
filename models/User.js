const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },

    email: {
        type: String,
        required: true,
    },

    password: {
        type: String,
        required: true,
    },

    experience: {
        type: Number,
        required: true,
    },

    linkedin: {
        type: String,
        required: true,
    },

    profilePic: {
        type: String,
        required: true,
    },

    expertise: [
        {
            type: String,
            required: true,
        }
    ],

    github: String,
    linkedin: String,

    role: {
        type: String,
        enums: ['user', 'guide', 'admin'],
        default: 'user'
    },

    addedToTeam: {
        type: Boolean,
        default: false,
    },

    projects: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'project'
    }],

    rating: {
        type: Number,
        default: 4
    }

}, { timestamps: true });

UserSchema.pre('save', async function (next) {
    var user = this;
    if (!user.isModified('password'))
        return next();

    try {
        const salt = await bcryptjs.genSalt(10);
        const secPassword = await bcryptjs.hash(user.password, salt);
        user.password = secPassword;
    } catch (error) {
        next(error);
    }
});

UserSchema.methods.validatePassword = async function (password) {
    try {
        const res = await bcryptjs.compare(password, this.password);
        return res;
    } catch (error) {
        console.log(error.message);
    }
}

UserSchema.methods.generateToken = async function () {
    try {
        return jwt.sign(
            {
                userId: this._id.toString(),
                email: this.email,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "10d"
            }
        )
    } catch (error) {
        console.log(error);
    }
}

const User = mongoose.model('user', UserSchema);
module.exports = User;