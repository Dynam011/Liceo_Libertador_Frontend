import React, { useState, useEffect, useRef } from "react";
import {
  CForm, CFormInput, CButton, CAlert, CRow, CCol, CContainer,
  CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter,
  CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell
} from "@coreui/react";
import { apiUrl } from "../../../api";
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

  useEffect(() => { recargarRef.current = cargarAnios; }, []);
  useEffect(() => { cargarAnios(); }, []);
  useEffect(() => { if (recargar) cargarAnios(); }, [recargar]);
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
    <CContainer className="px-0 mt-4">
      {mensaje && <CAlert color="info" className="text-center">{mensaje}</CAlert>}
      <CTable bordered responsive className="align-middle">
        <CTableHead color="light">
          <CTableRow>
            <CTableHeaderCell>Nombre</CTableHeaderCell>
            <CTableHeaderCell style={{ width: 180 }}>Acciones</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {anios.map(a => (
            <CTableRow key={a.id_año_escolar}>
              <CTableDataCell>
                {editando === a.id_año_escolar ? (
                  <CFormInput
                    value={nuevoNombre}
                    onChange={e => setNuevoNombre(e.target.value)}
                    size="sm"
                  />
                ) : (
                  a.nombre
                )}
              </CTableDataCell>
              <CTableDataCell>
                {editando === a.id_año_escolar ? (
                  <>
                    <CButton color="success" size="sm" className="me-2" onClick={() => guardarEdicion(a.id_año_escolar)}>Guardar</CButton>
                    <CButton color="secondary" size="sm" variant="outline" onClick={cancelarEdicion}>Cancelar</CButton>
                  </>
                ) : (
                  <>
                    <CButton color="info" size="sm" className="me-2" onClick={() => iniciarEdicion(a.id_año_escolar, a.nombre)}>Editar</CButton>
                    <CButton color="danger" size="sm" variant="outline" onClick={() => confirmarEliminar(a.id_año_escolar)}>Eliminar</CButton>
                  </>
                )}
              </CTableDataCell>
            </CTableRow>
          ))}
          {anios.length === 0 && (
            <CTableRow>
              <CTableDataCell colSpan={2} className="text-center">No hay años escolares registrados.</CTableDataCell>
            </CTableRow>
          )}
        </CTableBody>
      </CTable>
      {/* Modal de confirmación */}
      <CModal visible={modalEliminar} onClose={() => setModalEliminar(false)}>
        <CModalHeader>
          <CModalTitle>Confirmar Eliminación</CModalTitle>
        </CModalHeader>
        <CModalBody>
          ¿Seguro que deseas eliminar este año escolar?
        </CModalBody>
        <CModalFooter>
          <CButton color="danger" onClick={eliminarAnio}>Eliminar</CButton>
          <CButton color="secondary" variant="outline" onClick={() => setModalEliminar(false)}>Cancelar</CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  );
}

// --- MODAL CREAR AÑO ESCOLAR ---
function ModalCrearAnioEscolar({ visible, onClose, onSuccess }) {
  const [nombre, setNombre] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [tipo, setTipo] = useState("success");

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
      const res = await fetch(apiUrl + "/anios-escolares", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre }),
      });
      const data = await res.json();
      if (res.ok) {
        setTipo("success");
        setMensaje("Año escolar creado correctamente");
        setNombre("");
        if (onSuccess) onSuccess();
        onClose();
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
    <CModal visible={visible} onClose={onClose} alignment="center" size="sm">
      <CModalHeader>
        <CModalTitle>Crear Año Escolar</CModalTitle>
      </CModalHeader>
      <CModalBody>
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
            <CButton color="info" type="submit">Crear</CButton>
          </div>
        </CForm>
        {mensaje && <CAlert color={tipo} className="mt-3 text-center">{mensaje}</CAlert>}
      </CModalBody>
    </CModal>
  );
}

// --- Página principal ---
export default function CrearAnioEscolar() {
  const [recargar, setRecargar] = useState(false);
  const [modalCrearVisible, setModalCrearVisible] = useState(false);

  const handleRecargar = () => setRecargar(r => !r);

  return (
    <CContainer className="py-4" style={{ maxWidth: 700 }}>
      <CRow className="mb-3">
        <CCol xs={12}>
          <CButton color="info" className="w-10 mb-2" onClick={() => setModalCrearVisible(true)}>
            Crear Año Escolar
          </CButton>
        </CCol>
      </CRow>
      <ModalCrearAnioEscolar
        visible={modalCrearVisible}
        onClose={() => setModalCrearVisible(false)}
        onSuccess={handleRecargar}
      />
      <ModuloAniosEscolaresAdmin recargar={recargar} />
    </CContainer>
  );
}