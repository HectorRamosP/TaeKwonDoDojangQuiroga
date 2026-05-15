// src/Components/ConfiguracionAlertas.js
import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Paper, Alert } from '@mui/material';
import { obtenerDiasConfig, guardarDiasConfig } from '../services/configAlertaService';

const ConfiguracionAlertas = () => {
    const [dias, setDias] = useState(obtenerDiasConfig());
    const [status, setStatus] = useState(false);

    const diasNum = Number(dias);
    const esInvalido = !dias || isNaN(diasNum) || diasNum <= 0;

    const handleSave = () => {
        if (esInvalido) return; // Doble seguridad: no guardar si el valor es inválido
        guardarDiasConfig(diasNum);
        setStatus(true);
        setTimeout(() => setStatus(false), 3000);
        window.dispatchEvent(new Event('alertasConfigChange'));
    };

    return (
        <Paper sx={{ p: 3, mt: 2, maxWidth: 400 }}>
            <Typography variant="h6" gutterBottom>Ajustes de Cobranza</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Días de anticipación para mostrar alertas:
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                <TextField
                    type="number"
                    size="small"
                    value={dias}
                    onChange={(e) => setDias(e.target.value)}
                    inputProps={{ min: 1 }}
                    error={esInvalido}
                    helperText={esInvalido ? 'Debe ser al menos 1 día' : ''}
                />
                <Button
                    variant="contained"
                    onClick={handleSave}
                    disabled={esInvalido}
                    sx={{ mt: esInvalido ? 0 : 0 }} // mantiene alineación
                >
                    Guardar
                </Button>
            </Box>
            {status && <Alert severity="success" sx={{ mt: 2 }}>Configuración guardada</Alert>}
        </Paper>
    );
};

export default ConfiguracionAlertas;