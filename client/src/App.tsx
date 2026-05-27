import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import AuthLayout from "./layout/AuthLayout"
import LoginPage from "./pages/Login/LoginPage"

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        {/* RUTA POR DEFECTO (LOGIN) */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
