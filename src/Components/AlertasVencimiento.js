import React, { useEffect, useState } from 'react';

const AlertasVencimiento = () => {
  const [alertas, setAlertas] = useState([]);

  useEffect(() => {
    // Apuntamos al endpoint de tu foto (puerto 5230 según tu .env)
    fetch('http://localhost:5230/alumnos/alertas-vencimiento')
      .then(res => res.json())
      .then(data => setAlertas(data))
      .catch(err => console.error("Error:", err));
  }, []);

  if (alertas.length === 0) return null;

  return (
    <div style={{ background: '#fee2e2', border: '1px solid #ef4444', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
      <h3 style={{ color: '#991b1b', margin: 0 }}>⚠️ Alumnos por vencer (Próximos 5 días)</h3>
      <ul>
        {alertas.map((a, i) => <li key={i}>{a.nombre} - Tutor: {a.nombreTutor}</li>)}
      </ul>
    </div>
  );
};

export default AlertasVencimiento;