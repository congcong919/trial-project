const express = require("express")
const router = express.Router()
const Todo = require("./models/Todo")

router.get("/todos", async (req, res) => {
  try {
    const todos = await Todo.find()
    res.json(todos)
    console.log('data fetched')
  } catch (err) {
    res.status(500).json({ message: "fetch failed" })
  }
})


router.post("/todos", async (req, res) => {
  try {
    const { text, completed } = req.body
    const newTodo = new Todo({ text, completed: completed || false })
    await newTodo.save()
    res.status(201).json(newTodo)
    console.log('data created')
  } catch (err) {
    res.status(500).json({ message: "create failed" })
  }
})


router.put("/todos/:id", async (req, res) => {
  try {
    const { completed } = req.body
    const todo = await Todo.findByIdAndUpdate(
      req.params.id,
      { completed },
      { new: true }
    )
    if (!todo) return res.status(404).json({ message: "Todo not found" })
    res.json(todo)
    console.log('data updated')
  } catch (err) {
    res.status(500).json({ message: "update failed" })
  }
})


router.delete("/todos/:id", async (req, res) => {
  try {
    await Todo.findByIdAndDelete(req.params.id)
    res.json({ success: true })
    console.log('data deleted')
  } catch (err) {
    res.status(500).json({ message: "delete failed" })
  }
})

module.exports = router

// const express = require("express");
// const router = express.Router();

// let currentId = 1;
// let todos = [];

// router.get("/todos", (req, res) => {
//   res.json(todos);
// });

// router.post("/todos", (req, res) => {
//   const { text, completed } = req.body;

//   const newTodo = {
//     id: currentId++,
//     text,
//     completed: completed || false,
//   };

//   todos.push(newTodo);

//   res.status(201).json(newTodo);
// });

// router.put("/todos/:id", (req, res) => {
//   const id = Number(req.params.id);
//   const { completed } = req.body;
//   console.log("params:", req.params);
//   console.log("body:", req.body);

//   const todo = todos.find((item) => item.id === id);

//   if (!todo) {
//     return res.status(404).json({ message: "Todo not found" });
//   }

//   todo.completed = completed;
//   res.json(todo);
// });

// router.delete("/todos/:id", (req, res) => {
//   const id = Number(req.params.id);
//   todos = todos.filter((todo) => todo.id !== id);
//   res.json({ success: true });
// });

// module.exports = router;