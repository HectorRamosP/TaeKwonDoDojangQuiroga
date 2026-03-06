/** @module pages/Reportes */
import { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper,
} from "@mui/material";
import {
  Assessment,
  AttachMoney,
  People,
  EventAvailable,
  Category,
  Class,
} from "@mui/icons-material";
import ReportePagos from "./ReportePagos";
import ReporteEstudiantes from "./ReporteEstudiantes";
import ReporteAsistencias from "./ReporteAsistencias";
import ReporteConceptos from "./ReporteConceptos";
import ReporteClases from "./ReporteClases";
import "./Reportes.css";

/**
 * Componente auxiliar que muestra u oculta contenido según el tab seleccionado.
 * @param {object} props
 * @param {React.ReactNode} props.children - Contenido del panel.
 * @param {number} props.value - Índice del tab actualmente activo.
 * @param {number} props.index - Índice de este panel.
 * @returns {JSX.Element}
 */
function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index} style={{ marginTop: "20px" }}>
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

/**
 * Página de Reportes y Estadísticas. Organiza los distintos tipos de reporte
 * en pestañas: Pagos, Estudiantes, Asistencias, Conceptos y Clases.
 * @component
 * @returns {JSX.Element} Contenedor de tabs con los subcomponentes de cada reporte.
 */
export default function Reportes() {
  const [tabActual, setTabActual] = useState(0);

  const handleCambiarTab = (event, nuevoValor) => {
    setTabActual(nuevoValor);
  };

  return (
    <Container maxWidth="xl" className="reportes-container">
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <h1 className="page-title">Reportes y Estadísticas</h1>
      </Box>

      <Paper
        elevation={0}
        sx={{
          width: "100%",
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
          border: "1px solid rgba(220, 20, 60, 0.1)",
        }}
      >
        <Tabs
          value={tabActual}
          onChange={handleCambiarTab}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            "& .MuiTab-root": {
              color: "#666",
              fontWeight: 600,
              transition: "all 0.3s ease",
              "&:hover": {
                color: "#DC143C",
                backgroundColor: "rgba(220, 20, 60, 0.04)",
              },
            },
            "& .Mui-selected": {
              color: "#DC143C !important",
            },
            "& .MuiTabs-indicator": {
              backgroundColor: "#DC143C",
              height: "3px",
            },
          }}
        >
          <Tab
            icon={<AttachMoney />}
            label="Pagos"
            iconPosition="start"
          />
          <Tab
            icon={<People />}
            label="Estudiantes"
            iconPosition="start"
          />
          <Tab
            icon={<EventAvailable />}
            label="Asistencias"
            iconPosition="start"
          />
          <Tab
            icon={<Category />}
            label="Conceptos"
            iconPosition="start"
          />
          <Tab
            icon={<Class />}
            label="Clases"
            iconPosition="start"
          />
        </Tabs>

        <TabPanel value={tabActual} index={0}>
          <ReportePagos />
        </TabPanel>
        <TabPanel value={tabActual} index={1}>
          <ReporteEstudiantes />
        </TabPanel>
        <TabPanel value={tabActual} index={2}>
          <ReporteAsistencias />
        </TabPanel>
        <TabPanel value={tabActual} index={3}>
          <ReporteConceptos />
        </TabPanel>
        <TabPanel value={tabActual} index={4}>
          <ReporteClases />
        </TabPanel>
      </Paper>
    </Container>
  );
}
