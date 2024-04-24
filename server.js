const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // Add this line to load environment variables from a .env file

const app = express();
const port = process.env.PORT || 5000; // Use the PORT environment variable if available, or default to 5000
app.use(cors());
// Connect to MongoDB using environment variable
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

const taskSchema = new mongoose.Schema({
    title: String,
    description: String,
});

const Task = mongoose.model('Task', taskSchema);

app.use(express.static('public'));
app.use(express.json()); // Add this line to parse JSON requests

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// GET all tasks
app.get('/api/tasks', (req, res) => {
    Task.find({}, (err, tasks) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        } else {
            res.json(tasks);
        }
    });
});

// POST a new task
app.post('/api/tasks', (req, res) => {
    const newTask = new Task(req.body);
    newTask.save((err, task) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        } else {
            res.json(task);
        }
    });
});

// PUT (update) a task
app.put('/api/tasks/:id', (req, res) => {
    const taskId = req.params.id;
    Task.findByIdAndUpdate(taskId, req.body, { new: true }, (err, task) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        } else {
            res.json(task);
        }
    });
});

// DELETE a task
app.delete('/api/tasks/:id', (req, res) => {
    const taskId = req.params.id;
    Task.findByIdAndRemove(taskId, (err) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        } else {
            res.send('Task deleted successfully');
        }
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
