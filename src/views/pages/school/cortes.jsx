import { useState, useEffect } from "react";
import {
  CForm, CFormInput, CButton, CAlert,
  CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell,
  CPagination, CPaginationItem, CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter, CCol, CRow
} from "@coreui/react";
import { apiUrl } from "../../../api";
const token = localStorage.getItem("token");
const CrudCortes = () => {
  const [nombre, setNombre] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [cortes, setCortes] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editNombre, setEditNombre] = useState("");
  const [editFechaInicio, setEditFechaInicio] = useState("");
  const [editFechaFin, setEditFechaFin] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [pagina, setPagina] = useState(1);
  const registrosPorPagina = 3;

  // Modal para confirmar eliminación
  const [modalEliminar, setModalEliminar] = useState(false);
  const [idEliminar, setIdEliminar] = useState(null);

  // Modal para crear momento
  const [modalCrear, setModalCrear] = useState(false);

  // Obtener cortes al cargar
  const fetchCortes = async () => {
    const res = await fetch(apiUrl + "/listarcortes",
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    const data = await res.json();
    setCortes(data.cortes || []);
  };

  useEffect(() => {
    fetchCortes();
  }, []);

  // Crear corte
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");
    setError("");
    if (!nombre || !fechaInicio || !fechaFin) {
      setError("Todos los campos son obligatorios");
      setTimeout(() => setError(""), 2500);
      return;
    }
    try {
      const res = await fetch(apiUrl + "/crearcortes", {
        method: "POST",
        headers: { "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`
         },
        body: JSON.stringify({
          nombre,
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMensaje(data.mensaje);
        setNombre("");
        setFechaInicio("");
        setFechaFin("");
        fetchCortes();
        setTimeout(() => setMensaje(""), 2500);
      } else {
        setError(data.mensaje || "Error al crear corte");
        setTimeout(() => setError(""), 2500);
      }
    } catch (err) {
      setError("Error de conexión");
      setTimeout(() => setError(""), 2500);
    }
    setModalCrear(false);
  };

  // Eliminar corte (abre modal)
  const handleEliminar = (id) => {
    setIdEliminar(id);
    setModalEliminar(true);
  };

  // Confirmar eliminación
  const confirmarEliminar = async () => {
    try {
      const res = await fetch(apiUrl + `/eliminarcortes/${idEliminar}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" ,
          'Authorization': `Bearer ${token}`}
      });
      const data = await res.json();
      if (res.ok) {
        setMensaje(data.mensaje);
        fetchCortes();
        setTimeout(() => setMensaje(""), 2500);
      } else {
        setError(data.mensaje || "Error al eliminar corte");
        setTimeout(() => setError(""), 2500);
      }
    } catch (err) {
      setError("Error de conexión");
      setTimeout(() => setError(""), 2500);
    }
    setModalEliminar(false);
    setIdEliminar(null);
  };

  // Iniciar edición
  const handleEditInit = (corte) => {
    setEditId(corte.id_corte);
    setEditNombre(corte.nombre);
    setEditFechaInicio(corte.fecha_inicio);
    setEditFechaFin(corte.fecha_fin);
    setMensaje("");
    setError("");
  };

  // Cancelar edición
  const handleEditCancel = () => {
    setEditId(null);
    setEditNombre("");
    setEditFechaInicio("");
    setEditFechaFin("");
  };

  // Guardar edición
  const handleEditSave = async () => {
    if (!editNombre || !editFechaInicio || !editFechaFin) {
      setError("Todos los campos son obligatorios");
      setTimeout(() => setError(""), 2500);
      return;
    }
    try {
      const res = await fetch(apiUrl + `/editarcortes/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`
         },
        body: JSON.stringify({
          nombre: editNombre,
          fecha_inicio: editFechaInicio,
          fecha_fin: editFechaFin,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMensaje(data.mensaje);
        setEditId(null);
        fetchCortes();
        setTimeout(() => setMensaje(""), 2500);
      } else {
        setError(data.mensaje || "Error al editar corte");
        setTimeout(() => setError(""), 2500);
      }
    } catch (err) {
      setError("Error de conexión");
      setTimeout(() => setError(""), 2500);
    }
  };

  // Filtrar cortes por nombre o fecha
  const cortesFiltrados = cortes.filter(
    (corte) =>
      corte.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      (corte.fecha_inicio && corte.fecha_inicio.includes(busqueda)) ||
      (corte.fecha_fin && corte.fecha_fin.includes(busqueda))
  );

  // Paginación
  const totalPaginas = Math.ceil(cortesFiltrados.length / registrosPorPagina);
  const inicio = (pagina - 1) * registrosPorPagina;
  const cortesPaginados = cortesFiltrados.slice(
    inicio,
    inicio + registrosPorPagina
  );

  useEffect(() => {
    setPagina(1); // Reinicia a la primera página al filtrar
  }, [busqueda]);

  // Función para mostrar solo la fecha (sin hora)
  const soloFecha = (fecha) => (fecha ? fecha.substring(0, 10) : "");

  return (
    <div className="mt-4">
      <CRow className="mb-2">
        <CCol xs={12} md={6} className="d-flex gap-2 align-items-center">
          <CButton
            color="primary"
            size="sm"
            style={{
              borderRadius: 8,
              fontWeight: "bold",
              fontSize: 15,
              minWidth: 140,
              boxShadow: "0 1px 6px #114c5f",
              background: "linear-gradient(95deg, #114c5f 80%, #2699b0 100%)",
            }}
            onClick={() => setModalCrear(true)}
          >
            Crear Momento
          </CButton>
        </CCol>
      </CRow>

      {mensaje && <CAlert color="success">{mensaje}</CAlert>}
      {error && <CAlert color="danger">{error}</CAlert>}

      {/* Barra de filtrado */}
      <CFormInput
        type="text"
        size="sm"
        placeholder="Filtrar por nombre o fecha..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="mb-3"
      />

      {/* Tabla de momentos */}
      <CTable hover responsive bordered align="middle">
        <CTableHead color="light">
          <CTableRow style={{ textAlign: "center" }}>
            <CTableHeaderCell>Nombre</CTableHeaderCell>
            <CTableHeaderCell>Fecha de Inicio</CTableHeaderCell>
            <CTableHeaderCell>Fecha de Fin</CTableHeaderCell>
            <CTableHeaderCell>Acciones</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody style={{ textAlign: "center" }}>
          {cortesPaginados.map((corte) => (
            <CTableRow key={corte.id_corte}>
              <CTableDataCell>
                {editId === corte.id_corte ? (
                  <CFormInput
                    size="sm"
                    value={editNombre}
                    onChange={(e) => setEditNombre(e.target.value)}
                    required
                  />
                ) : (
                  corte.nombre
                )}
              </CTableDataCell>
              <CTableDataCell>
                {editId === corte.id_corte ? (
                  <CFormInput
                    type="date"
                    size="sm"
                    value={editFechaInicio}
                    onChange={(e) => setEditFechaInicio(e.target.value)}
                    required
                  />
                ) : (
                  soloFecha(corte.fecha_inicio)
                )}
              </CTableDataCell>
              <CTableDataCell>
                {editId === corte.id_corte ? (
                  <CFormInput
                    type="date"
                    size="sm"
                    value={editFechaFin}
                    onChange={(e) => setEditFechaFin(e.target.value)}
                    required
                  />
                ) : (
                  soloFecha(corte.fecha_fin)
                )}
              </CTableDataCell>
              <CTableDataCell>
                {editId === corte.id_corte ? (
                  <>
                    <CButton
                      color="success"
                      size="sm"
                      shape="rounded-pill"
                      className="me-2"
                      onClick={handleEditSave}
                    >
                      Guardar
                    </CButton>
                    <CButton
                      color="danger"
                      size="sm"
                      shape="rounded-pill"
                      onClick={handleEditCancel}
                    >
                      Cancelar
                    </CButton>
                  </>
                ) : (
                  <>
                    <CButton
                      color="info"
                      size="sm"
                      shape="rounded-pill"
                      className="me-2"
                      onClick={() => handleEditInit(corte)}
                    >
                      Editar
                    </CButton>
                    <CButton
                      color="danger"
                      size="sm"
                      shape="rounded-pill"
                      onClick={() => handleEliminar(corte.id_corte)}
                    >
                      Eliminar
                    </CButton>
                  </>
                )}
              </CTableDataCell>
            </CTableRow>
          ))}
        </CTableBody>
      </CTable>

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div className="d-flex justify-content-center mt-3">
          <CPagination align="center" size="sm">
            {[...Array(totalPaginas)].map((_, idx) => (
              <CPaginationItem
                key={idx}
                active={pagina === idx + 1}
                onClick={() => setPagina(idx + 1)}
                style={{ cursor: "pointer" }}
              >
                {idx + 1}
              </CPaginationItem>
            ))}
          </CPagination>
        </div>
      )}

      {/* Modal para crear momento */}
      <CModal
        visible={modalCrear}
        onClose={() => setModalCrear(false)}
        size="md"
        alignment="center"
        backdrop="static"
      >
        <CModalHeader className="bg-primary" style={{ borderRadius: 8 }}>
          <CModalTitle className="text-white fs-6">Crear Momento</CModalTitle>
        </CModalHeader>
        <CModalBody style={{ background: "#f9fcfd", borderRadius: 8 }}>
          <CForm onSubmit={handleSubmit}>
            <CFormInput
              label="Nombre del momento"
              placeholder="Ejm primer momento"
              size="sm"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="mb-2"
              required
            />
            <CFormInput
              label="Fecha de Inicio"
              type="date"
              size="sm"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="mb-2"
              required
            />
            <CFormInput
              label="Fecha de Fin"
              type="date"
              size="sm"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="mb-2"
              required
            />
            <div className="d-flex justify-content-end">
              <CButton
                type="submit"
                color="primary"
                size="sm"
                shape="rounded-pill"
                className="fw-bold px-4"
              >
                Crear
              </CButton>
            </div>
          </CForm>
        </CModalBody>
      </CModal>

      {/* Modal de confirmación para eliminar */}
      <CModal
        visible={modalEliminar}
        onClose={() => setModalEliminar(false)}
        alignment="center"
        backdrop="static"
      >
        <CModalHeader>
          <CModalTitle>Confirmar Eliminación</CModalTitle>
        </CModalHeader>
        <CModalBody>¿Seguro que desea eliminar este corte?</CModalBody>
        <CModalFooter>
          <CButton color="danger" onClick={confirmarEliminar}>
            Eliminar
          </CButton>
          <CButton color="secondary" onClick={() => setModalEliminar(false)}>
            Cancelar
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  );
};

export default CrudCortes;