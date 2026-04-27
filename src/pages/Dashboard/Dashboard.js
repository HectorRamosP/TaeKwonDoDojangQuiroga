import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  LinearProgress,
  Tooltip,
} from "@mui/material";
import {
  People,
  AttachMoney,
  CalendarToday,
  TrendingUp,
  PersonAdd,
  ArrowForwardIos,
} from "@mui/icons-material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import { obtenerDashboard } from "../../services/dashboardService";

const ROJO = "#DC143C";
const ROJO_OSCURO = "#B22222";
const CARD_SX = {
  borderRadius: "16px",
  border: "1px solid rgba(220, 20, 60, 0.12)",
  boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
  height: "100%",
};

function TarjetaMetrica({ titulo, valor, subtitulo, icono }) {
  return (
    <Card elevation={0} sx={CARD_SX}>
      <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: "12px",
              background: `linear-gradient(135deg, ${ROJO} 0%, ${ROJO_OSCURO} 100%)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {icono}
          </Box>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              variant="caption"
              sx={{ color: "#888", fontWeight: 600, display: "block", lineHeight: 1.2 }}
            >
              {titulo}
            </Typography>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                color: "#1a1a1a",
                lineHeight: 1.3,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {valor}
            </Typography>
            {subtitulo && (
              <Typography variant="caption" sx={{ color: "#aaa", display: "block", lineHeight: 1.2 }}>
                {subtitulo}
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarDashboard();
  }, []);

  const cargarDashboard = async () => {
    setCargando(true);
    setError(null);
    try {
      const res = await obtenerDashboard();
      setDatos(res.data);
    } catch {
      setError("No se pudo cargar el dashboard. Verifica tu conexión.");
    } finally {
      setCargando(false);
    }
  };

  const formatearMoneda = (monto) =>
    new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      maximumFractionDigits: 0,
    }).format(monto);

  const formatearHora = (hora) => (hora ? hora.substring(0, 5) : "");

  if (cargando) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 300 }}>
        <CircularProgress sx={{ color: ROJO }} />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>;
  }

  const hoy = new Date().toLocaleDateString("es-MX", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Box sx={{ p: 2.5 }}>
      {/* Encabezado compacto */}
      <Box sx={{ mb: 2.5 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: "#1a1a1a", lineHeight: 1.2 }}>
          Panel de Control
        </Typography>
        <Typography variant="caption" sx={{ color: "#888", textTransform: "capitalize" }}>
          {hoy}
        </Typography>
      </Box>

      {/* Tarjetas de métricas */}
      <Grid container spacing={2} sx={{ mb: 2.5 }}>
        <Grid item xs={12} sm={6} md={4}>
          <TarjetaMetrica
            titulo="Alumnos Activos"
            valor={datos.totalAlumnosActivos}
            subtitulo="inscritos actualmente"
            icono={<People sx={{ color: "white", fontSize: 24 }} />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TarjetaMetrica
            titulo="Ingresos del Mes"
            valor={formatearMoneda(datos.ingresosMes)}
            subtitulo="pagos confirmados"
            icono={<AttachMoney sx={{ color: "white", fontSize: 24 }} />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TarjetaMetrica
            titulo="Clases Hoy"
            valor={datos.clasesHoy.length}
            subtitulo="programadas para hoy"
            icono={<CalendarToday sx={{ color: "white", fontSize: 24 }} />}
          />
        </Grid>
      </Grid>

      {/* Segunda fila: Clases + Gráfica */}
      <Grid container spacing={2} sx={{ mb: 2.5 }}>
        {/* Clases de hoy — clickeables */}
        <Grid item xs={12} md={5}>
          <Card elevation={0} sx={CARD_SX}>
            <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                <CalendarToday sx={{ color: ROJO, fontSize: 18 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Clases de Hoy
                </Typography>
              </Box>

              {datos.clasesHoy.length === 0 ? (
                <Alert severity="info" sx={{ borderRadius: "10px", py: 1 }}>
                  No hay clases programadas para hoy
                </Alert>
              ) : (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {datos.clasesHoy.map((clase) => (
                    <Tooltip key={clase.id} title="Ir a Asistencia" arrow placement="right">
                      <Box
                        onClick={() => navigate("/asistencia")}
                        sx={{
                          px: 2,
                          py: 1.5,
                          borderRadius: "10px",
                          border: "1px solid rgba(220, 20, 60, 0.12)",
                          backgroundColor: "#FAFAFA",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          "&:hover": {
                            backgroundColor: "rgba(220, 20, 60, 0.04)",
                            borderColor: ROJO,
                            transform: "translateX(3px)",
                          },
                        }}
                      >
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 700,
                              color: "#1a1a1a",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {clase.nombre}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "#888" }}>
                            {formatearHora(clase.horaInicio)} – {formatearHora(clase.horaFin)}
                            {" · "}
                            {clase.inscritos} inscritos
                          </Typography>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0, ml: 1 }}>
                          <Chip
                            label={clase.tipoClase}
                            size="small"
                            sx={{
                              fontSize: "0.65rem",
                              height: 20,
                              background: `linear-gradient(135deg, ${ROJO} 0%, ${ROJO_OSCURO} 100%)`,
                              color: "white",
                              fontWeight: 700,
                            }}
                          />
                          <ArrowForwardIos sx={{ fontSize: 11, color: "#ccc" }} />
                        </Box>
                      </Box>
                    </Tooltip>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Gráfica nuevos alumnos por mes */}
        <Grid item xs={12} md={7}>
          <Card elevation={0} sx={CARD_SX}>
            <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                <PersonAdd sx={{ color: ROJO, fontSize: 18 }} />
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                    Nuevos Alumnos por Mes
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#888" }}>
                    Últimos 6 meses
                  </Typography>
                </Box>
              </Box>

              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={datos.nuevosAlumnosPorMes}
                  margin={{ top: 4, right: 8, left: -24, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis
                    dataKey="mes"
                    tick={{ fontSize: 11, fill: "#888" }}
                    tickFormatter={(v) => v.split(" ")[0]}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#888" }}
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                  />
                  <RechartsTooltip
                    formatter={(value) => [value, "Nuevos alumnos"]}
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid #eee",
                      fontSize: 12,
                    }}
                    cursor={{ fill: "rgba(220,20,60,0.05)" }}
                  />
                  <Bar dataKey="nuevos" fill={ROJO} radius={[5, 5, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Barra de progreso de asistencia — solo si hay clases hoy */}
      {datos.totalEsperadosDia > 0 && (
        <Card elevation={0} sx={CARD_SX}>
          <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <TrendingUp sx={{ color: ROJO, fontSize: 18 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Progreso de Asistencia del Día
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 800, color: ROJO }}>
                {datos.totalAsistenciaDia} / {datos.totalEsperadosDia}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={Math.min(datos.porcentajeAsistenciaDia, 100)}
              sx={{
                height: 10,
                borderRadius: 5,
                backgroundColor: "#f0f0f0",
                "& .MuiLinearProgress-bar": {
                  background: `linear-gradient(90deg, ${ROJO} 0%, ${ROJO_OSCURO} 100%)`,
                  borderRadius: 5,
                },
              }}
            />
            <Typography variant="caption" sx={{ color: "#aaa", mt: 0.5, display: "block" }}>
              {datos.porcentajeAsistenciaDia}% de asistencia en las clases de hoy
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
