import { useEffect, useState } from "react"
import { useAuth } from "./context/AuthContext"
import "./App.css"
import TodoForm from "./components/TodoForm"
import TodoList from "./components/TodoList"
import SignIn from "./pages/SignIn"
import SignUp from "./pages/SignUp"

const API_BASE_URL = import.meta.env.VITE_API_KEY

function App() {
  const { isAuthenticated, signOut, tryRefresh, fetchWithAuth } = useAuth()
  const [page, setPage] = useState("loading")
  const [todos, setTodos] = useState([])
  const [loading, setLoading] = useState(false)

  

  // On mount: try to restore session via refresh token cookie.
  useEffect(() => {
    tryRefresh().then((ok) => setPage(ok ? "todos" : "signin"))
  }, [])

  useEffect(() => {
    if (page === "todos") fetchTodos()
  }, [page])

  const handleSignOut = async () => {
    setTodos([])
    await signOut()
    setPage("signin")
  }

  // --- Todo operations ---

  const fetchTodos = async () => {
    try {
      setLoading(true)
      const res = await fetchWithAuth(`${API_BASE_URL}/todos`)
      if (!res.ok) return
      const data = await res.json()
      setTodos(data)
    } catch (error) {
      console.error("Failed to fetch todos:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddTodo = async (text) => {
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/todos`, {
        method: "POST",
        body: JSON.stringify({ text, completed: false }),
      })
      if (!res.ok) throw new Error("Failed to add todo")
      const createdTodo = await res.json()
      setTodos((prev) => [...prev, createdTodo])
    } catch (error) {
      console.error("Failed to add todo:", error)
    }
  }

  const handleDeleteTodo = async (id) => {
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/todos/${id}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("Failed to delete todo")
      setTodos((prev) => prev.filter((todo) => todo._id !== id))
    } catch (error) {
      console.error("Failed to delete todo:", error)
    }
  }

  const handleToggleComplete = async (id, currentCompleted) => {
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/todos/${id}`, {
        method: "PUT",
        body: JSON.stringify({ completed: !currentCompleted }),
      })
      if (!res.ok) throw new Error("Failed to update todo")
      const updatedTodo = await res.json()
      setTodos((prev) =>
        prev.map((todo) => (todo._id === id ? updatedTodo : todo))
      )
    } catch (error) {
      console.error("Failed to update todo:", error)
    }
  }

  // --- Render ---

  if (page === "loading") {
    return (
      <div className="app">
        <p className="status-text">Loading...</p>
      </div>
    )
  }

  if (page === "signin") {
    return (
      <SignIn
        onSignedIn={() => setPage("todos")}
        onGoSignUp={() => setPage("signup")}
      />
    )
  }

  if (page === "signup") {
    return (
      <SignUp
        onGoSignIn={() => setPage("signin")}
      />
    )
  }

  return (
    <div className="app">
      <div className="todo-container">
        <div className="todo-header">
          <h1>To-Do List</h1>
          <button className="signout-btn" onClick={handleSignOut}>
            Sign Out
          </button>
        </div>

        <TodoForm onAddTodo={handleAddTodo} />

        {loading ? (
          <p className="status-text">Loading tasks...</p>
        ) : todos.length === 0 ? (
          <p className="status-text">No tasks yet.</p>
        ) : (
          <TodoList
            todos={todos}
            onDeleteTodo={handleDeleteTodo}
            onToggleComplete={handleToggleComplete}
          />
        )}
      </div>
    </div>
  )
}

export default App
