/** @module components/layout/Sidebar */
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { User, Users, CreditCard, LogOut, Banknote, Calendar, BarChart3, ClipboardCheck } from "lucide-react";
import { useState, useEffect } from "react";
import "./Sidebar.css";

/**
 * Barra lateral de navegación del sistema.
 * Contiene los enlaces a todos los módulos (Usuarios, Alumnos, Clases, Asistencia,
 * Conceptos, Pagos, Reportes) y el botón de cierre de sesión.
 * Soporta un estado abierto/cerrado con transición animada.
 *
 * @component
 * @param {object} props
 * @param {boolean} props.isOpen - Indica si el sidebar está expandido o colapsado.
 * @param {Function} props.toggleSidebar - Callback para alternar el estado del sidebar.
 *
 * @example
 * <Sidebar isOpen={sidebarAbierto} toggleSidebar={toggleSidebar} />
 */
export default function Sidebar({ isOpen, toggleSidebar }) {
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [showContent, setShowContent] = useState(isOpen);

    useEffect(() => {
        if (isOpen) {
            // Cuando se abre, mostrar contenido después de iniciar transición
            setIsTransitioning(true);
            const timer = setTimeout(() => {
                setShowContent(true);
                setIsTransitioning(false);
            }, 100);
            return () => clearTimeout(timer);
        } else {
            // Cuando se cierra, ocultar contenido inmediatamente
            setShowContent(false);
            setIsTransitioning(true);
            const timer = setTimeout(() => {
                setIsTransitioning(false);
            }, 250);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    return (
        <div
            className={`sidebar ${isOpen ? "open" : "closed"}`}
        >
            <div>
                <div className="sidebar-header">
                    {showContent && <h2 className="text-2xl font-bold text-red-600">Taekwondo  Dojang Quiroga</h2>}
                    <div className={`button-container ${isOpen ? '' : 'button-container-closed'}`}>
                        <button
                            onClick={toggleSidebar}
                            className="menu-toggle-button"
                            aria-label="Toggle menu"
                        >
                            <div className="hamburger">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </button>
                    </div>
                </div>
                <nav className="flex flex-col space-y-4">
                    <Link to="/usuarios" className="sidebar-link">
                        <User className="w-5 h-5" />
                        {showContent && <span className="ml-2">Usuarios</span>}
                    </Link>
                    <Link to="/alumnos" className="sidebar-link">
                        <Users className="w-5 h-5" />
                        {showContent && <span className="ml-2">Alumnos</span>}
                    </Link>
                    <Link to="/clases" className="sidebar-link">
                        <Calendar className="w-5 h-5" />
                        {showContent && <span className="ml-2">Clases</span>}
                    </Link>
                    <Link to="/asistencia" className="sidebar-link">
                        <ClipboardCheck className="w-5 h-5" />
                        {showContent && <span className="ml-2">Asistencia</span>}
                    </Link>
                    <Link to="/conceptos" className="sidebar-link">
                        <CreditCard className="w-5 h-5" />
                        {showContent && <span className="ml-2">Conceptos</span>}
                    </Link>
                    <Link to="/pagos" className="sidebar-link">
                        <Banknote className="w-5 h-5" />
                        {showContent && <span className="ml-2">Pagos</span>}
                    </Link>
                    <Link to="/reportes" className="sidebar-link">
                        <BarChart3 className="w-5 h-5" />
                        {showContent && <span className="ml-2">Reportes</span>}
                    </Link>
                </nav>
            </div>
            <button
                className="logout-button"
                onClick={() => {
                    localStorage.removeItem("token");
                    window.location.href = "/login";
                }}
            >
                <LogOut className="w-5 h-5" />
                {showContent && <span>Cerrar sesion</span>}
            </button>
        </div>
    );
}

Sidebar.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    toggleSidebar: PropTypes.func.isRequired
};
