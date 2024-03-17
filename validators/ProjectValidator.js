const { z } = require('zod');

const AddProject = z.object({
    title: z
        .string({ required_error: "Name is required" })
        .min(1, { message: "Title is required" })
        .trim(),

    description: z
        .string({ required_error: "Description is required" })
        .min(1, { message: "Description is required" })
        .trim(),

    start: z
        .string({ required_error: "Start Date is required" })
        .min(1, { message: "Start Date is required" }),

    end: z
        .string({ required_error: "End Date is required" })
        .min(1, { message: "End Date is required" }),

    projectGithubRepository: z.string(),
    isTeamProject: z.boolean(),
    team: z.string(),
    noOfTasks: z.number()
});

module.exports = AddProject;