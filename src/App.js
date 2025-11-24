import { Route, Routes, Navigate } from "react-router-dom";
import { useEffect } from "react";
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

  // Verificar si el token existe y tiene el formato correcto
  if (token) {
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        // El token tiene formato válido, verificar si no ha expirado
        const payload = JSON.parse(atob(parts[1]));
        const now = Math.floor(Date.now() / 1000);

        // Si el token ha expirado, limpiarlo
        if (payload.exp && payload.exp < now) {
          localStorage.removeItem("token");
          return <Navigate to="/login" replace />;
        }

        return <Navigate to="/alumnos" replace />;
      } else {
        // Token con formato inválido
        localStorage.removeItem("token");
        return <Navigate to="/login" replace />;
      }
    } catch (error) {
      // Error al decodificar el token
      localStorage.removeItem("token");
      return <Navigate to="/login" replace />;
    }
  }

  return <Navigate to="/login" replace />;
}

// Función para validar y limpiar el token al inicio
function validarTokenAlInicio() {
  const token = localStorage.getItem("token");

  if (token) {
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        const now = Math.floor(Date.now() / 1000);

        // Si el token ha expirado, limpiarlo
        if (payload.exp && payload.exp < now) {
          localStorage.removeItem("token");
          console.log("Token expirado, eliminado del localStorage");
        }
      } else {
        localStorage.removeItem("token");
        console.log("Token con formato inválido, eliminado del localStorage");
      }
    } catch (error) {
      localStorage.removeItem("token");
      console.log("Error al validar token, eliminado del localStorage");
    }
  }
}

export default function App() {
  // Validar token al cargar la aplicación
  useEffect(() => {
    validarTokenAlInicio();
  }, []);

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
