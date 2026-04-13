import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import TodoForm from "../../features/todos/TodoForm"
import TodoList from "../../features/todos/TodoList"
import "../../styles/App.css"
import "./ToDoPage.css"

const API_BASE_URL = import.meta.env.VITE_API_KEY

export default function ToDoPage() {
  const { signOut, fetchWithAuth } = useAuth()
  const navigate = useNavigate()
  const [todos, setTodos] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => { fetchTodos() }, [])

  const fetchTodos = async () => {
    try {
      setLoading(true)
      const res = await fetchWithAuth(`${API_BASE_URL}/todos`)
      if (!res.ok) return
      setTodos(await res.json())
    } catch (err) {
      console.error("Failed to fetch todos:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddTodo = async (text) => {
    const res = await fetchWithAuth(`${API_BASE_URL}/todos`, {
      method: "POST",
      body: JSON.stringify({ text, completed: false }),
    })
    if (res.ok) setTodos((prev) => [...prev, res.json()])
  }

  const handleDeleteTodo = async (id) => {
    const res = await fetchWithAuth(`${API_BASE_URL}/todos/${id}`, { method: "DELETE" })
    if (res.ok) setTodos((prev) => prev.filter((t) => t._id !== id))
  }

  const handleToggleComplete = async (id, currentCompleted) => {
    const res = await fetchWithAuth(`${API_BASE_URL}/todos/${id}`, {
      method: "PUT",
      body: JSON.stringify({ completed: !currentCompleted }),
    })
    if (res.ok) {
      const updated = await res.json()
      setTodos((prev) => prev.map((t) => (t._id === id ? updated : t)))
    }
  }

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <div className="app">
      <div className="todo-container">
        <div className="todo-header">
          <h1>To-Do List</h1>
          <button className="signout-btn" onClick={handleSignOut}>Sign Out</button>
        </div>
        <TodoForm onAddTodo={handleAddTodo} />
        {loading ? (
          <p className="status-text">Loading tasks...</p>
        ) : todos.length === 0 ? (
          <p className="status-text">No tasks yet.</p>
        ) : (
          <TodoList todos={todos} onDeleteTodo={handleDeleteTodo} onToggleComplete={handleToggleComplete} />
        )}
      </div>
    </div>
  )
}
