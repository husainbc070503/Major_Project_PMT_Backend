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
        .string({ required_error: "Expertise is required" })
        .array(),

    linkedin: z
        .string({ required_error: "Linked In Profile is required" })
        .min(1, { message: "Linkedin profile should not be emtpty" }),

    experience: z
        .string({ required_error: "Experience is required" })
        .min(1, { message: "Experience should not be emtpty" }),
});

module.exports = Register