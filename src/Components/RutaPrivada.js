import { Navigate } from "react-router-dom";

/**
 * Componente de protección de rutas que valida la autenticación del usuario.
 * Verifica la existencia, formato JWT (tres segmentos) y expiración del token
 * almacenado en localStorage antes de permitir el acceso a la ruta solicitada.
 * Si el token es inválido o ha expirado, lo elimina y redirige al login.
 *
 * @component
 * @param {object} props
 * @param {React.ReactNode} props.children - Componente a renderizar si el usuario está autenticado.
 * @returns {React.ReactNode} El componente hijo o una redirección a /login.
 *
 * @example
 * <RutaPrivada>
 *   <Dashboard />
 * </RutaPrivada>
 */
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
