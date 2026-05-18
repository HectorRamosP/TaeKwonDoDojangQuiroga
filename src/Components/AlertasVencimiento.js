import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { obtenerAlertasVencimiento } from '../services/alumnosService';
import { obtenerDiasConfig } from '../services/configAlertaService';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const ROJO = "#DC143C";
const CARD_SX = {
  borderRadius: "16px",
  border: "1px solid rgba(220, 20, 60, 0.12)",
  boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
};

const AlertasVencimiento = () => {
  const navigate = useNavigate();
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
      const data = await obtenerAlertasVencimiento(dias);
      setAlertas(data);
    } catch (err) {
      console.error("Error al obtener alertas de vencimiento:", err);
    } finally {
      setCargando(false);
      peticionEnCurso.current = false;
    }
  };

  useEffect(() => {
    cargarDatos();
    window.addEventListener('alertasConfigChange', cargarDatos);
    return () => window.removeEventListener('alertasConfigChange', cargarDatos);
  }, []);

  if (cargando && alertas.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
        <CircularProgress size={24} sx={{ color: ROJO }} />
      </Box>
    );
  }

  return (
    <Card elevation={0} sx={{ ...CARD_SX, mb: 2.5 }}>
      <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
          {alertas.length > 0
            ? <WarningAmberIcon sx={{ color: ROJO, fontSize: 18 }} />
            : <CheckCircleOutlineIcon sx={{ color: "#4caf50", fontSize: 18 }} />
          }
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Vencimientos próximos
          </Typography>
          {alertas.length > 0 && (
            <Chip
              label={alertas.length}
              size="small"
              sx={{ bgcolor: ROJO, color: "white", fontWeight: 700, fontSize: "0.7rem", height: 20 }}
            />
          )}
        </Box>

        {alertas.length === 0 ? (
          <Typography variant="body2" sx={{ color: "#888" }}>
            Ningún alumno vence en los próximos <strong>{diasAnticipacion}</strong> días.
          </Typography>
        ) : (
          <>
            <Typography variant="caption" sx={{ color: "#aaa", display: "block", mb: 1 }}>
              Alumnos que vencen en {diasAnticipacion} días o menos
            </Typography>
            <List dense disablePadding>
              {alertas.map((a, i) => (
                <ListItem
                  key={a.id || i}
                  divider={i !== alertas.length - 1}
                  sx={{ px: 0, py: 1 }}
                >
                  <ListItemText
                    primary={
                      <Typography
                        variant="body2"
                        onClick={() => navigate(`/alumnos/${a.slug}/perfil`)}
                        sx={{
                          fontWeight: 700,
                          color: "#1a1a1a",
                          cursor: 'pointer',
                          display: 'inline',
                          '&:hover': { color: ROJO, textDecoration: 'underline' },
                        }}
                      >
                        {a.nombreCompleto}
                      </Typography>
                    }
                    secondary={`Tutor: ${a.nombreTutor || 'No registrado'}`}
                  />
                  <Chip
                    label={a.diasParaVencer === 0 ? "Vence hoy" : `${a.diasParaVencer}d`}
                    size="small"
                    sx={{
                      fontWeight: 700,
                      fontSize: "0.7rem",
                      bgcolor: a.diasParaVencer === 0 ? ROJO : "rgba(220,20,60,0.08)",
                      color: a.diasParaVencer === 0 ? "white" : ROJO,
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AlertasVencimiento;
