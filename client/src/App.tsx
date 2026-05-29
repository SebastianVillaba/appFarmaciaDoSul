import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import AuthLayout from "./layout/AuthLayout";
import LoginPage from "./pages/Login/LoginPage";
import MainLayout from "./layout/MainLayout";
import HomePage from "./pages/Home/HomePage";
import PacotePage from "./pages/Pacote/PacotePage";
import StockPage from "./pages/Stock/StockPage";
import { useUser } from "./hooks/useUser";
import { PacoteEntregado } from "./pages/Pacote/PacoteEntregado";

const ProtectedRoute = () => {
  const { idUsuario } = useUser();
  return idUsuario ? <Outlet /> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas Públicas */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        {/* Rutas Protegidas */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/pacote" element={<PacotePage />} />
            <Route path="/pacote-entregado" element={<PacoteEntregado />} />
            <Route path="/stock" element={<StockPage />} />
          </Route>
        </Route>

        {/* Redirección por defecto */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
