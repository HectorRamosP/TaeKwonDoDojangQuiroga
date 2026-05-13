// src/Components/AlertasVencimiento.js
import React, { useEffect, useState } from 'react';
import { obtenerAlertasVencimiento } from '../services/alumnosService';
import { obtenerDiasConfig } from '../services/configAlertaService';
import { Alert, AlertTitle, List, ListItem, ListItemText, Typography, Box, Chip, CircularProgress } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const AlertasVencimiento = () => {
  const [alertas, setAlertas] = useState([]);
  const [diasAnticipacion, setDiasAnticipacion] = useState(5);
  const [cargando, setCargando] = useState(true);

  const cargarDatos = () => {
    const dias = obtenerDiasConfig();
    setDiasAnticipacion(dias);

    obtenerAlertasVencimiento()
      .then(data => {
        // FILTRADO LOCAL: Solo mostramos los que están dentro del rango elegido
        const filtradas = data.filter(alumno => alumno.diasParaVencer <= dias);
        setAlertas(filtradas);
      })
      .catch(err => console.error("Error:", err))
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    cargarDatos();
    // Escucha si el admin cambia la configuración desde otra pestaña/ventana
    window.addEventListener('storage', cargarDatos);
    return () => window.removeEventListener('storage', cargarDatos);
  }, []);

  if (cargando) return <CircularProgress size={20} />;

  if (alertas.length === 0) {
    return (
      <Box sx={{ mb: 2 }}>
        <Alert severity="success" icon={<CheckCircleOutlineIcon fontSize="inherit" />}>
          <AlertTitle sx={{ fontWeight: 'bold' }}>Sin vencimientos próximos</AlertTitle>
          Ningún alumno vence en los próximos <strong>{diasAnticipacion}</strong> días.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 2 }}>
      <Alert severity="warning" icon={<WarningAmberIcon fontSize="inherit" />}>
        <AlertTitle sx={{ fontWeight: 'bold' }}>
          Vencimientos en los próximos {diasAnticipacion} días ({alertas.length})
        </AlertTitle>
        <List dense>
          {alertas.map((a, i) => (
            <ListItem key={i} sx={{ px: 0, justifyContent: 'space-between' }}>
              <ListItemText 
                primary={<Typography variant="subtitle2">{a.nombreCompleto}</Typography>} 
                secondary={`Tutor: ${a.nombreTutor}`} 
              />
              <Chip 
                label={a.diasParaVencer === 0 ? "Vence hoy" : `Faltan ${a.diasParaVencer} día(s)`} 
                color={a.diasParaVencer <= 1 ? "error" : "warning"}
                size="small"
              />
            </ListItem>
          ))}
        </List>
      </Alert>
    </Box>
  );
};

export default AlertasVencimiento;