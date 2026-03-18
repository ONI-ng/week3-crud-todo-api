const express = require('express');
const cors = require('cors');
const logger = require('./middleware/logger');
const validateTodo = require('./middleware/validator');
const errorhandler = require('./middleware/errorHandler');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(logger);

let todos = [
    { id: 1, task: 'Learn Node.js', completed: false },
    { id: 2, task: 'Build CRUD API', completed: false }
];

app.get('/todos', (req, res) => {
    res.status(200).json(todos);
});

app.get('/todos/:id', (req, res, next) => {
    const { id } = req.params;
    const todo = todos.find(t => t.id === parseInt(id));

    if (!todo) {
        const error = new Error(`ID ${id} not found`);
        error.status = 404;
        return next(error);
    }

    res.status(200).json(todo);
});

app.post('/todos', validateTodo, (req, res) => {
    const newTodo = {
        id: todos.length + 1,
        task: req.body.task,
        completed: req.body.completed || false
    };
    todos.push(newTodo);
    res.status(201).json(newTodo);
});

app.patch('/todos/:id', validateTodo, (req, res, next) => {
    const { id } = req.params;
    const todo = todos.find(t => t.id === parseInt(id));

    if (!todo) {
        const error = new Error(`ID ${id} not found`);
        error.status = 404;
        return next(error);
    }

    if (req.body.task) todo.task = req.body.task;
    if (req.body.completed !== undefined) todo.completed = req.body.completed;

    res.status(200).json(todo);
});

app.delete('/todos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const todoIndex = todos.findIndex(t => t.id === id);

    if (todoIndex === -1) {
        return res.status(404).json({ message: `ID ${id} not found` });
    }

    todos.splice(todoIndex, 1);
    res.status(200).json({ message: `ID ${id} deleted successfully` });
});

app.use(errorhandler);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});