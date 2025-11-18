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

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index} style={{ marginTop: "20px" }}>
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

export default function Reportes() {
  const [tabActual, setTabActual] = useState(0);

  const handleCambiarTab = (event, nuevoValor) => {
    setTabActual(nuevoValor);
  };

  return (
    <Container maxWidth="xl" className="reportes-container">
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          <Assessment sx={{ mr: 1, verticalAlign: "middle" }} />
          Reportes y Estadísticas
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Genera reportes detallados y visualiza estadísticas del sistema
        </Typography>
      </Box>

      <Paper sx={{ width: "100%" }}>
        <Tabs
          value={tabActual}
          onChange={handleCambiarTab}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: "divider" }}
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
