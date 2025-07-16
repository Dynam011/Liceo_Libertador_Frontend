import React, { useState, useEffect, useRef } from 'react';
import {apiUrl} from "../../../api"
const ORDEN_ANIOS = [
  "Primero", "Segundo", "Tercero", "Cuarto", "Quinto", "Sexto", "Séptimo", "Octavo", "Noveno"
];

const API_URL = apiUrl;

const BoletinPorSeccion = () => {
  const [aniosSecciones, setAniosSecciones] = useState({});
  const [seccionSeleccionada, setSeccionSeleccionada] = useState('');
  const [estudiantes, setEstudiantes] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const [loadingExcelId, setLoadingExcelId] = useState(null);
  const [loadingAll, setLoadingAll] = useState(false);
  const [loadingAllExcel, setLoadingAllExcel] = useState(false);
  const cancelarRef = useRef(false);
  const cancelarExcelRef = useRef(false);

  // Cargar años y secciones al montar
  useEffect(() => {
    fetch(`${API_URL}/anios-secciones`)
      .then(res => res.json())
      .then(data => setAniosSecciones(data.anios_secciones || {}));
  }, []);

  // Cargar estudiantes al seleccionar sección
  useEffect(() => {
    if (seccionSeleccionada) {
      fetch(`${API_URL}/estudiantes-por-seccion?id_seccion=${seccionSeleccionada}`)
        .then(res => res.json())
        .then(data => setEstudiantes(data.estudiantes || []));
    } else {
      setEstudiantes([]);
    }
  }, [seccionSeleccionada]);

  const generarBoletin = async (cedula) => {
    setLoadingId(cedula);
    try {
      const response = await fetch(`${API_URL}/boletin/${cedula}`, { method: 'GET' });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `boletin_${cedula}.pdf`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      }
    } finally {
      setLoadingId(null);
    }
  };

  const generarBoletinExcel = async (cedula) => {
    setLoadingExcelId(cedula);
    try {
      window.open(`${API_URL}/boletin-excel/${cedula}`, '_blank');
      // Espera un poco para que el usuario vea el estado
      await new Promise(res => setTimeout(res, 500));
    } finally {
      setLoadingExcelId(null);
    }
  };

  const generarTodos = async () => {
    setLoadingAll(true);
    cancelarRef.current = false;
    for (const est of estudiantes) {
      if (cancelarRef.current) break;
      setLoadingId(est.cedula);
      await generarBoletin(est.cedula);
    }
    setLoadingId(null);
    setLoadingAll(false);
    cancelarRef.current = false;
  };

  const generarTodosExcel = async () => {
    setLoadingAllExcel(true);
    cancelarExcelRef.current = false;
    for (const est of estudiantes) {
      if (cancelarExcelRef.current) break;
      setLoadingExcelId(est.cedula);
      await generarBoletinExcel(est.cedula);
    }
    setLoadingExcelId(null);
    setLoadingAllExcel(false);
    cancelarExcelRef.current = false;
  };

  const cancelarGeneracion = () => {
    cancelarRef.current = true;
    setLoadingAll(false);
    setLoadingId(null);
  };

  const cancelarGeneracionExcel = () => {
    cancelarExcelRef.current = true;
    setLoadingAllExcel(false);
    setLoadingExcelId(null);
  };

  // Ordenar los años según ORDEN_ANIOS
  const aniosOrdenados = Object.keys(aniosSecciones).sort(
    (a, b) => ORDEN_ANIOS.indexOf(a) - ORDEN_ANIOS.indexOf(b)
  );

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Boletines por Sección</h2>
      <select
        value={seccionSeleccionada}
        onChange={e => setSeccionSeleccionada(e.target.value)}
        style={styles.input}
      >
        <option value="">Seleccione una sección</option>
        {aniosOrdenados.map(anio => (
          <optgroup key={anio} label={anio}>
            {aniosSecciones[anio].map(sec => (
              <option key={sec.id_seccion} value={sec.id_seccion}>
                {anio} {sec.nombre_seccion}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      <div style={{ marginTop: 30 }}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th>Cédula</th>
              <th>Nombre</th>
              <th>Año Escolar</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {estudiantes.length === 0 && (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', color: '#888' }}>No hay estudiantes</td>
              </tr>
            )}
            {estudiantes.map(est => (
              <tr key={est.cedula}>
                <td>{est.cedula}</td>
                <td>{est.nombres} {est.apellidos}</td>
                <td>{est.año_escolar}</td>
                <td style={{ display: 'flex', gap: 8 }}>
                  <button
                    style={styles.button}
                    onClick={() => generarBoletin(est.cedula)}
                    disabled={loadingId === est.cedula || loadingAll || loadingAllExcel}
                  >
                    {(loadingAll && loadingId === est.cedula)
                      ? 'Generando...'
                      : (loadingId === est.cedula ? 'Generando...' : 'PDF')}
                  </button>
                  <button
                    style={styles.buttonExcel}
                    onClick={() => generarBoletinExcel(est.cedula)}
                    disabled={loadingExcelId === est.cedula || loadingAll || loadingAllExcel}
                  >
                    {(loadingAllExcel && loadingExcelId === est.cedula)
                      ? 'Generando...'
                      : (loadingExcelId === est.cedula ? 'Generando...' : 'Excel')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {estudiantes.length > 0 && (
          <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center', gap: 16 }}>
            <button
              style={styles.buttonAll}
              onClick={generarTodos}
              disabled={loadingAll || loadingAllExcel}
            >
              {loadingAll ? 'Generando todos PDF...' : 'Imprimir todos los boletines PDF'}
            </button>
            {loadingAll && (
              <button
                style={styles.buttonCancel}
                onClick={cancelarGeneracion}
              >
                Cancelar PDF
              </button>
            )}
            
            
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '900px',
    margin: '40px auto',
    padding: '30px 20px',
    textAlign: 'center',
    boxShadow: '0 0 16px #b0c4d6',
    borderRadius: '16px',
    fontFamily: 'Segoe UI, Arial, sans-serif',
    background: '#fafdff'
  },
  title: {
    marginBottom: '30px',
    color: '#114c5f',
    fontWeight: 700,
    fontSize: '2rem'
  },
  input: {
    width: '60%',
    padding: '10px',
    fontSize: '1rem',
    borderRadius: '6px',
    border: '1px solid #b0c4d6',
    background: '#fff'
  },
  button: {
    padding: '8px 10px',
    fontSize: '1rem',
    backgroundColor: '#114c5f',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 600
  },
  buttonExcel: {
    padding: '8px 10px',
    fontSize: '1rem',
    backgroundColor: '#388e3c',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 600
  },
  buttonAll: {
    padding: '12px 18px',
    fontSize: '1.1rem',
    backgroundColor: '#1976d2',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 700,
    boxShadow: '0 2px 8px #b0c4d6'
  },
  buttonAllExcel: {
    padding: '12px 18px',
    fontSize: '1.1rem',
    backgroundColor: '#388e3c',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 700,
    boxShadow: '0 2px 8px #b0c4d6'
  },
  buttonCancel: {
    padding: '12px 18px',
    fontSize: '1.1rem',
    backgroundColor: '#d32f2f',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 700,
    boxShadow: '0 2px 8px #b0c4d6'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    background: '#fff',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 0 8px #e0e0e0'
  }
};

export default BoletinPorSeccion;
