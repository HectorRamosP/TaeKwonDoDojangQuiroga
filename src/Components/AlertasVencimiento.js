import React, { useEffect, useState } from 'react';
import { obtenerAlertasVencimiento } from '../services/alumnosService';
import { Alert, AlertTitle, List, ListItem, ListItemText, Typography, Box, Chip } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

const AlertasVencimiento = () => {
  const [alertas, setAlertas] = useState([]);

  useEffect(() => {
    obtenerAlertasVencimiento()
      .then(data => setAlertas(data))
      .catch(err => console.error("Error al obtener alertas de vencimiento:", err));
  }, []);

  if (alertas.length === 0) return null;

  return (
    <Box sx={{ mb: 3 }}>
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
        <AlertTitle sx={{ fontWeight: 'bold', fontSize: '1.1rem', mb: 1 }}>
          Alumnos por vencer (Próximos 5 días)
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