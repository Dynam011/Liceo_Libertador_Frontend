import React, { useState, useEffect } from "react";
import {
  CCard, CCardBody, CCardHeader, CCardTitle, CForm, CFormSelect, CFormInput, CButton, CAlert, CRow, CCol,
  CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell, CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter, CPagination, CPaginationItem
} from "@coreui/react";
import {apiUrl} from "../../../api"
const API = apiUrl;

// --- Crear Director ---
function CrearDirector({ onSuccess }) {
  const [director, setDirector] = useState({
    nombre: "",
    apellido: "",
    titulo: "",
    cedula: "",
    tipo_documento: "",
    email: "",
    telefono: ""
  });
  const [mensaje, setMensaje] = useState("");
  const [tipo, setTipo] = useState("success");

  useEffect(() => {
    if (mensaje) {
      const timer = setTimeout(() => setMensaje(""), 2500);
      return () => clearTimeout(timer);
    }
  }, [mensaje]);

  const handleChange = e => {
    setDirector({ ...director, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setMensaje("");
    try {
      const res = await fetch(`${API}/registrar-director`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(director)
      });
      const data = await res.json();
      if (res.ok) {
        setTipo("success");
        setMensaje("Director creado correctamente");
        setDirector({
          nombre: "",
          apellido: "",
          titulo: "",
          cedula: "",
          tipo_documento: "",
          email: "",
          telefono: ""
        });
        if (onSuccess) onSuccess();
      } else {
        setTipo("danger");
        setMensaje(data.mensaje || "Error al crear director");
      }
    } catch {
      setTipo("danger");
      setMensaje("Error al crear director");
    }
  };

  return (
    <CCard className="shadow mb-4">
      <CCardHeader style={{ background: "#114c5f", color: "#fff" }}>
        <CCardTitle>Registrar Director</CCardTitle>
      </CCardHeader>
      <CCardBody>
        <CForm onSubmit={handleSubmit}>
          <CRow className="g-3">
            <CCol md={6}>
              <CFormInput label="Nombre" name="nombre" value={director.nombre} onChange={handleChange} required />
            </CCol>
            <CCol md={6}>
              <CFormInput label="Apellido" name="apellido" value={director.apellido} onChange={handleChange} required />
            </CCol>
            <CCol md={6}>
              <CFormInput label="Título" name="titulo" value={director.titulo} onChange={handleChange} required />
            </CCol>
            <CCol md={6}>
              <CFormInput label="Cédula" name="cedula" value={director.cedula} onChange={handleChange} required />
            </CCol>
            <CCol md={6}>
              <CFormSelect
              label="Tipo de documento"
              name="tipo_documento"
              value={director.tipo_documento}
              onChange={handleChange}
              required
            >
              <option value="">Seleccione tipo</option>
              <option value={1}>V</option>
              <option value={2}>E</option>
              <option value={3}>P</option>
            </CFormSelect>
            </CCol>
            <CCol md={6}>
              <CFormInput label="Email" name="email" type="email" value={director.email} onChange={handleChange} required />
            </CCol>
            <CCol md={6}>
              <CFormInput label="Teléfono" name="telefono" value={director.telefono} onChange={handleChange} required />
            </CCol>
            <CCol xs={12}>
              <div className="d-grid">
                <CButton type="submit" style={{ background: "#114c5f", color: "#fff" }}>
                  Registrar
                </CButton>
              </div>
            </CCol>
            {mensaje && (
              <CCol xs={12}>
                <CAlert color={tipo} className="mt-3 text-center">
                  {mensaje}
                </CAlert>
              </CCol>
            )}
          </CRow>
        </CForm>
      </CCardBody>
    </CCard>
  );
}

// --- Asignar Director a Año Escolar ---
function AsignarDirectorAnioEscolar({ onSuccess }) {
  const [form, setForm] = useState({
    director_id: "",
    id_año_escolar: "",
    fecha_inicio: ""
  });
  const [directores, setDirectores] = useState([]);
  const [aniosEscolares, setAniosEscolares] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState("success");

  const cargarDatos = () => {
    fetch(`${API}/directores`)
      .then(res => res.json())
      .then(data => setDirectores(data.directores || []))
      .catch(() => setDirectores([]));
    fetch(`${API}/admin-anios-escolares`)
      .then(res => res.json())
      .then(data => setAniosEscolares(data.aniosEscolaresAdmin || []))
      .catch(() => setAniosEscolares([]));
  };

  useEffect(() => {
    cargarDatos();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (mensaje) {
      const timer = setTimeout(() => setMensaje(""), 2500);
      return () => clearTimeout(timer);
    }
  }, [mensaje]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setMensaje("");
    try {
      const res = await fetch(`${API}/asignar-director-anio-escolar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) {
        setTipoMensaje("success");
        setMensaje("Director asignado correctamente al año escolar");
        setForm({
          director_id: "",
          id_año_escolar: "",
          fecha_inicio: ""
        });
        if (onSuccess) onSuccess();
        cargarDatos();
      } else {
        setTipoMensaje("danger");
        setMensaje(data.mensaje || "Error al asignar director");
      }
    } catch {
      setTipoMensaje("danger");
      setMensaje("Error al asignar director");
    }
  };

  return (
    <CCard className="shadow mb-4">
      <CCardHeader style={{ background: "#114c5f", color: "#fff" }}>
        <CCardTitle>Asignar Director a Año Escolar</CCardTitle>
      </CCardHeader>
      <CCardBody>
        <CForm onSubmit={handleSubmit}>
          <CRow className="g-3 align-items-end">
            <CCol md={6}>
              <CFormSelect
                name="director_id"
                value={form.director_id}
                onChange={handleChange}
                label="Director"
                required
              >
                <option value="">Seleccione director</option>
                {directores.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.nombre} {d.apellido} ({d.cedula})
                  </option>
                ))}
              </CFormSelect>
            </CCol>
            <CCol md={6}>
              <CFormSelect
                name="id_año_escolar"
                value={form.id_año_escolar}
                onChange={handleChange}
                label="Año Escolar"
                required
              >
                <option value="">Seleccione año escolar</option>
                {aniosEscolares.map(a => (
                  <option key={a.id_año_escolar} value={a.id_año_escolar}>{a.nombre}</option>
                ))}
              </CFormSelect>
            </CCol>
            <CCol md={6}>
              <CFormInput
                type="date"
                name="fecha_inicio"
                value={form.fecha_inicio}
                onChange={handleChange}
                label="Fecha de inicio"
                required
              />
            </CCol>
            <CCol xs={12}>
              <div className="d-grid">
                <CButton type="submit" style={{ background: "#114c5f", color: "#fff" }}>
                  Asignar
                </CButton>
              </div>
            </CCol>
            {mensaje && (
              <CCol xs={12}>
                <CAlert color={tipoMensaje} className="mt-3 text-center">
                  {mensaje}
                </CAlert>
              </CCol>
            )}
          </CRow>
        </CForm>
      </CCardBody>
    </CCard>
  );
}

// --- ListaDirectores (el módulo que enviaste) ---
export default function DirectoresPage() {
  // Para refrescar los selects después de crear/asignar
  const [refresh, setRefresh] = useState(false);

  const handleRefresh = () => setRefresh(r => !r);

  return (
    <div style={{ maxWidth: 1400, margin: "40px auto" }}>
      <CRow className="mb-4">
        <CCol md={6}>
          <CrearDirector onSuccess={handleRefresh} key={refresh ? "crear1" : "crear0"} />
        </CCol>
        <CCol md={6}>
          <AsignarDirectorAnioEscolar onSuccess={handleRefresh} key={refresh ? "asignar1" : "asignar0"} />
        </CCol>
      </CRow>
      <ListaDirectores key={refresh ? "lista1" : "lista0"} />
    </div>
  );
}

// --- ListaDirectores reemplazado ---
function ListaDirectores() {
  const [directores, setDirectores] = useState([]);
  const [search, setSearch] = useState("");
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({});
  const [mensaje, setMensaje] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [idAEliminar, setIdAEliminar] = useState(null);

  // Paginación
  const [pagina, setPagina] = useState(1);
  const porPagina = 5;
  const totalPaginas = Math.ceil(directores.length / porPagina);

  const fetchDirectores = async (search = "") => {
    const res = await fetch(`http://localhost:4000/directoresconanio${search ? `?search=${encodeURIComponent(search)}` : ""}`);
    const data = await res.json();
    setDirectores(data.directores || []);
    setPagina(1); // Reinicia a la primera página al buscar
  };

  useEffect(() => { fetchDirectores(); }, []);

  useEffect(() => {
    if (mensaje) {
      const timer = setTimeout(() => setMensaje(""), 2500);
      return () => clearTimeout(timer);
    }
  }, [mensaje]);

  const handleSearch = e => {
    e.preventDefault();
    fetchDirectores(search);
  };

const handleEdit = (dir) => {
  setEditando(dir.id);
  setForm({
    ...dir,
    tipo_documento: dir.tipo_documento ? String(dir.tipo_documento) : "1"
  });
};

  const handleCancel = () => {
    setEditando(null);
    setForm({});
  };

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    const formToSend = {
      ...form,
      tipo_documento: parseInt(form.tipo_documento, 10)
    };
    const res = await fetch(`http://localhost:4000/directoreseditar/${editando}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formToSend)
    });
    const data = await res.json();
    if (res.ok) {
      setMensaje("Director actualizado");
      fetchDirectores(search);
      setEditando(null);
    } else {
      setMensaje(data.mensaje || "Error actualizando director");
    }
  };

  // Abrir modal para eliminar
  const handleDelete = (id) => {
    setIdAEliminar(id);
    setShowModal(true);
  };

  // Confirmar eliminación
  const confirmarEliminar = async () => {
    const res = await fetch(`http://localhost:4000/directoreseliminar/${idAEliminar}`, { method: "DELETE" });
    if (res.ok) {
      setMensaje("Director eliminado");
      fetchDirectores(search);
    } else {
      setMensaje("Error eliminando director");
    }
    setShowModal(false);
    setIdAEliminar(null);
  };

  // Paginación: directores a mostrar
  const directoresPagina = directores.slice((pagina - 1) * porPagina, pagina * porPagina);

  return (
    <>
      <CCard className="mx-auto mt-4" style={{ maxWidth: 1200 }}>
        <CCardHeader style={{ background: "#114c5f", color: "#fff" }}>
          <CCardTitle>Directores</CCardTitle>
        </CCardHeader>
        <CCardBody>
          <CForm onSubmit={handleSearch} className="mb-3">
            <CRow>
              <CCol md={10}>
                <CFormInput
                  placeholder="Buscar por nombre, apellido, cédula o año escolar"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </CCol>
              <CCol md={2}>
                <CButton type="submit" style={{backgroundColor:'#114c5f', color:'white', borderColor:'#114c5f'}} className="w-100">Buscar</CButton>
              </CCol>
            </CRow>
          </CForm>
          {mensaje && <div className="mb-2 text-success">{mensaje}</div>}
          <CTable striped hover responsive>
            <CTableHead style={{textAlign: 'center'}}>
              <CTableRow>
                <CTableHeaderCell>Tipo Doc.</CTableHeaderCell>
                <CTableHeaderCell>Cédula</CTableHeaderCell>
                <CTableHeaderCell>Nombre</CTableHeaderCell>
                <CTableHeaderCell>Apellido</CTableHeaderCell>
                <CTableHeaderCell>Título</CTableHeaderCell>
                <CTableHeaderCell>Email</CTableHeaderCell>
                <CTableHeaderCell>Teléfono</CTableHeaderCell>
                <CTableHeaderCell>Año Escolar</CTableHeaderCell>
                <CTableHeaderCell>Activo</CTableHeaderCell>
                <CTableHeaderCell>Acciones</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody style={{textAlign: 'center'}}>
              {directoresPagina.map(dir => (
                <CTableRow key={dir.id}>
                  <CTableDataCell>
                    <CFormSelect
                    name="tipo_documento"
                    value={form.tipo_documento}
                    onChange={handleChange}
                    size="sm"
                    disabled
                  >
                    <option value="1">V</option>
                    <option value="2">E</option>
                    <option value="3">P</option>
                  </CFormSelect>
                  </CTableDataCell>
                  <CTableDataCell>
                    {editando === dir.id
                      ? <CFormInput name="cedula" value={form.cedula} onChange={handleChange} size="sm" />
                      : dir.cedula}
                  </CTableDataCell>
                  <CTableDataCell>
                    {editando === dir.id
                      ? <CFormInput name="nombre" value={form.nombre} onChange={handleChange} size="sm" />
                      : dir.nombre}
                  </CTableDataCell>
                  <CTableDataCell>
                    {editando === dir.id
                      ? <CFormInput name="apellido" value={form.apellido} onChange={handleChange} size="sm" />
                      : dir.apellido}
                  </CTableDataCell>
                  
                  <CTableDataCell>
                    {editando === dir.id
                      ? <CFormInput name="titulo" value={form.titulo} onChange={handleChange} size="sm" />
                      : dir.titulo}
                  </CTableDataCell>
                  
                  <CTableDataCell>
                    {editando === dir.id
                      ? <CFormInput name="email" value={form.email} onChange={handleChange} size="sm" />
                      : dir.email}
                  </CTableDataCell>
                  <CTableDataCell>
                    {editando === dir.id
                      ? <CFormInput name="telefono" value={form.telefono} onChange={handleChange} size="sm" />
                      : dir.telefono}
                  </CTableDataCell>
                  <CTableDataCell>{dir.año_escolar}</CTableDataCell>
                  <CTableDataCell>
                    {editando === dir.id
                      ? (
                        <select name="activo" value={form.activo} onChange={handleChange} className="form-select form-select-sm">
                          <option value={true}>Sí</option>
                          <option value={false}>No</option>
                        </select>
                      )
                      : dir.activo ? "Sí" : "No"}
                  </CTableDataCell>
                  <CTableDataCell>
                    {editando === dir.id ? (
                      <>
                        <CButton style={{backgroundColor:'white', color:'green', borderColor:'green'}} size="sm" onClick={handleSave}>Guardar</CButton>{" "}
                        <CButton style={{backgroundColor:'white', color:'red', borderColor:'red'}} size="sm" onClick={handleCancel}>Cancelar</CButton>
                      </>
                    ) : (
                      <>
                        <CButton style={{backgroundColor:'white', color:'blue', borderColor:'blue'}} size="sm" onClick={() => handleEdit(dir)}>Editar</CButton>{" "}
                        <CButton style={{backgroundColor:'white', color:'red', borderColor:'red'}} size="sm" onClick={() => handleDelete(dir.id)}>Eliminar</CButton>
                      </>
                    )}
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
          {/* Paginación */}
          {totalPaginas > 1 && (
            <CPagination align="center" className="mt-3">
              <CPaginationItem
                disabled={pagina === 1}
                onClick={() => setPagina(pagina - 1)}
              >
                &laquo;
              </CPaginationItem>
              {Array.from({ length: totalPaginas }, (_, i) => (
                <CPaginationItem
                  key={i + 1}
                  active={pagina === i + 1}
                  onClick={() => setPagina(i + 1)}
                >
                  {i + 1}
                </CPaginationItem>
              ))}
              <CPaginationItem
                disabled={pagina === totalPaginas}
                onClick={() => setPagina(pagina + 1)}
              >
                &raquo;
              </CPaginationItem>
            </CPagination>
          )}
        </CCardBody>
      </CCard>
      {/* Modal de confirmación para eliminar */}
      <CModal visible={showModal} onClose={() => setShowModal(false)}>
        <CModalHeader>
          <CModalTitle>Confirmar Eliminación</CModalTitle>
        </CModalHeader>
        <CModalBody>
          ¿Seguro que desea eliminar este director?
        </CModalBody>
        <CModalFooter>
          <CButton style={{backgroundColor:'white', color:'red', borderColor:'red'}} onClick={confirmarEliminar}>Eliminar</CButton>
          <CButton style={{backgroundColor:'white', color:'blue', borderColor:'blue'}} variant="outline" onClick={() => setShowModal(false)}>Cancelar</CButton>
        </CModalFooter>
      </CModal>
    </>
  );
}