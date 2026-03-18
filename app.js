const express = require('express');
const cors = require('cors');
const app = express();
const Joi = require( 'joi' );

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} request to ${req.url}`);
  next();
});

let todos = [
  { id: 1, task: 'Learn Node.js', completed: false },
  { id: 2, task: 'Build CRUD API', completed: false },
];

// GET All – Read
app.get('/todos', (req, res, next) => {
  try {
    res.status(200).json(todos);
  } catch (error) {
    next(error); // This sends the mistake to the Global Error Handler at the bottom!
  }
});

// POST New – Create
app.post('/todos', (req, res, next) => {
  try {
    const schema = Joi.object({
      task: Joi.string().min(3).required(),
      completed: Joi.boolean().default(false)
    });

    const { error } = schema.validate(req.body);

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const newTodo = {
      id: todos.length + 1,
      task: req.body.task,
      completed: req.body.completed || false
    };

    todos.push(newTodo);
    res.status(201).json(newTodo);
  } catch (err) {
    next(err);
  }
});

// PATCH Update – Partial
app.patch('/todos/:id', (req, res, next) => {
  try {
    // 1. The Measuring Stick (Rule)
    const schema = Joi.object({
      task: Joi.string().min(3),
      completed: Joi.boolean()
    });

    // 2. Check the message
    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    // 3. Find and update the task
    const id = parseInt(req.params.id);
    const todo = todos.find(t => t.id === id);
    if (!todo) return res.status(404).json({ error: "Todo not found" });

    Object.assign(todo, req.body);
    res.status(200).json(todo);
  } catch (err) {
    next(err);
  }
});

// DELETE Remove
app.delete('/todos/:id', (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const initialLength = todos.length;
    todos = todos.filter((t) => t.id !== id); // Array.filter() – non-destructive
    if (todos.length === initialLength)
      return res.status(404).json({ error: 'Not found' });
    res.status(204).send(); // Silent success
  } catch (err) {
    next(err);
  }
});

app.get('/todos/active', (req, res) => {
    const activeTodos = todos.filter(t => t.completed === false);
    res.json(activeTodos);
});

app.get('/todos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const todo = todos.find(t => t.id === id);

    if (!todo) {
        return res.status(404).json({ error: "Todo not found" });
    }
    res.json(todo);
});

app.use((err, req, res, next) => {
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
