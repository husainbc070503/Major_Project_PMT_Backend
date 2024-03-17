const ValidateInput = (schema) => async (req, res, next) => {
    try {
        const parseBody = await schema.parseAsync(req.body);
        req.body = parseBody;
        next();
    } catch (err) {
        // res.status(400).json({ message: err.issues[0].message });
        const error = {
            status: 400,
            message: err.issues[0].message,
        };
        next(error);
    }
}

module.exports = ValidateInput;