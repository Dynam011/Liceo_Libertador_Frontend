import { useState, useEffect } from "react";
import {
  CContainer, CRow, CCol, CCard, CCardHeader, CCardBody, CCardTitle,
  CForm, CFormLabel, CFormInput, CFormSelect, CButton, CAlert, CListGroup, CListGroupItem,
  CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell,
  CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter
} from "@coreui/react";
import {apiUrl} from "../../../api"
// --- Componente principal unificado ---
const InscribirMateria = () => {
  // --- Estados para Inscribir Estudiante ---
  const [estudiantes, setEstudiantes] = useState([]);
  const [secciones, setSecciones] = useState([]);
  const [aniosEscolares, setAniosEscolares] = useState([]);
  const [cedulaEstudiante, setCedulaEstudiante] = useState("");
  const [idSeccionSeleccionada, setIdSeccionSeleccionada] = useState("");
  const [fkAñoEscolarSeleccionado, setFkAñoEscolarSeleccionado] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState(null);

  // Admin/Gestor: inscripciones (solo para el listado de abajo)
  const [inscripciones, setInscripciones] = useState([]);
  const [filtroInscripcion, setFiltroInscripcion] = useState("");
  const [modalEdit, setModalEdit] = useState(false);
  const [editData, setEditData] = useState({});
  const [mensajeAdmin, setMensajeAdmin] = useState("");
  const [modalConfirm, setModalConfirm] = useState(false);
  const [idAEliminar, setIdAEliminar] = useState(null);
  const [pagina, setPagina] = useState(1);
  const registrosPorPagina = 10;

  // --- Estados para Inscribir Materias ---
  const [inscripcionesMaterias, setInscripcionesMaterias] = useState([]);
  const [idInscripcionSeleccionada, setIdInscripcionSeleccionada] = useState("");
  const [estudiante, setEstudiante] = useState(null);
  const [materiasDisponibles, setMateriasDisponibles] = useState([]);
  const [materiasSeleccionadas, setMateriasSeleccionadas] = useState([]);
  const [materiasReprobadas, setMateriasReprobadas] = useState([]);
  const [reprobadasSeleccionadas, setReprobadasSeleccionadas] = useState([]);
  const [mensajeMateria, setMensajeMateria] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [inscripcionesFiltradas, setInscripcionesFiltradas] = useState([]);
  const [modalMaterias, setModalMaterias] = useState(false);

  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");

  // --- Efectos y funciones para Inscribir Estudiante ---
  useEffect(() => {
    obtenerSecciones();
    obtenerAniosEscolares();
    if (usuario.rol === "admin" || usuario.rol === "gestor") fetchInscripciones();
    obtenerInscripcionesMaterias();
    // eslint-disable-next-line
  }, []);

  const obtenerSecciones = async () => {
    try {
      const resSecciones = await fetch(apiUrl+"/secciones");
      const dataSecciones = await resSecciones.json();
      setSecciones(dataSecciones.secciones || []);
    } catch (error) {
      console.error("Error obteniendo secciones:", error);
    }
  };

  const obtenerAniosEscolares = async () => {
    try {
      const resAnios = await fetch(apiUrl+"/aniosescolares");
      if (!resAnios.ok) throw new Error(`Error en la API: ${resAnios.status}`);
      const dataAnios = await resAnios.json();
      setAniosEscolares(Array.isArray(dataAnios.añosEscolares) ? dataAnios.añosEscolares : []);
    } catch (error) {
      console.error("Error obteniendo años escolares:", error.message);
      setAniosEscolares([]);
    }
  };

  const filtrarEstudiantes = async (cedula) => {
    setCedulaEstudiante(cedula);
    setEstudianteSeleccionado(null);
    if (!cedula) {
      setEstudiantes([]);
      return;
    }
    try {
      const res = await fetch(apiUrl+`/estudiantes?cedula=${cedula}`);
      const data = await res.json();
      setEstudiantes(data.estudiantes || []);
    } catch (error) {
      console.error("Error filtrando estudiantes:", error);
    }
  };

  const handleSeleccionarEstudiante = (est) => {
    setEstudianteSeleccionado(est);
    setCedulaEstudiante(est.cedula);
    setEstudiantes([]);
  };

  const handleInscribir = async (e) => {
    e.preventDefault();
    if (!cedulaEstudiante || !idSeccionSeleccionada || !fkAñoEscolarSeleccionado) {
      setMensaje("Todos los campos son obligatorios.");
      return;
    }
    try {
      const res = await fetch(apiUrl+"/inscribir-estudiante", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cedula_estudiante: cedulaEstudiante,
          id_seccion: idSeccionSeleccionada,
          fk_año_escolar: fkAñoEscolarSeleccionado
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMensaje("Estudiante inscrito correctamente.");
        setCedulaEstudiante("");
        setIdSeccionSeleccionada("");
        setFkAñoEscolarSeleccionado("");
        setEstudianteSeleccionado(null);
        if (usuario.rol === "admin" || usuario.rol === "gestor") fetchInscripciones();
        obtenerInscripcionesMaterias();
        setTimeout(() => setMensaje(""), 2500);
      } else {
        setMensaje(`Error: ${data.mensaje}`);
        setTimeout(() => setMensaje(""), 2500);
      }
    } catch (error) {
      setMensaje("Error en la conexión con el servidor.");
      setTimeout(() => setMensaje(""), 2500);
    }
  };

  // --- ADMIN/GESTOR: Inscripciones registradas (solo para el listado de abajo) ---
  const fetchInscripciones = async () => {
    try {
      const token = localStorage.getItem("token");
      let url = apiUrl+`/inscripciones-todas?`;
      if (filtroInscripcion) url += `filtro=${encodeURIComponent(filtroInscripcion)}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setInscripciones(data.inscripciones || []);
    } catch (error) {
      setMensajeAdmin("Error obteniendo inscripciones.");
      setTimeout(() => setMensajeAdmin(""), 2500);
    }
  };

  useEffect(() => {
    if (usuario.rol === "admin" || usuario.rol === "gestor") fetchInscripciones();
    // eslint-disable-next-line
  }, [filtroInscripcion]);

  const handleEliminarInscripcion = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(apiUrl+`/inscripciones/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setMensajeAdmin(data.mensaje || "Inscripción eliminada.");
      setTimeout(() => setMensajeAdmin(""), 2500);
      fetchInscripciones();
      obtenerInscripcionesMaterias();
    } catch (error) {
      setMensajeAdmin("Error eliminando inscripción.");
      setTimeout(() => setMensajeAdmin(""), 2500);
    }
  };

  const handleEditarInscripcion = (insc) => {
    setEditData(insc);
    setModalEdit(true);
  };

  const handleGuardarEdicion = async () => {
    if (!editData.id_seccion || !editData.fk_año_escolar) {
      setMensajeAdmin("Debe seleccionar sección y año escolar.");
      setTimeout(() => setMensajeAdmin(""), 2500);
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(apiUrl+`/inscripciones/${editData.id_inscripcion}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          id_seccion: editData.id_seccion,
          fk_año_escolar: editData.fk_año_escolar
        })
      });
      const data = await res.json();
      setModalEdit(false);
      setMensajeAdmin(data.mensaje || "Inscripción actualizada.");
      setTimeout(() => setMensajeAdmin(""), 2500);
      fetchInscripciones();
      obtenerInscripcionesMaterias();
    } catch (error) {
      setMensajeAdmin("Error editando inscripción.");
      setTimeout(() => setMensajeAdmin(""), 2500);
    }
  };

  const solicitarEliminarInscripcion = (id) => {
    setIdAEliminar(id);
    setModalConfirm(true);
    setTimeout(() => setMensajeAdmin(""), 2500);
  };

  // Calcular los registros a mostrar
  const inicio = (pagina - 1) * registrosPorPagina;
  const fin = inicio + registrosPorPagina;
  const inscripcionesPaginadas = inscripciones.slice(inicio, fin);

  // Calcular total de páginas
  const totalPaginas = Math.ceil(inscripciones.length / registrosPorPagina);

  // --- Efectos y funciones para Inscribir Materias ---
  useEffect(() => {
    if (!busqueda) {
      setInscripcionesFiltradas(inscripcionesMaterias);
    } else {
      const filtro = busqueda.toLowerCase();
      setInscripcionesFiltradas(
        inscripcionesMaterias.filter(i =>
          (i.nombres && i.nombres.toLowerCase().includes(filtro)) ||
          (i.apellidos && i.apellidos.toLowerCase().includes(filtro)) ||
          (i.cedula_estudiante && i.cedula_estudiante.toLowerCase().includes(filtro))
        )
      );
    }
  }, [busqueda, inscripcionesMaterias]);

  useEffect(() => {
    if (!idInscripcionSeleccionada) return;
    obtenerMaterias();
  }, [idInscripcionSeleccionada]);

  const obtenerInscripcionesMaterias = async () => {
    try {
      const res = await fetch(apiUrl+"/inscripciones");
      const data = await res.json();
      setInscripcionesMaterias(data.inscripciones || []);
    } catch (error) {
      console.error("Error obteniendo inscripciones:", error);
    }
  };

  const obtenerMaterias = async () => {
    try {
      const res = await fetch(apiUrl+`/inscripcion/${idInscripcionSeleccionada}/materias`);
      const data = await res.json();

      setEstudiante(data.estudiante || null);
      setMateriasDisponibles(data.materias || []);
      setMateriasSeleccionadas([]);

      if (data.estudiante && data.estudiante.cedula_estudiante) {
        const resReprobadas = await fetch(apiUrl+`/materias-reprobadas/${data.estudiante.cedula_estudiante}`);
        const dataReprobadas = await resReprobadas.json();
        setMateriasReprobadas(dataReprobadas.materiasReprobadas || []);
        setReprobadasSeleccionadas([]);
      } else {
        setMateriasReprobadas([]);
        setReprobadasSeleccionadas([]);
      }
    } catch (error) {
      console.error("Error obteniendo materias:", error);
    }
  };

  const handleSeleccionMaterias = (e) => {
    const seleccionadas = Array.from(e.target.selectedOptions, (option) => ({
      id: option.value,
      nombre: option.textContent
    }));
    setMateriasSeleccionadas(seleccionadas);
  };

  const handleSeleccionReprobadas = (e) => {
    const seleccionadas = Array.from(e.target.selectedOptions, (option) => ({
      id: option.value,
      nombre: option.textContent
    }));
    setReprobadasSeleccionadas(seleccionadas);
  };

  const handleInscribirMaterias = async (e) => {
    e.preventDefault();
    const todas = [...materiasSeleccionadas, ...reprobadasSeleccionadas];
    const ids = todas.map(m => m.id);
    const idsUnicos = new Set(ids);
    if (ids.length !== idsUnicos.size) {
      setMensajeMateria("No puede inscribir la misma materia dos veces (disponible y reprobada).");
      setTimeout(() => setMensajeMateria(""), 2500);
      return;
    }

    if (todas.length === 0 || !idInscripcionSeleccionada) {
      setMensajeMateria("Debe seleccionar al menos una materia.");
      setTimeout(() => setMensajeMateria(""), 2500);
      return;
    }

    try {
      const res = await fetch(apiUrl+"/inscribirmateria", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_inscripcion: idInscripcionSeleccionada, materias: todas.map(m => m.id) }),
      });

      const data = await res.json();
      setMensajeMateria(data.mensaje);
      setMateriasSeleccionadas([]);
      setReprobadasSeleccionadas([]);
      obtenerMaterias();
      setTimeout(() => setMensajeMateria(""), 2500);
    } catch (error) {
      setMensajeMateria("Error en la inscripción.");
      setTimeout(() => setMensajeMateria(""), 2500);
    }
  };

  // --- RENDER ---
  return (

    <CContainer className="py-4">
      <CRow className="justify-content-center">
        <CCol xs={12} md={8} lg={7}>
          <CCard className="shadow-sm mb-4">
            <CCardHeader style={{ backgroundColor: "#114c5f", color: "white" }}>
              <CCardTitle>Inscripción de Estudiantes</CCardTitle>
            </CCardHeader>
            <CCardBody>
              {mensaje && (
                <CAlert color={mensaje.includes("Error") ? "danger" : "success"} dismissible onClose={() => setMensaje("")}>
                  {mensaje}
                </CAlert>
              )}
              <CForm onSubmit={handleInscribir}>
                <CFormLabel className="mt-2">Cédula del Estudiante</CFormLabel>
                <CFormInput
                  type="text"
                  value={cedulaEstudiante}
                  onChange={(e) => filtrarEstudiantes(e.target.value)}
                  placeholder="Ingrese la cédula"
                  autoComplete="off"
                />
                {estudiantes.length > 0 && (
                  <CListGroup className="mb-3 mt-2">
                    {estudiantes.map((est) => (
                      <CListGroupItem
                        key={est.cedula}
                        style={{ cursor: "pointer" }}
                        onClick={() => handleSeleccionarEstudiante(est)}
                        className="d-flex flex-column align-items-start"
                      >
                        <span style={{ fontWeight: "bold", color: "#114c5f" }}>
                          {est.nombres} {est.apellidos}
                        </span>
                        <small className="text-muted">Cédula: {est.cedula}</small>
                        <small className="text-muted">Fecha Nacimiento:   {est.fecha_nacimiento?.substring(0, 10)}</small>
                        <small className="text-muted">Sexo: {est.sexo}</small>
                      </CListGroupItem>
                    ))}
                  </CListGroup>
                )}
                {estudianteSeleccionado && (
                  <CCard className="mb-3" style={{ background: "#eaf6f6", border: "1px solid #b2dfdb" }}>
                    <CCardBody className="py-2">
                      <div style={{ fontWeight: "bold", color: "#114c5f", fontSize: "1.1rem" }}>
                        {estudianteSeleccionado.nombres} {estudianteSeleccionado.apellidos}
                      </div>
                      <div className="text-muted" style={{ fontSize: "0.95rem" }}>
                        Cédula: {estudianteSeleccionado.cedula} <br />
                        Fecha Nac: {estudianteSeleccionado.fecha_nacimiento} <br />
                        Sexo: {estudianteSeleccionado.sexo}
                      </div>
                    </CCardBody>
                  </CCard>
                )}
                <CFormLabel className="mt-2"> Año - Sección </CFormLabel>
                <CFormSelect
                  value={idSeccionSeleccionada}
                  onChange={(e) => setIdSeccionSeleccionada(e.target.value)}
                  required
                >
                  <option value="">Seleccione Año - Sección</option>
                  {secciones.map((s) => (
                    <option key={s.id_seccion} value={s.id_seccion}>
                      {s.nombre_año} - {s.nombre_seccion}
                    </option>
                  ))}
                </CFormSelect>
                <CFormLabel className="mt-2">Año Escolar</CFormLabel>
                <CFormSelect
                  value={fkAñoEscolarSeleccionado}
                  onChange={(e) => setFkAñoEscolarSeleccionado(e.target.value)}
                  required
                >
                  <option value="">Seleccione Año Escolar</option>
                  {aniosEscolares.map((dataAnios) => (
                    <option key={dataAnios.id_año_escolar} value={dataAnios.id_año_escolar}>
                      {dataAnios.nombre}
                    </option>
                  ))}
                </CFormSelect>
                <div className="d-flex justify-content-center mt-4">
                  <CButton type="submit" style={{ minWidth: 160, borderRadius: 20, backgroundColor: '#9cd2d3', color: '#114c5f'}}> 
                    Inscribir
                  </CButton>
                </div>
                <div className="d-flex justify-content-center mt-3">
                  <CButton color="info" style={{ borderRadius: 50, width: 48, height: 48, fontSize: 24 }} onClick={() => setModalMaterias(true)}>
                    <span role="img" aria-label="Inscribir Materias">📚</span>
                  </CButton>
                </div>
              </CForm>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Modal de inscripción de materias */}
      <CModal visible={modalMaterias} onClose={() => setModalMaterias(false)} size="xl">
        <CModalHeader>
          <CModalTitle>Inscripción de Materias</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {mensajeMateria && (
            <CAlert color={mensajeMateria.includes("Error") ? "danger" : "success"} dismissible onClose={() => setMensajeMateria("")}>
              {mensajeMateria}
            </CAlert>
          )}
          <CForm onSubmit={handleInscribirMaterias}>
            <CRow className="align-items-center mb-4">
              <CCol xs={12} md={6} style={{ marginTop: "0px" }}>
                <CFormLabel className="w-100">Buscar estudiante</CFormLabel>
                <CFormInput
                  type="text"
                  placeholder="Buscar..."
                  value={busqueda}
                  onChange={e => setBusqueda(e.target.value)}
                />
              </CCol>
              <CCol xs={12} md={6} style={{ marginTop: "25px" }}>
                <CFormLabel className="w-100">Seleccionar Estudiante</CFormLabel>
                <CFormSelect
                  onChange={(e) => setIdInscripcionSeleccionada(e.target.value)}
                  value={idInscripcionSeleccionada}
                >
                  <option value="">Seleccione un estudiante</option>
                  {inscripcionesFiltradas.map((i) => (
                    <option key={i.id_inscripcion} value={i.id_inscripcion}>
                      {i.nombres} {i.apellidos} - {i.nombre_año} {i.nombre_seccion} ({i.nombre_año_escolar})
                    </option>
                  ))}
                </CFormSelect>
                {estudiante && (
                  <div className="mt-2 text-center">
                    <strong>CI:</strong> {estudiante.cedula_estudiante}
                  </div>
                )}
              </CCol>
              <CCol xs={12} className="mt-3">
                {(materiasSeleccionadas.length > 0 || reprobadasSeleccionadas.length > 0) && (
                  <div style={{ backgroundColor: "#f8f9fa", borderRadius: "5px", padding: "10px" }}>
                    <h6 className="text-center mb-2">Materias seleccionadas:</h6>
                    <ul style={{ textAlign: "center", listStyle: "none", padding: 0, margin: 0 }}>
                      {[...materiasSeleccionadas, ...reprobadasSeleccionadas].map((m) => (
                        <li key={m.id}>{m.nombre}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CCol>
            </CRow>
            <CRow>
              <CCol xs={12} md={6}>
                <CFormLabel className="d-block text-center">Materias Disponibles</CFormLabel>
                {materiasDisponibles.length > 0 && (
                  <div style={{ marginBottom: 8 }}>
                    <input
                      type="checkbox"
                      id="todasDisponibles"
                      checked={materiasSeleccionadas.length === materiasDisponibles.length && materiasDisponibles.length > 0}
                      onChange={e => {
                        if (e.target.checked) {
                          setMateriasSeleccionadas(materiasDisponibles.map(m => ({ id: m.id_año_materia, nombre: m.nombre_materia })));
                        } else {
                          setMateriasSeleccionadas([]);
                        }
                      }}
                      style={{ accentColor: "#114c5f", width: 18, height: 18 }}
                    />
                    <label htmlFor="todasDisponibles" style={{ marginLeft: 8, fontWeight: "bold", color: "#114c5f" }}>
                      Seleccionar todas las materias
                    </label>
                  </div>
                )}
                <div
                  style={{
                    border: "1px solid #dee2e6",
                    borderRadius: 5,
                    padding: 10,
                    marginBottom: 10,
                    background: "#f8fafc",
                    maxHeight: 220,
                    overflowY: "auto",
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "8px"
                  }}
                >
                  {materiasDisponibles.length === 0 && <div className="text-muted text-center">No hay materias disponibles</div>}
                  {materiasDisponibles.map((m) => (
                    <div key={m.id_año_materia} style={{ display: "flex", alignItems: "center" }}>
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`materia-disponible-${m.id_año_materia}`}
                        checked={materiasSeleccionadas.some(sel => sel.id === m.id_año_materia)}
                        style={{ borderColor: '#114c5f', marginRight: 6 }}
                        onChange={e => {
                          if (e.target.checked) {
                            setMateriasSeleccionadas([...materiasSeleccionadas, { id: m.id_año_materia, nombre: m.nombre_materia }]);
                          } else {
                            setMateriasSeleccionadas(materiasSeleccionadas.filter(sel => sel.id !== m.id_año_materia));
                          }
                        }}
                      />
                      <label className="form-check-label" htmlFor={`materia-disponible-${m.id_año_materia}`}>
                        {m.nombre_materia} - Docente: {m.nombre_docente} {m.apellido_docente} ({m.cedula_docente})
                      </label>
                    </div>
                  ))}
                </div>
              </CCol>
              <CCol xs={12} md={6}>
                <CFormLabel className="d-block text-center">Materias Reprobadas</CFormLabel>
                {materiasReprobadas.length > 0 && (
                  <div style={{ marginBottom: 8 }}>
                    <input
                      type="checkbox"
                      id="todasReprobadas"
                      checked={reprobadasSeleccionadas.length === materiasReprobadas.length && materiasReprobadas.length > 0}
                      onChange={e => {
                        if (e.target.checked) {
                          setReprobadasSeleccionadas(materiasReprobadas.map(m => ({ id: m.id_año_materia, nombre: m.nombre_materia })));
                        } else {
                          setReprobadasSeleccionadas([]);
                        }
                      }}
                      style={{ accentColor: "#114c5f", width: 18, height: 18 }}
                    />
                    <label htmlFor="todasReprobadas" style={{ marginLeft: 8, fontWeight: "bold", color: "#114c5f" }}>
                      Seleccionar todas las materias
                    </label>
                  </div>
                )}
                <div
                  style={{
                    border: "1px solid #dee2e6",
                    borderRadius: 5,
                    padding: 10,
                    marginBottom: 10,
                    background: "#f8fafc",
                    maxHeight: 220,
                    overflowY: "auto",
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "8px"
                  }}
                >
                  {materiasReprobadas.length === 0 && <div className="text-muted text-center">No tiene materias reprobadas</div>}
                  {materiasReprobadas.map((m) => (
                    <div key={m.id_año_materia} style={{ display: "flex", alignItems: "center" }}>
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`materia-reprobada-${m.id_año_materia}`}
                        checked={reprobadasSeleccionadas.some(sel => sel.id === m.id_año_materia)}
                        style={{ borderColor: '#114c5f', marginRight: 6 }}
                        onChange={e => {
                          if (e.target.checked) {
                            setReprobadasSeleccionadas([...reprobadasSeleccionadas, { id: m.id_año_materia, nombre: m.nombre_materia }]);
                          } else {
                            setReprobadasSeleccionadas(reprobadasSeleccionadas.filter(sel => sel.id !== m.id_año_materia));
                          }
                        }}
                      />
                      <label className="form-check-label" htmlFor={`materia-reprobada-${m.id_año_materia}`}>
                        {m.nombre_materia} ({m.codigo_materia}) - Año escolar: {m.año_escolar} - Nota: {m.nota_final}
                      </label>
                    </div>
                  ))}
                </div>
              </CCol>
            </CRow>
            <div className="text-center">
              <CButton type="submit" style={{ backgroundColor: '#9cd2d3', color: '#114c5f', marginTop: '10px', minWidth: 180, borderRadius:20 }}>
                Inscribir Materias
              </CButton>
            </div>
          </CForm>
        </CModalBody>
      </CModal>

      {/* Módulo de inscripciones registradas para admin y gestor */}
      {(usuario.rol === "admin" || usuario.rol === "gestor") && (
        <CRow className="justify-content-center mt-4">
          <CCol xs={12} md={12} lg={12}>
            <CCard className="shadow-sm">
              <CCardHeader className="bg-secondary text-white">
                <CCardTitle>Inscripciones Registradas</CCardTitle>
              </CCardHeader>
              <CCardBody>
                {mensajeAdmin && (
                  <CAlert color={mensajeAdmin.includes("Error") ? "danger" : "success"} dismissible onClose={() => setMensajeAdmin("")}>
                    {mensajeAdmin}
                  </CAlert>
                )}
                <CFormInput
                  type="text"
                  placeholder="Filtrar por cédula o nombre..."
                  value={filtroInscripcion}
                  onChange={e => setFiltroInscripcion(e.target.value)}
                  className="mb-3"
                />
                <CTable hover responsive>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>Estudiante</CTableHeaderCell>
                      <CTableHeaderCell>Cédula</CTableHeaderCell>
                      <CTableHeaderCell>Año</CTableHeaderCell>
                      <CTableHeaderCell>Sección</CTableHeaderCell>
                      <CTableHeaderCell>Año Escolar</CTableHeaderCell>
                      <CTableHeaderCell>Fecha Inscripción</CTableHeaderCell>
                      <CTableHeaderCell>Acciones</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {inscripcionesPaginadas.map((i) => (
                      <CTableRow key={i.id_inscripcion}>
                        <CTableDataCell>{i.nombres} {i.apellidos}</CTableDataCell>
                        <CTableDataCell>{i.cedula}</CTableDataCell>
                        <CTableDataCell>{i.nombre_año}</CTableDataCell>
                        <CTableDataCell>{i.nombre_seccion}</CTableDataCell>
                        <CTableDataCell>{i.año_escolar}</CTableDataCell>
                        <CTableDataCell>{i.fecha_inscripcion?.substring(0, 10)}</CTableDataCell>
                        <CTableDataCell>
                          <CButton size="sm" style={{ backgroundColor: 'white', color:'blue', borderColor:'blue'}} className="me-2" onClick={() => handleEditarInscripcion(i)}>Editar</CButton>
                          <CButton size="sm" style={{ backgroundColor: 'white', color:'red', borderColor:'red'}} onClick={() => solicitarEliminarInscripcion(i.id_inscripcion)}>
                            Eliminar
                          </CButton>
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
                {/* Paginación */}
                <div className="d-flex justify-content-center mt-3">
                  <CButton
                    color="secondary"
                    size="sm"
                    disabled={pagina === 1}
                    onClick={() => setPagina(pagina - 1)}
                    className="me-2"
                  >
                    Anterior
                  </CButton>
                  <span style={{ lineHeight: "2.2rem" }}>
                    Página {pagina} de {totalPaginas}
                  </span>
                  <CButton
                    color="secondary"
                    size="sm"
                    disabled={pagina === totalPaginas || totalPaginas === 0}
                    onClick={() => setPagina(pagina + 1)}
                    className="ms-2"
                  >
                    Siguiente
                  </CButton>
                </div>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      )}

      {/* Modal de edición */}
      <CModal visible={modalEdit} onClose={() => setModalEdit(false)}>
        <CModalHeader>
          <CModalTitle>Editar Inscripción</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CFormLabel>Sección</CFormLabel>
          <CFormSelect
            value={editData.id_seccion}
            onChange={e => setEditData({ ...editData, id_seccion: e.target.value })}
          >
            <option value="">Seleccione Sección</option>
            {secciones.map((s) => (
              <option key={s.id_seccion} value={s.id_seccion}>
                {s.nombre_seccion} - {s.nombre_año}
              </option>
            ))}
          </CFormSelect>
          <CFormLabel className="mt-2">Año Escolar</CFormLabel>
          <CFormSelect
            value={editData.fk_año_escolar}
            onChange={e => setEditData({ ...editData, fk_año_escolar: e.target.value })}
          >
            <option value="">Seleccione Año Escolar</option>
            {aniosEscolares.map((a) => (
              <option key={a.id_año_escolar} value={a.id_año_escolar}>
                {a.nombre}
              </option>
            ))}
          </CFormSelect>
        </CModalBody>
        <CModalFooter>
          <CButton style={{backgroundColor:'white', color:'blue',borderColor:'blue'}} onClick={handleGuardarEdicion}>Guardar</CButton>
          <CButton style={{backgroundColor:'white', color:'#114c5f',borderColor:'#114c5f'}} variant="outline" onClick={() => setModalEdit(false)}>Cancelar</CButton>
        </CModalFooter>
      </CModal>

      {/* Modal de confirmación para eliminar inscripción */}
      <CModal visible={modalConfirm} onClose={() => setModalConfirm(false)}>
        <CModalHeader>
          <CModalTitle>Confirmar Eliminación</CModalTitle>
        </CModalHeader>
        <CModalBody>
          ¿Seguro que desea eliminar esta inscripción? Si eliminas la inscripción eliminarás todos aquellos registros donde esté presente.
        </CModalBody>
        <CModalFooter>
          <CButton style={{backgroundColor:'white', color:'red', borderColor:'red'}} onClick={() => {
            setModalConfirm(false);
            handleEliminarInscripcion(idAEliminar);
          }}>
            Eliminar
          </CButton>
          <CButton style={{backgroundColor:'white', color:'#114c5f',borderColor:'#114c5f'}} variant="outline" onClick={() => setModalConfirm(false)}>
            Cancelar
          </CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  );
};

export default InscribirMateria;