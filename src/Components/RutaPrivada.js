import { Navigate } from "react-router-dom";

export default function RutaPrivada({ children }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Verificación del formato y expiración del token JWT
  try {
    const parts = token.split('.');

    if (parts.length !== 3) {
      localStorage.removeItem("token");
      return <Navigate to="/login" replace />;
    }

    // Verificar si el token ha expirado
    const payload = JSON.parse(atob(parts[1]));
    const now = Math.floor(Date.now() / 1000);

    if (payload.exp && payload.exp < now) {
      localStorage.removeItem("token");
      return <Navigate to="/login" replace />;
    }
  } catch (error) {
    localStorage.removeItem("token");
    return <Navigate to="/login" replace />;
  }

  return children;
}
