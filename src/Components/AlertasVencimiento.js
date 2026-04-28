import React, { useEffect, useState } from 'react';
import { obtenerAlertasVencimiento } from '../services/alumnosService';
import { Alert, AlertTitle, List, ListItem, ListItemText, Typography, Box, Chip, CircularProgress } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const AlertasVencimiento = () => {
  const [alertas, setAlertas] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    obtenerAlertasVencimiento()
      .then(data => setAlertas(data))
      .catch(err => console.error("Error al obtener alertas de vencimiento:", err))
      .finally(() => setCargando(false));
  }, []);

  if (cargando) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
        <CircularProgress size={20} sx={{ color: '#DC143C' }} />
      </Box>
    );
  }

  if (alertas.length === 0) {
    return (
      <Box sx={{ mb: 2 }}>
        <Alert
          severity="success"
          icon={<CheckCircleOutlineIcon fontSize="inherit" />}
          sx={{
            border: '1px solid #86efac',
            backgroundColor: '#f0fdf4',
            color: '#166534',
            borderRadius: 2,
          }}
        >
          <AlertTitle sx={{ fontWeight: 'bold', mb: 0 }}>
            Sin vencimientos próximos
          </AlertTitle>
          Ningún alumno tiene la membresía por vencer en los próximos 5 días.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 2 }}>
      <Alert
        severity="warning"
        icon={<WarningAmberIcon fontSize="inherit" />}
        sx={{
          border: '1px solid #f59e0b',
          backgroundColor: '#fffbeb',
          color: '#b45309',
          borderRadius: 2,
          boxShadow: '0 2px 10px rgba(245, 158, 11, 0.15)'
        }}
      >
        <AlertTitle sx={{ fontWeight: 'bold', fontSize: '1rem', mb: 1 }}>
          Membresías por vencer — Próximos 5 días ({alertas.length})
        </AlertTitle>
        <List dense sx={{ width: '100%', padding: 0 }}>
          {alertas.map((a, i) => (
            <ListItem
              key={i}
              sx={{
                px: 0,
                py: 0.5,
                display: 'flex',
                justifyContent: 'space-between',
                borderBottom: i < alertas.length - 1 ? '1px solid rgba(245, 158, 11, 0.2)' : 'none'
              }}
            >
              <ListItemText
                primary={<Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{a.nombreCompleto}</Typography>}
                secondary={`Tutor: ${a.nombreTutor}`}
                primaryTypographyProps={{ color: '#92400e' }}
                secondaryTypographyProps={{ color: '#b45309' }}
              />
              <Chip
                label={a.diasParaVencer === 0 ? "Vence hoy" : `Faltan ${a.diasParaVencer} día(s)`}
                size="small"
                color={a.diasParaVencer <= 1 ? "error" : "warning"}
                sx={{ fontWeight: 'bold' }}
              />
            </ListItem>
          ))}
        </List>
      </Alert>
    </Box>
  );
};

export default AlertasVencimiento;