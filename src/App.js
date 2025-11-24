import { Route, Routes, Navigate } from "react-router-dom";
import Layout from "./Components/layout/Layout";
import Login from "./pages/Login/Login";
import Usuarios from "./pages/Usuarios/Usuarios";
import Socios from "./pages/Socios/Socios";
import Membresias from "./pages/Membresias/Membresias";
import Pagos from "./pages/Pagos/Pagos";
import Clases from "./pages/Clases/Clases";
import Asistencia from "./pages/Asistencia/Asistencia";
import Reportes from "./pages/Reportes/Reportes";
import RutaPrivada from "./Components/RutaPrivada";
import ErrorBoundary from "./Components/ErrorBoundary";

function RedirectToLoginOrAlumnos() {
  const token = localStorage.getItem("token");
  return token ? <Navigate to="/alumnos" replace /> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<RedirectToLoginOrAlumnos />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={
            <RutaPrivada>
              <Layout />
            </RutaPrivada>
          }
        >
          <Route path="usuarios" element={<Usuarios />} />
          <Route path="alumnos" element={<Socios />} />
          <Route path="socios" element={<Socios />} />
          <Route path="conceptos" element={<Membresias />} />
          <Route path="membresias" element={<Membresias />} />
          <Route path="pagos" element={<Pagos />} />
          <Route path="clases" element={<Clases />} />
          <Route path="asistencia" element={<Asistencia />} />
          <Route path="reportes" element={<Reportes />} />
        </Route>
      </Routes>
    </ErrorBoundary>
  );
}
