import React, { useEffect, useState, useRef } from 'react';
import { obtenerAlertasVencimiento } from '../services/alumnosService';
import { obtenerDiasConfig } from '../services/configAlertaService';
import {
  Alert,
  AlertTitle,
  List,
  ListItem,
  ListItemText,
  Typography,
  Box,
  Chip,
  CircularProgress
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const AlertasVencimiento = () => {
  const [alertas, setAlertas] = useState([]);
  const [diasAnticipacion, setDiasAnticipacion] = useState(5);
  const [cargando, setCargando] = useState(true);
  const peticionEnCurso = useRef(false);

  const cargarDatos = async () => {
    if (peticionEnCurso.current) return;

    try {
      peticionEnCurso.current = true;
      const dias = obtenerDiasConfig();
      setDiasAnticipacion(dias);

      const data = await obtenerAlertasVencimiento();
      const filtradas = data.filter(alumno => alumno.diasParaVencer <= dias);
      setAlertas(filtradas);
    } catch (err) {
      console.error("Error al obtener alertas de vencimiento:", err);
    } finally {
      setCargando(false);
      peticionEnCurso.current = false;
    }
  };

  useEffect(() => {
    cargarDatos();

    const manejarCambioStorage = (e) => {
      if (e.key === 'diasAlerta') {
        cargarDatos();
      }
    };

    window.addEventListener('storage', manejarCambioStorage);
    return () => window.removeEventListener('storage', manejarCambioStorage);
  }, []);

  if (cargando && alertas.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
        <CircularProgress size={24} sx={{ color: '#DC143C' }} />
      </Box>
    );
  }

  if (alertas.length === 0) {
    return (
      <Box sx={{ mb: 2 }}>
        <Alert 
          severity="success" 
          variant="outlined"
          icon={<CheckCircleOutlineIcon fontSize="inherit" />}
          sx={{ borderRadius: '12px' }}
        >
          <AlertTitle sx={{ fontWeight: 'bold' }}>Sin vencimientos próximos</AlertTitle>
          Ningún alumno vence en los próximos <strong>{diasAnticipacion}</strong> días.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 2 }}>
      <Alert 
        severity="warning" 
        variant="outlined"
        icon={<WarningAmberIcon fontSize="inherit" />}
        sx={{ 
          borderRadius: '12px',
          '& .MuiAlert-message': { width: '100%' } 
        }}
      >
        <AlertTitle sx={{ fontWeight: 'bold' }}>
          Vencimientos próximos ({alertas.length})
        </AlertTitle>
        <Typography variant="caption" display="block" sx={{ mb: 1, opacity: 0.8 }}>
          Mostrando alumnos que vencen en {diasAnticipacion} días o menos.
        </Typography>
        <List dense sx={{ width: '100%', bgcolor: 'transparent' }}>
          {alertas.map((a, i) => (
            <ListItem 
              key={a.id || i} 
              divider={i !== alertas.length - 1}
              sx={{ px: 0, py: 1 }}
            >
              <ListItemText 
                primary={
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {a.nombreCompleto}
                  </Typography>
                } 
                secondary={`Tutor: ${a.nombreTutor || 'No registrado'}`} 
              />
              <Chip 
                label={a.diasParaVencer === 0 ? "Vence hoy" : `Faltan ${a.diasParaVencer} días`} 
                size="small"
                color={a.diasParaVencer === 0 ? "error" : "warning"}
                sx={{ fontWeight: 700, fontSize: '0.7rem' }}
              />
            </ListItem>
          ))}
        </List>
      </Alert>
    </Box>
  );
};

export default AlertasVencimiento;