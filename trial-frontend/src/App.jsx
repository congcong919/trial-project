import { useEffect, useState } from "react"
import "./App.css"
import TodoForm from "./components/TodoForm"
import TodoList from "./components/TodoList"
import SignIn from "./pages/SignIn"
import SignUp from "./pages/SignUp"

const API_BASE_URL = import.meta.env.VITE_API_KEY

// Access token lives only in memory — lost on page refresh (intentional).
// Refresh token is in an httpOnly cookie managed by the browser.
let accessToken = null

function App() {
  const [page, setPage] = useState("loading")
  const [todos, setTodos] = useState([])
  const [loading, setLoading] = useState(false)

  // --- Auth helpers ---

  const signOut = async () => {
    accessToken = null
    setTodos([])
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    })
    setPage("signin")
  }

  const tryRefresh = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      })
      if (!res.ok) return false
      const data = await res.json()
      accessToken = data.accessToken
      return true
    } catch {
      return false
    }
  }

  // Wraps fetch: on 401, attempts one silent token refresh then retries.
  const fetchWithAuth = async (url, options = {}) => {
    const makeRequest = () =>
      fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
          Authorization: `Bearer ${accessToken}`,
        },
        credentials: "include",
      })

    let res = await makeRequest()
    if (res.status === 401) {
      const refreshed = await tryRefresh()
      if (!refreshed) {
        signOut()
        return res
      }
      res = await makeRequest()
    }
    return res
  }

  // On mount: try to restore session via refresh token cookie.
  useEffect(() => {
    tryRefresh().then((ok) => setPage(ok ? "todos" : "signin"))
  }, [])

  useEffect(() => {
    if (page === "todos") fetchTodos()
  }, [page])

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
        onSignedIn={(token) => { accessToken = token; setPage("todos") }}
        onGoSignUp={() => setPage("signup")}
      />
    )
  }

  if (page === "signup") {
    return (
      <SignUp
        onSignedUp={(token) => { accessToken = token; setPage("todos") }}
        onGoSignIn={() => setPage("signin")}
      />
    )
  }

  return (
    <div className="app">
      <div className="todo-container">
        <div className="todo-header">
          <h1>To-Do List</h1>
          <button className="signout-btn" onClick={signOut}>
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
