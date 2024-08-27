const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;
app.use(express.json());

const filePath = path.join(__dirname, 'todos.json');

// Function to read todos from file
function readTodosFromFile() {
    if (!fs.existsSync(filePath)) {
        return [];
    }
    const todos = fs.readFileSync(filePath, 'utf-8');
    try {
        return JSON.parse(todos);
    } catch (error) {
        console.error("Error parsing JSON from file:", error);
        return [];
    }
}

// Function to write todos to file
function writeTodosToFile(todos) {
    fs.writeFileSync(filePath, JSON.stringify(todos, null, 2));
}

// Create a todo
app.post("/todos", (req, res) => {
    try {
        const { id, todo } = req.body;

        if (!id || !todo) {
            return res.status(400).json({ message: "Enter Id and Todo" });
        }

        const todos = readTodosFromFile();
        const existingTodo = todos.find(t => t.id === id);
        if (existingTodo) {
            return res.status(400).json({ message: "Todo with this id already exists!" });
        }

        todos.push({ id, todo });
        writeTodosToFile(todos);

        return res.status(200).json({
            message: "Todo created successfully!",
            todo: { id, todo },
        });
    } catch (error) {
        res.status(500).json({ message: 'Unexpected error in creating Todo!', error: error.message });
    }
});

// Read all todos
app.get("/todos", (req, res) => {
    try {
        const todos = readTodosFromFile();
        return res.status(200).json(todos);
    } catch (error) {
        res.status(500).json({ message: 'Unexpected error occurred!', error: error.message });
    }
});

// Read todo by id
app.get("/todos/:id", (req, res) => {
    try {
        const { id } = req.params;
        const todos = readTodosFromFile();

        const todo = todos.find(t => t.id === parseInt(id));

        if (!todo) {
            return res.status(404).json({ message: "Todo not found!" });
        }

        return res.status(200).json({
            message: "Here is the todo!",
            todo: todo,
        });
    } catch (error) {
        res.status(500).json({ message: 'Unexpected error occurred!', error: error.message });
    }
});

// Update todo by id
app.put("/todos/:id", (req, res) => {
    try {
        const { id } = req.params;
        const { todo } = req.body;

        if (!todo) {
            return res.status(400).json({ message: "Todo content is required!" });
        }

        const todos = readTodosFromFile();
        const todoIndex = todos.findIndex(t => t.id === parseInt(id));

        if (todoIndex === -1) {
            return res.status(404).json({ message: "Todo not found!" });
        }

        todos[todoIndex].todo = todo;
        writeTodosToFile(todos);

        return res.status(200).json({
            message: "Todo updated successfully!",
            todo: todos[todoIndex],
        });
    } catch (error) {
        res.status(500).json({ message: 'Unexpected error occurred!', error: error.message });
    }
});

// Delete todo by id
app.delete("/todos/:id", (req, res) => {
    try {
        const { id } = req.params;
        const todos = readTodosFromFile();
        const todoIndex = todos.findIndex(t => t.id === parseInt(id));

        if (todoIndex === -1) {
            return res.status(404).json({ message: "Todo not found!" });
        }

        todos.splice(todoIndex, 1);
        writeTodosToFile(todos);

        return res.status(200).json({ message: "Todo deleted successfully!" });
    } catch (error) {
        res.status(500).json({ message: 'Unexpected error occurred!', error: error.message });
    }
});


app.listen(PORT, () => {
    console.log(`App activated on port no. ${PORT}`);
});
