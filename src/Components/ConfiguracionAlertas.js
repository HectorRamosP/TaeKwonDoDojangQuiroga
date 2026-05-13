// src/Components/ConfiguracionAlertas.js
import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Paper, Alert } from '@mui/material';
import { obtenerDiasConfig, guardarDiasConfig } from '../services/configAlertaService';

const ConfiguracionAlertas = () => {
    const [dias, setDias] = useState(obtenerDiasConfig());
    const [status, setStatus] = useState(false);

    const handleSave = () => {
        guardarDiasConfig(dias);
        setStatus(true);
        setTimeout(() => setStatus(false), 3000); // Borra el mensaje tras 3s
        window.dispatchEvent(new Event('storage')); // Avisa a otros componentes del cambio
    };

    return (
        <Paper sx={{ p: 3, mt: 2, maxWidth: 400 }}>
            <Typography variant="h6" gutterBottom>Ajustes de Cobranza</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Días de anticipación para mostrar alertas:
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <TextField
                    type="number"
                    size="small"
                    value={dias}
                    onChange={(e) => setDias(e.target.value)}
                    inputProps={{ min: 1 }}
                />
                <Button variant="contained" onClick={handleSave}>Guardar</Button>
            </Box>
            {status && <Alert severity="success" sx={{ mt: 2 }}>Configuración guardada localmente</Alert>}
        </Paper>
    );
};

export default ConfiguracionAlertas;