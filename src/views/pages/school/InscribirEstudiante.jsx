import { useState, useEffect } from "react";
import {
  CContainer, CRow, CCol, CCard, CCardHeader, CCardBody, CCardTitle,
  CForm, CFormLabel, CFormInput, CFormSelect, CButton, CAlert, CListGroup, CListGroupItem,
  CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell,
  CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter
} from "@coreui/react";
import {apiUrl} from "../../../api"
const InscribirEstudiante = () => {
  const [estudiantes, setEstudiantes] = useState([]);
  const [secciones, setSecciones] = useState([]);
  const [aniosEscolares, setAniosEscolares] = useState([]);
  const [cedulaEstudiante, setCedulaEstudiante] = useState("");
  const [idSeccionSeleccionada, setIdSeccionSeleccionada] = useState("");
  const [fkAñoEscolarSeleccionado, setFkAñoEscolarSeleccionado] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState(null);

  // Admin: inscripciones
  const [inscripciones, setInscripciones] = useState([]);
  const [filtroInscripcion, setFiltroInscripcion] = useState("");
  const [modalEdit, setModalEdit] = useState(false);
  const [editData, setEditData] = useState({});
  const [mensajeAdmin, setMensajeAdmin] = useState("");
  const [modalConfirm, setModalConfirm] = useState(false);
  const [idAEliminar, setIdAEliminar] = useState(null);
  const [pagina, setPagina] = useState(1);
  const registrosPorPagina = 10;

  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");

  useEffect(() => {
    obtenerSecciones();
    obtenerAniosEscolares();
    if (usuario.rol === "admin") fetchInscripciones();
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
        if (usuario.rol === "admin") fetchInscripciones();
      } else {
        setMensaje(`Error: ${data.mensaje}`);
      }
    } catch (error) {
      console.error("Error inscribiendo estudiante:", error);
      setMensaje("Error en la conexión con el servidor.");
    }
  };

  // --- ADMIN: Inscripciones registradas ---
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
    }
  };

  useEffect(() => {
    if (usuario.rol === "admin") fetchInscripciones();
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
      fetchInscripciones();
    } catch (error) {
      setMensajeAdmin("Error eliminando inscripción.");
    }
  };

  const handleEditarInscripcion = (insc) => {
    setEditData(insc);
    setModalEdit(true);
  };

  const handleGuardarEdicion = async () => {
    if (!editData.id_seccion || !editData.fk_año_escolar) {
      setMensajeAdmin("Debe seleccionar sección y año escolar.");
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
      fetchInscripciones();
    } catch (error) {
      setMensajeAdmin("Error editando inscripción.");
    }
  };

  const solicitarEliminarInscripcion = (id) => {
    setIdAEliminar(id);
    setModalConfirm(true);
  };

  // Calcular los registros a mostrar
  const inicio = (pagina - 1) * registrosPorPagina;
  const fin = inicio + registrosPorPagina;
  const inscripcionesPaginadas = inscripciones.slice(inicio, fin);

  // Calcular total de páginas
  const totalPaginas = Math.ceil(inscripciones.length / registrosPorPagina);

  // --- RENDER ---
  return (
    <CContainer className="py-4">
      <CRow className="justify-content-center">
        <CCol xs={12} md={8} lg={6}>
          {usuario.rol === "admin" && (
            <CCard className="shadow-sm">
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
                  {/* Lista moderna de estudiantes filtrados */}
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

                  {/* Espacio bonito para mostrar el estudiante seleccionado */}
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

                  <CFormLabel className="mt-2">Sección - Año</CFormLabel>
                  <CFormSelect
                    value={idSeccionSeleccionada}
                    onChange={(e) => setIdSeccionSeleccionada(e.target.value)}
                    required
                  >
                    <option value="">Seleccione Sección - Año</option>
                    {secciones.map((s) => (
                      <option key={s.id_seccion} value={s.id_seccion}>
                        {s.nombre_seccion} - {s.nombre_año}
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
                    <CButton  type="submit" style={{ minWidth: 160, borderRadius: 20, backgroundColor: '#9cd2d3', color: '#114c5f'}}> 
                      Inscribir
                    </CButton>
                  </div>
                </CForm>
              </CCardBody>
            </CCard>
          )}
          {usuario.rol !== "admin" && (
            <CCard className="shadow-sm">
              <CCardBody>
                <CAlert color="warning" className="text-center mb-0">
                  Solo los administradores pueden inscribir estudiantes.
                </CAlert>
              </CCardBody>
            </CCard>
          )}
        </CCol>
      </CRow>

      {/* Módulo de inscripciones registradas solo para admin */}
      {usuario.rol === "admin" && (
        <CRow className="justify-content-center mt-4">
          <CCol xs={12} md={10} lg={10}>
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

export default InscribirEstudiante;