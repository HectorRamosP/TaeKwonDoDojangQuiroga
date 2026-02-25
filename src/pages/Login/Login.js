import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import Taekwondo from '../../Components/img/Taekwondo.jpg'; 
import './Login.css';

/**
 * Componente de la página de inicio de sesión.
 * Permite al usuario autenticarse con nombre de usuario y contraseña.
 * Al autenticarse exitosamente, almacena el token JWT en localStorage
 * y redirige al módulo de usuarios.
 *
 * @component
 * @returns {JSX.Element} Formulario de inicio de sesión.
 *
 * @example
 * // Usado como ruta pública en App.js
 * <Route path="/login" element={<Login />} />
 */
const Login = () => {

    const [usuarioNombre, setUsuarioNombre] = useState("");
    const [contrasena, setContrasena] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const data = {
                UsuarioNombre: usuarioNombre,
                Contrasena: contrasena,
                MantenerSesion: true
            };

            const res = await api.post("/login", data);
            const token = res.headers.authorization || res.headers.Authorization;

            if (!token) {
                throw new Error("Token no recibido");
            }
            localStorage.setItem("token", token);
            navigate("/usuarios");
        } catch (err) {
            setError("Usuario o contraseña incorrectos");
        } finally {
            setLoading(false);
        }
        return false;
    };

    return (
   
        <div 
            className="login-wrapper" 
            style={{ '--background-image': `url(${Taekwondo})` }}
        >
            <div className="login-container">
                <div className="login-header">
                    <div className="login-icon">
                        <i className="bi bi-person-circle"></i>
                    </div>
                    <h2>Academia de Taekwondo</h2>
                    <p className="login-subtitle">Sistema de Gestión</p>
                </div>

                <form className="login-form" onSubmit={handleSubmit} noValidate>

                    <div className="mb-4">
                        <label htmlFor="usuario" className="form-label">
                            <i className="bi bi-person-fill me-2"></i>
                            Nombre de Usuario
                        </label>
                        <input
                            type="text"
                            className="form-control form-control-lg"
                            id="usuario"
                            placeholder="Ingresa tu usuario"
                            required
                            value={usuarioNombre}
                            onChange={(e) => setUsuarioNombre(e.target.value)}
                            disabled={loading}
                            autoComplete="username"
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="contrasena" className="form-label">
                            <i className="bi bi-lock-fill me-2"></i>
                            Contraseña
                        </label>
                        <input
                            type="password"
                            className="form-control form-control-lg"
                            id="contrasena"
                            placeholder="Ingresa tu contraseña"
                            required
                            value={contrasena}
                            onChange={(e) => setContrasena(e.target.value)}
                            disabled={loading}
                            autoComplete="current-password"
                        />
                    </div>
                    {error && (
                        <div className="alert alert-danger" role="alert">
                            <i className="bi bi-exclamation-triangle-fill"></i>
                            <div>{error}</div>
                        </div>
                    )}
                    <button
                        type="submit"
                        className="btn btn-primary btn-lg w-100"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Iniciando sesión...
                            </>
                        ) : (
                            "Iniciar Sesión"
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;