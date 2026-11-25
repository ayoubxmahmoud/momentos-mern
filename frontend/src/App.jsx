import { Navigate, Route, Routes } from 'react-router'
import HomePage from './pages/HomePage'
import CreateMomentoModal from './components/CreateMomentoModal'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import { useAuth } from './context/AuthContext'
import ProfilePage from "./pages/ProfilePage";
import NotFoundPage from './pages/NotFoundPage'

const App = () => {
  const { user, loadingAuth } = useAuth();

  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-[#131926] flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-indigo-500" />
      </div>
    )
  }
  return (
    <div className="relative h-full w-full">
      <div className="absolute inset-0 -z-10 h-full w-full items-center px-5 py-24 [background:radial-gradient(125%_125%_at_50%_10%,#000_60%,#00FF9D40_100%)]" />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/create" element={<CreateMomentoModal />} />
        <Route path="/" element={<HomePage />} />
        <Route
          path="/login"
          element={!user ? <LoginPage /> : <Navigate to="/" />}
        />
        <Route
          path="/register"
          element={!user ? <RegisterPage /> : <Navigate to="/" />}
        />
        <Route path="/profile/:userId" element={<ProfilePage />} />
        {/* Catch-all 404 Wildcard Route (must be last) */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  )
}

export default App
