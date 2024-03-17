const { z } = require('zod');

const AddTask = z.object({
    name: z
        .string({ required_error: "Name is required" })
        .min(1, { message: "Name is required" })
        .trim(),

    description: z
        .string({ required_error: "Description is required" })
        .min(1, { message: "Description is required" })
        .trim(),

    project: z.string(),

    dueDate: z
        .string({ required_error: "Due date is required" })
        .min(1, { message: "Due Date is required" }),

    assignedTo: z
        .string({ required_error: "User not assigned. Please assign user" })
        .min(1, { message: "User not assigned. Please assign user" })
});

module.exports = AddTask;