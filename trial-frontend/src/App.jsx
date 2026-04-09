import { Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "./context/AuthContext"
import "./styles/App.css"
import SignIn from "./features/auth/SignIn"
import SignUp from "./features/auth/SignUp"
import LandingPage from "./pages/LandingPage/LandingPage"
import ToDoPage from "./pages/ToDoPage/ToDoPage"

function App() {
  const { isAuthenticated, authReady } = useAuth()

  if (!authReady) {
    return <div className="app"><p className="status-text">Loading...</p></div>
  }

  return (
    <Routes>
  <Route
    path="/"
    element={isAuthenticated ? <Navigate to="/todos" replace /> : <LandingPage />}
  />
  <Route
    path="/signin"
    element={isAuthenticated ? <Navigate to="/todos" replace /> : <SignIn />}
  />
  <Route
    path="/signup"
    element={isAuthenticated ? <Navigate to="/todos" replace /> : <SignUp />}
  />
  <Route
    path="/todos"
    element={isAuthenticated ? <ToDoPage /> : <Navigate to="/" />}
  />
  <Route path="*" element={<Navigate to={isAuthenticated ? "/todos" : "/"} replace />} />
</Routes>
  )
}

export default App
