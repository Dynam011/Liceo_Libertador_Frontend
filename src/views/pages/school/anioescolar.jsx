import React, { useState, useEffect, useRef } from "react";
import { CForm, CFormInput, CButton, CAlert, CCard, CCardBody, CCardHeader, CCardTitle, CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter } from "@coreui/react";
import {apiUrl} from "../../../api"
const API = apiUrl;

// --- Módulo de listado y edición de años escolares ---
function ModuloAniosEscolaresAdmin({ recargar }) {
  const [anios, setAnios] = useState([]);
  const [editando, setEditando] = useState(null); // id en edición
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [mensaje, setMensaje] = useState('');
  const recargarRef = useRef();

  // Modal de confirmación para eliminar
  const [modalEliminar, setModalEliminar] = useState(false);
  const [anioAEliminar, setAnioAEliminar] = useState(null);

  // Permite recargar desde el padre
  useEffect(() => {
    recargarRef.current = cargarAnios;
  });

  useEffect(() => {
    cargarAnios();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (recargar) cargarAnios();
    // eslint-disable-next-line
  }, [recargar]);

  // Cierra el mensaje automáticamente después de 2.5 segundos
  useEffect(() => {
    if (mensaje) {
      const timer = setTimeout(() => setMensaje(""), 2500);
      return () => clearTimeout(timer);
    }
  }, [mensaje]);

  function cargarAnios() {
    fetch(`${API}/admin-anios-escolares`)
      .then(r => r.json())
      .then(r => setAnios(r.aniosEscolaresAdmin || []));
  }

  const iniciarEdicion = (id, nombre) => {
    setEditando(id);
    setNuevoNombre(nombre);
    setMensaje('');
  };

  const cancelarEdicion = () => {
    setEditando(null);
    setNuevoNombre('');
    setMensaje('');
  };

  const guardarEdicion = async (id) => {
    const res = await fetch(`${API}/admin-anios-escolares/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: nuevoNombre })
    });
    const data = await res.json();
    if (res.ok) {
      setAnios(anios.map(a => a.id_año_escolar === id ? { ...a, nombre: nuevoNombre } : a));
      setMensaje('Año escolar actualizado');
      cancelarEdicion();
    } else {
      setMensaje(data.mensaje || 'Error al editar');
    }
  };

  // Mostrar modal para confirmar eliminación
  const confirmarEliminar = (id) => {
    setAnioAEliminar(id);
    setModalEliminar(true);
  };

  const eliminarAnio = async () => {
    if (!anioAEliminar) return;
    const res = await fetch(`${API}/admin-anios-escolares/${anioAEliminar}`, { method: 'DELETE' });
    const data = await res.json();
    if (res.ok) {
      setAnios(anios.filter(a => a.id_año_escolar !== anioAEliminar));
      setMensaje('Año escolar eliminado');
    } else {
      setMensaje(data.mensaje || 'Error al eliminar');
    }
    setModalEliminar(false);
    setAnioAEliminar(null);
  };

  return (
    <>
      <CCard className="shadow mt-4">
        <CCardHeader style={{ background: "#114c5f", color: "#fff" }}>
          <CCardTitle>Listado y Edición de Años Escolares</CCardTitle>
        </CCardHeader>
        <CCardBody>
          {mensaje && <CAlert color="info" className="text-center">{mensaje}</CAlert>}
          <div className="table-responsive">
            <table className="table table-bordered align-middle">
              <thead className="table-light">
                <tr>
                  <th>Nombre</th>
                  <th style={{width: 180}}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {anios.map(a => (
                  <tr key={a.id_año_escolar}>
                    <td>
                      {editando === a.id_año_escolar ? (
                        <input
                          value={nuevoNombre}
                          onChange={e => setNuevoNombre(e.target.value)}
                          className="form-control"
                        />
                      ) : (
                        a.nombre
                      )}
                    </td>
                    <td>
                      {editando === a.id_año_escolar ? (
                        <>
                          <CButton style={{backgroundColor:'white', color:'green', borderColor:'green'}} size="sm" className="me-2" onClick={() => guardarEdicion(a.id_año_escolar)}>Guardar</CButton>
                          <CButton style={{backgroundColor:'white', color:'blue', borderColor:'blue'}} size="sm" variant="outline" onClick={cancelarEdicion}>Cancelar</CButton>
                        </>
                      ) : (
                        <>
                          <CButton style={{backgroundColor:'white', color:'blue', borderColor:'blue'}} size="sm" className="me-2" onClick={() => iniciarEdicion(a.id_año_escolar, a.nombre)}>Editar</CButton>
                          <CButton style={{backgroundColor:'white', color:'red', borderColor:'red'}} size="sm" variant="outline" onClick={() => confirmarEliminar(a.id_año_escolar)}>Eliminar</CButton>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
                {anios.length === 0 && (
                  <tr>
                    <td colSpan={2} className="text-center">No hay años escolares registrados.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CCardBody>
      </CCard>
      {/* Modal de confirmación */}
      <CModal visible={modalEliminar} onClose={() => setModalEliminar(false)}>
        <CModalHeader>
          <CModalTitle>Confirmar Eliminación</CModalTitle>
        </CModalHeader>
        <CModalBody>
          ¿Seguro que deseas eliminar este año escolar?
        </CModalBody>
        <CModalFooter>
          <CButton style={{backgroundColor:'white', color:'red', borderColor:'red'}} onClick={eliminarAnio}>Eliminar</CButton>
          <CButton style={{backgroundColor:'white', color:'blue', borderColor:'blue'}} variant="outline" onClick={() => setModalEliminar(false)}>Cancelar</CButton>
        </CModalFooter>
      </CModal>
    </>
  );
}

// --- Formulario de creación de año escolar ---
export default function CrearAnioEscolar() {
  const [nombre, setNombre] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [tipo, setTipo] = useState("success");
  const [recargar, setRecargar] = useState(false);

  // Cierra el mensaje automáticamente después de 2.5 segundos
  useEffect(() => {
    if (mensaje) {
      const timer = setTimeout(() => setMensaje(""), 2500);
      return () => clearTimeout(timer);
    }
  }, [mensaje]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");
    try {
      const res = await fetch(apiUrl+"/anios-escolares", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre }),
      });
      const data = await res.json();
      if (res.ok) {
        setTipo("success");
        setMensaje("Año escolar creado correctamente");
        setNombre("");
        setRecargar(r => !r); // Fuerza recarga del listado
      } else {
        setTipo("danger");
        setMensaje(data.mensaje || "Error al crear año escolar");
      }
    } catch {
      setTipo("danger");
      setMensaje("Error al crear año escolar");
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "40px auto" }}>
      <CCard className="shadow">
        <CCardHeader style={{ background: "#114c5f", color: "#fff" }}>
          <CCardTitle>Crear Año Escolar</CCardTitle>
        </CCardHeader>
        <CCardBody>
          <CForm onSubmit={handleSubmit}>
            <CFormInput
              label="Nombre del año escolar"
              placeholder="Ej: 2024-2025"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              required
              className="mb-3"
            />
            <div className="d-grid">
              <CButton style={{backgroundColor:'#114c5f', color:'white'}} type="submit">Crear</CButton>
            </div>
          </CForm>
          {mensaje && <CAlert color={tipo} className="mt-3 text-center">{mensaje}</CAlert>}
        </CCardBody>
      </CCard>
      {/* Módulo de listado debajo del formulario */}
      <ModuloAniosEscolaresAdmin recargar={recargar} />
    </div>
  );
}