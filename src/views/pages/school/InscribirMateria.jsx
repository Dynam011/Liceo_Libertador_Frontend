import { useState, useEffect } from "react";
import {
  CContainer, CRow, CCol, 
  CForm, CFormLabel, CFormInput, CFormSelect, CButton, CAlert, CListGroup, CListGroupItem,
  CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell,
  CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter} from "@coreui/react";
import {apiUrl} from "../../../api"
const token = localStorage.getItem("token");
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
const [modalInscribir, setModalInscribir] = useState(false);
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
      const resSecciones = await fetch(apiUrl+"/secciones",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const dataSecciones = await resSecciones.json();
      setSecciones(dataSecciones.secciones || []);
    } catch (error) {
      console.error("Error obteniendo secciones:", error);
    }
  };

  const obtenerAniosEscolares = async () => {
    try {
      const resAnios = await fetch(apiUrl+"/aniosescolares",
        { headers: { Authorization: `Bearer ${token}` } }
      );
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
      const res = await fetch(apiUrl+`/estudiantes?cedula=${cedula}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
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
        headers: { "Content-Type": "application/json",
          Authorization: `Bearer ${token}`

        },
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
      const res = await fetch(apiUrl+"/inscripciones",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      setInscripcionesMaterias(data.inscripciones || []);
    } catch (error) {
      console.error("Error obteniendo inscripciones:", error);
    }
  };

  const obtenerMaterias = async () => {
    try {
      const res = await fetch(apiUrl+`/inscripcion/${idInscripcionSeleccionada}/materias`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
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
        headers: { "Content-Type": "application/json",
          Authorization: `Bearer ${token}`

         },
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
  <CContainer fluid className="px-2 py-4" >
      <CRow className="mb-4">
        <CCol xs={12} md={6} className="d-flex gap-2 flex-row flex-md-row justify-content-start align-items-center mb-2 mb-md-0">
          <CButton
            color="info"
            size="sm"
            style={{
              borderRadius: 10,
              fontWeight: "bold",
              fontSize: 15,
              minWidth: 150,
              boxShadow: "0 1px 6px #0bb5d4",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "none",
              background: "linear-gradient(95deg, #17b6ce 80%, #0bb5d4 100%)"
            }}
            className="py-2 px-3"
            onClick={() => setModalInscribir(true)}
          >
            <span style={{ marginRight: 7, color: "#fff" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff">
                <path d="M12 12c2.7 0 8 1.34 8 4v2H4v-2c0-2.66 5.3-4 8-4zm0-2a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm6 10v-1c0-2.21-4.03-4-6-4s-6 1.79-6 4v1h12zm2-8v2h-2v2h-2v-2h-2v-2h2v-2h2v2h2z" />
              </svg>
            </span>
            Inscribir Estudiante
          </CButton>
          <CButton
            color="primary"
            size="sm"
            style={{
              borderRadius: 10,
              fontWeight: "bold",
              fontSize: 15,
              minWidth: 150,
              boxShadow: "0 1px 6px #114c5f",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "none",
              background: "linear-gradient(95deg, #114c5f 80%, #136170ff 100%)"
            }}
            className="py-2 px-3"
            onClick={() => setModalMaterias(true)}
          >
            <span style={{ marginRight: 7, color: "#fff" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-7-2c-2.21 0-4-1.79-4-4V9h8v4c0 2.21-1.79 4-4 4zm-2-4a2 2 0 0 0 4 0v-2h-4v2z" />
              </svg>
            </span>
            Inscribir Materias
          </CButton>
        </CCol>
      </CRow>

      {/* MODAL ESTUDIANTE */}
      <CModal
        visible={modalInscribir}
        onClose={() => setModalInscribir(false)}
        size="md"
        alignment="center"
        backdrop="static"
      >
        <CModalHeader className="bg-info" style={{ borderRadius: 8 }}>
          <CModalTitle className="text-white fs-6">
            Inscripción de Estudiantes
          </CModalTitle>
        </CModalHeader>
        <CModalBody style={{ background: "#f9fcfd", borderRadius: 8 }}>
          {mensaje && (
            <CAlert
              color={mensaje.includes("Error") ? "danger" : "success"}
              dismissible
              onClose={() => setMensaje("")}
            >
              {mensaje}
            </CAlert>
          )}
          <CForm onSubmit={handleInscribir}>
            <CRow className="mb-3" xs={{ gutter: 2 }}>
              <CCol xs={12} md={6}>
                <CFormLabel className="fw-bold">Cédula del Estudiante</CFormLabel>
                <CFormInput
                  type="text"
                  size="sm"
                  value={cedulaEstudiante}
                  onChange={(e) => filtrarEstudiantes(e.target.value)}
                  placeholder="Ingrese la cédula"
                  autoComplete="off"
                  className="mb-2"
                />
                {estudiantes.length > 0 && (
                  <CListGroup className="mb-2">
                    {estudiantes.map((est) => (
                      <CListGroupItem
                        key={est.cedula}
                        style={{ cursor: "pointer" }}
                        onClick={() => handleSeleccionarEstudiante(est)}
                        color="info"
                        className="mb-1"
                      >
                        <span className="fw-bold">{est.nombres} {est.apellidos}</span>
                        <small className="text-muted ms-2">Cédula: {est.cedula}</small>
                        <small className="text-muted ms-2">Fecha: {est.fecha_nacimiento?.substring(0, 10)}</small>
                        <small className="text-muted ms-2">Sexo: {est.sexo}</small>
                      </CListGroupItem>
                    ))}
                  </CListGroup>
                )}
              </CCol>
              <CCol xs={12} md={6}>
                {estudianteSeleccionado && (
                  <div
                    className="mb-2"
                    style={{
                      background: "#eaf6f6",
                      borderRadius: 8,
                      padding: "8px 12px",
                      fontSize: "0.95em",
                    }}
                  >
                    <span className="fw-bold text-info">{estudianteSeleccionado.nombres} {estudianteSeleccionado.apellidos}</span>
                    <div><strong>Cédula:</strong> {estudianteSeleccionado.cedula}</div>
                    <div><strong>Fecha Nac:</strong> {estudianteSeleccionado.fecha_nacimiento}</div>
                    <div><strong>Sexo:</strong> {estudianteSeleccionado.sexo}</div>
                  </div>
                )}
              </CCol>
            </CRow>
            <CRow className="mb-2" xs={{ gutter: 2 }}>
              <CCol xs={12} md={6}>
                <CFormLabel className="fw-bold">Año - Sección</CFormLabel>
                <CFormSelect
                  size="sm"
                  value={idSeccionSeleccionada}
                  onChange={(e) => setIdSeccionSeleccionada(e.target.value)}
                  required
                  className="mb-1"
                >
                  <option value="">Seleccione Año - Sección</option>
                  {secciones.map((s) => (
                    <option key={s.id_seccion} value={s.id_seccion}>
                      {s.nombre_año} - {s.nombre_seccion}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>
              <CCol xs={12} md={6}>
                <CFormLabel className="fw-bold">Año Escolar</CFormLabel>
                <CFormSelect
                  size="sm"
                  value={fkAñoEscolarSeleccionado}
                  onChange={(e) => setFkAñoEscolarSeleccionado(e.target.value)}
                  required
                  className="mb-1"
                >
                  <option value="">Seleccione Año Escolar</option>
                  {aniosEscolares.map((dataAnios) => (
                    <option key={dataAnios.id_año_escolar} value={dataAnios.id_año_escolar}>
                      {dataAnios.nombre}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>
            </CRow>
            <div className="d-flex justify-content-end pt-1 pb-1">
              <CButton
                type="submit"
                color="info"
                size="sm"
                shape="rounded-pill"
                className="fw-bold px-4"
              >
                Inscribir
              </CButton>
            </div>
          </CForm>
        </CModalBody>
      </CModal>

      {/* MODAL MATERIAS */}
      <CModal
        visible={modalMaterias}
        onClose={() => setModalMaterias(false)}
        size="md"
        alignment="center"
        backdrop="static"
      >
        <CModalHeader className="bg-primary" style={{ borderRadius: 8 }}>
          <CModalTitle className="text-white fs-6">
            Inscripción de Materias
          </CModalTitle>
        </CModalHeader>
        <CModalBody style={{ background: "#f9fcfd", borderRadius: 8 }}>
          {mensajeMateria && (
            <CAlert
              color={mensajeMateria.includes("Error") ? "danger" : "success"}
              dismissible
              onClose={() => setMensajeMateria("")}
            >
              {mensajeMateria}
            </CAlert>
          )}
          <CForm onSubmit={handleInscribirMaterias}>
            <CRow className="mb-2" xs={{ gutter: 2 }}>
              <CCol xs={12} md={6}>
                <CFormLabel className="fw-bold">Buscar estudiante</CFormLabel>
                <CFormInput
                  type="text"
                  size="sm"
                  placeholder="Buscar..."
                  value={busqueda}
                  onChange={e => setBusqueda(e.target.value)}
                  className="mb-1"
                />
              </CCol>
              <CCol xs={12} md={6}>
                <CFormLabel className="fw-bold">Seleccionar Estudiante</CFormLabel>
                <CFormSelect
                  size="sm"
                  onChange={(e) => setIdInscripcionSeleccionada(e.target.value)}
                  value={idInscripcionSeleccionada}
                  className="mb-1"
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
                    <CBadge color="primary" shape="rounded-pill" className="p-2 fs-6">
                      CI: {estudiante.cedula_estudiante}
                    </CBadge>
                  </div>
                )}
              </CCol>
            </CRow>
            <CRow className="mb-2">
              <CCol xs={12} md={6}>
                <CFormLabel className="fw-bold">Materias Disponibles</CFormLabel>
                {materiasDisponibles.length > 0 && (
                  <CButton
                    color="info"
                    variant="outline"
                    size="sm"
                    className="mb-2"
                    onClick={() => setMateriasSeleccionadas(materiasDisponibles.map(m => ({ id: m.id_año_materia, nombre: m.nombre_materia })))}
                    disabled={materiasSeleccionadas.length === materiasDisponibles.length}
                  >
                    Seleccionar todas
                  </CButton>
                )}
                <CListGroup>
                  {materiasDisponibles.length === 0 && <CListGroupItem color="light">No hay materias disponibles</CListGroupItem>}
                  {materiasDisponibles.map((m) => (
                    <CListGroupItem key={m.id_año_materia} color="light" className="mb-1">
                      <CFormInput
                        type="checkbox"
                        checked={materiasSeleccionadas.some(sel => sel.id === m.id_año_materia)}
                        onChange={e => {
                          if (e.target.checked) {
                            setMateriasSeleccionadas([...materiasSeleccionadas, { id: m.id_año_materia, nombre: m.nombre_materia }]);
                          } else {
                            setMateriasSeleccionadas(materiasSeleccionadas.filter(sel => sel.id !== m.id_año_materia));
                          }
                        }}
                        style={{ width: "1.1em", height: "1.1em", marginRight: 10 }}
                      />
                      <span className="fw-bold">{m.nombre_materia}</span>
                      <span className="ms-2 text-muted">Docente: {m.nombre_docente} {m.apellido_docente} ({m.cedula_docente})</span>
                    </CListGroupItem>
                  ))}
                </CListGroup>
              </CCol>
              <CCol xs={12} md={6}>
                <CFormLabel className="fw-bold">Materias Reprobadas</CFormLabel>
                {materiasReprobadas.length > 0 && (
                  <CButton
                    color="danger"
                    variant="outline"
                    size="sm"
                    className="mb-2"
                    onClick={() => setReprobadasSeleccionadas(materiasReprobadas.map(m => ({ id: m.id_año_materia, nombre: m.nombre_materia })))}
                    disabled={reprobadasSeleccionadas.length === materiasReprobadas.length}
                  >
                    Seleccionar todas
                  </CButton>
                )}
                <CListGroup>
                  {materiasReprobadas.length === 0 && <CListGroupItem color="light">No tiene materias reprobadas</CListGroupItem>}
                  {materiasReprobadas.map((m) => (
                    <CListGroupItem key={m.id_año_materia} color="warning" className="mb-1">
                      <CFormInput
                        type="checkbox"
                        checked={reprobadasSeleccionadas.some(sel => sel.id === m.id_año_materia)}
                        onChange={e => {
                          if (e.target.checked) {
                            setReprobadasSeleccionadas([...reprobadasSeleccionadas, { id: m.id_año_materia, nombre: m.nombre_materia }]);
                          } else {
                            setReprobadasSeleccionadas(reprobadasSeleccionadas.filter(sel => sel.id !== m.id_año_materia));
                          }
                        }}
                        style={{ width: "1.1em", height: "1.1em", marginRight: 10 }}
                      />
                      <span className="fw-bold">{m.nombre_materia} ({m.codigo_materia})</span>
                      <span className="ms-2 text-muted">Año escolar: {m.año_escolar} - Nota: {m.nota_final}</span>
                    </CListGroupItem>
                  ))}
                </CListGroup>
              </CCol>
            </CRow>
            {(materiasSeleccionadas.length > 0 || reprobadasSeleccionadas.length > 0) && (
              <CAlert color="info" className="text-center mb-2 py-1 px-2">
                <strong>Materias seleccionadas:</strong>{" "}
                {[...materiasSeleccionadas, ...reprobadasSeleccionadas].map(m => m.nombre).join(", ")}
              </CAlert>
            )}
            <div className="d-flex justify-content-end pt-1 pb-1">
              <CButton
                type="submit"
                color="primary"
                size="sm"
                shape="rounded-pill"
                className="fw-bold px-4"
              >
                Inscribir Materias
              </CButton>
            </div>
          </CForm>
        </CModalBody>
      </CModal>

      {/* LISTADO INSCRIPCIONES */}
      <CRow className="mt-4">
        <CCol xs={12}>
          <CFormInput
            type="text"
            size="sm"
            placeholder="Filtrar por cédula o nombre..."
            value={filtroInscripcion}
            onChange={e => setFiltroInscripcion(e.target.value)}
            className="mb-2"
          />
          <CTable responsive striped hover bordered align="middle" className="mb-2">
            <CTableHead color="info">
              <CTableRow>
                <CTableHeaderCell>Estudiante</CTableHeaderCell>
                <CTableHeaderCell>Cédula</CTableHeaderCell>
                <CTableHeaderCell>Año</CTableHeaderCell>
                <CTableHeaderCell>Sección</CTableHeaderCell>
                <CTableHeaderCell>Año Escolar</CTableHeaderCell>
                <CTableHeaderCell>Fecha Inscripción</CTableHeaderCell>
                <CTableHeaderCell className="text-center">Acciones</CTableHeaderCell>
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
                  <CTableDataCell className="text-center">
                    <CButton
                      size="sm"
                      color="warning"
                      shape="rounded-pill"
                      className="me-2"
                      onClick={() => handleEditarInscripcion(i)}
                    >
                      Editar
                    </CButton>
                    <CButton
                      size="sm"
                      color="danger"
                      shape="rounded-pill"
                      onClick={() => solicitarEliminarInscripcion(i.id_inscripcion)}
                    >
                      Eliminar
                    </CButton>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
          <div className="d-flex justify-content-center align-items-center gap-2">
            <CButton
              color="secondary"
              size="sm"
              shape="rounded-pill"
              disabled={pagina === 1}
              onClick={() => setPagina(pagina - 1)}
            >
              Anterior
            </CButton>
            <span>
              Página <strong>{pagina}</strong> de <strong>{totalPaginas}</strong>
            </span>
            <CButton
              color="secondary"
              size="sm"
              shape="rounded-pill"
              disabled={pagina === totalPaginas || totalPaginas === 0}
              onClick={() => setPagina(pagina + 1)}
            >
              Siguiente
            </CButton>
          </div>
        </CCol>
      </CRow>

      {/* MODAL EDICIÓN */}
      <CModal
        visible={modalEdit}
        onClose={() => setModalEdit(false)}
        alignment="center"
        backdrop="static"
      >
        <CModalHeader className="bg-warning" style={{ borderRadius: 8 }}>
          <CModalTitle className="text-white fs-6">
            Editar Inscripción
          </CModalTitle>
        </CModalHeader>
        <CModalBody style={{ background: "#fff9e5" }}>
          <CFormLabel className="fw-bold">Sección</CFormLabel>
          <CFormSelect
            size="sm"
            value={editData.id_seccion}
            onChange={e => setEditData({ ...editData, id_seccion: e.target.value })}
            className="mb-2"
          >
            <option value="">Seleccione Sección</option>
            {secciones.map((s) => (
              <option key={s.id_seccion} value={s.id_seccion}>
                {s.nombre_seccion} - {s.nombre_año}
              </option>
            ))}
          </CFormSelect>
          <CFormLabel className="fw-bold">Año Escolar</CFormLabel>
          <CFormSelect
            size="sm"
            value={editData.fk_año_escolar}
            onChange={e => setEditData({ ...editData, fk_año_escolar: e.target.value })}
            className="mb-2"
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
          <CButton
            color="warning"
            shape="rounded-pill"
            className="fw-bold"
            onClick={handleGuardarEdicion}
          >
            Guardar
          </CButton>
          <CButton
            color="secondary"
            shape="rounded-pill"
            onClick={() => setModalEdit(false)}
          >
            Cancelar
          </CButton>
        </CModalFooter>
      </CModal>

      {/* MODAL CONFIRMACIÓN ELIMINACIÓN */}
      <CModal
        visible={modalConfirm}
        onClose={() => setModalConfirm(false)}
        alignment="center"
        backdrop="static"
      >
        <CModalHeader className="bg-danger" style={{ borderRadius: 8 }}>
          <CModalTitle className="text-white fs-6">
            Confirmar Eliminación
          </CModalTitle>
        </CModalHeader>
        <CModalBody style={{ background: "#fff5f5" }}>
          ¿Seguro que desea eliminar esta inscripción?
          <br />
          <span className="fw-bold">
            Si eliminas la inscripción eliminarás todos aquellos registros donde esté presente.
          </span>
        </CModalBody>
        <CModalFooter>
          <CButton
            color="danger"
            shape="rounded-pill"
            className="fw-bold"
            onClick={() => {
              setModalConfirm(false);
              handleEliminarInscripcion(idAEliminar);
            }}
          >
            Eliminar
          </CButton>
          <CButton
            color="secondary"
            shape="rounded-pill"
            onClick={() => setModalConfirm(false)}
          >
            Cancelar
          </CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  
  );
};

export default InscribirMateria;