const { z } = require('zod');

const Register = z.object({
    name: z
        .string({ required_error: "Name is required" })
        .trim(),

    email: z
        .string({ required_error: "Email is required" })
        .trim()
        .email({ message: "Invalid email address" }),

    password: z
        .string({ required_error: "Password is required" })
        .min(8, { message: "Password must be atleast 8 characters long!" })
        .refine((value) => /[a-z]/.test(value), { message: 'Password must contain atleast one lowercase alphabet.' })
        .refine((value) => /[A-Z]/.test(value), { message: 'Password must contain atleast one uppercase alphabet.' })
        .refine((value) => /[0-9]/.test(value), { message: 'Password must contain atleast one digit.' })
        .refine((value) => /[^a-zA-Z0-9]/.test(value), { message: 'Password must contain atleast one special character.' }),

    profilePic: z
        .string({ required_error: "Profile picture is required" })
        .trim(),

    expertise: z
        .string()
        .array(),

    linkedin: z.string(),
    experience: z.number(),
    role: z
        .string({ required_error: "Role is required" })
        .min(1, { message: "Role must be chosen" })
});

const Login = z.object({
    email: z
        .string({ required_error: "Email is required" })
        .trim()
        .email({ message: "Invalid email address" }),

    password: z
        .string({ required_error: "Password is required" })
        .min(1, { message: "Password should not be empty!" }),

    role: z
        .string({ required_error: "Role is required" })
        .min(1, { message: "Role must be chosen" })
});

const SendOtp = z.object({
    email: z
        .string({ required_error: "Email is required" })
        .email({ message: "Invalid email address" })
});

const PasswordChange = z.object({
    email: z
        .string({ required_error: "Email is required" })
        .email({ message: "Invalid email address" }),

    password: z
        .string({ required_error: "Password is required" })
        .min(8, { message: "Password must be atleast 8 characters long!" })
        .refine((value) => /[a-z]/.test(value), { message: 'Password must contain atleast one lowercase alphabet.' })
        .refine((value) => /[A-Z]/.test(value), { message: 'Password must contain atleast one uppercase alphabet.' })
        .refine((value) => /[0-9]/.test(value), { message: 'Password must contain atleast one digit.' })
        .refine((value) => /[^a-zA-Z0-9]/.test(value), { message: 'Password must contain atleast one special character.' }),

    otp: z
        .string({ required_error: "OTP is required" })
});

module.exports = { Register, Login, SendOtp, PasswordChange };