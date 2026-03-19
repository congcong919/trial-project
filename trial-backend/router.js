const express = require("express");
const router = express.Router();

let currentId = 1;
let todos = [];

router.get("/todos", (req, res) => {
  res.json(todos);
});

router.post("/todos", (req, res) => {
  const { text, completed } = req.body;

  const newTodo = {
    id: currentId++,
    text,
    completed: completed || false,
  };

  todos.push(newTodo);

  res.status(201).json(newTodo);
});

router.put("/todos/:id", (req, res) => {
  const id = Number(req.params.id);
  const { completed } = req.body;
  console.log("params:", req.params);
  console.log("body:", req.body);

  const todo = todos.find((item) => item.id === id);

  if (!todo) {
    return res.status(404).json({ message: "Todo not found" });
  }

  todo.completed = completed;
  res.json(todo);
});

router.delete("/todos/:id", (req, res) => {
  const id = Number(req.params.id);
  todos = todos.filter((todo) => todo.id !== id);
  res.json({ success: true });
});

module.exports = router;