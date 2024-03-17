require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const connectDB = require('./db/conn');
const ErrorHandler = require('./handlers/ErrorHandler');
const port = process.env.PORT

app.use(cors());
app.use(express.json());
connectDB();

app.get('/', (req, res) => res.json("Hello World"));

app.use('/api/user', require('./routes/User'));
app.use('/api/project', require('./routes/Projects'));
app.use('/api/task', require('./routes/Tasks'));
app.use('/api/team', require('./routes/Team'));
app.use('/api/comment', require('./routes/Comment'));
app.use('/api/guide', require('./routes/Guide'));
app.use('/api/contact', require('./routes/Contact'));

app.use(ErrorHandler);
app.listen(port, () => console.log(`Server running on port ${port}`));