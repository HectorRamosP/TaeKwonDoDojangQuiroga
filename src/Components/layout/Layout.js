/** @module components/layout/Layout */
import { useState } from "react";
import Sidebar from './Sidebar';
import { Outlet } from "react-router-dom";

/**
 * Componente de estructura principal de la aplicación.
 * Combina el Sidebar lateral con el área de contenido principal,
 * administrando el estado de apertura/cierre del menú de navegación.
 * Utiliza Outlet de React Router para renderizar las rutas hijas.
 *
 * @component
 * @returns {JSX.Element} Estructura principal con sidebar y área de contenido.
 */
export default function Layout() {
    const [sidebarAbierto, setSidebarAbierto] = useState(true);

    const toggleSidebar = () => {
        setSidebarAbierto(!sidebarAbierto);
    };

    return (
        <div style={{ display: "flex", minHeight: "100vh" }}>
            <Sidebar isOpen={sidebarAbierto} toggleSidebar={toggleSidebar} />

            <main
                style={{
                    flexGrow: 1,
                    padding: "2rem",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    background: "linear-gradient(180deg, rgba(248, 249, 250, 0.95) 0%, rgba(241, 243, 245, 0.95) 100%)",
                    backgroundImage: `
                        linear-gradient(180deg, rgba(248, 249, 250, 0.95) 0%, rgba(241, 243, 245, 0.95) 100%),
                        radial-gradient(circle at 20% 50%, rgba(220, 20, 60, 0.03) 0%, transparent 50%),
                        radial-gradient(circle at 80% 80%, rgba(10, 10, 10, 0.02) 0%, transparent 50%)
                    `,
                    boxSizing: "border-box",
                    maxWidth: "100%",
                    overflowY: "auto",
                    height: "100vh",
                    position: "relative",
                }}
            >
                <Outlet />
            </main>
        </div>
    );
}