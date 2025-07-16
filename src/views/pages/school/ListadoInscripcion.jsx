import { useState, useEffect } from "react";
import {
  CContainer, CRow, CCol, CCard, CCardHeader, CCardBody, CCardTitle,
  CFormInput, CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody,
  CTableDataCell, CButton, CAlert, CSpinner, CFormSelect, CAccordion, CAccordionItem, CAccordionHeader, CAccordionBody,
  CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter
} from "@coreui/react";
import {apiUrl} from "../../../api"
const MateriasInscritasAdmin = () => {
  // Función para normalizar texto (quita acentos y pasa a minúsculas)
  const normalizar = (texto) => {
    return (texto || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  };
  const [estudiantes, setEstudiantes] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [anioEscolar, setAnioEscolar] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);
  const [aniosEscolares, setAniosEscolares] = useState([]);
  const [modalConfirm, setModalConfirm] = useState(false);
  const [idAEliminar, setIdAEliminar] = useState(null);
  const [pagina, setPagina] = useState(1);
  const porPagina = 25;

  const totalPaginas = Math.ceil(estudiantes.length / porPagina);

  const estudiantesPagina = estudiantes.slice((pagina - 1) * porPagina, pagina * porPagina);

  // Solo admin puede ver este módulo
  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
  if (usuario.rol !== "admin" && usuario.rol !== "gestor" ) {
    return <CAlert color="danger">Acceso denegado. Solo administradores.</CAlert>;
  }

  const solicitarEliminar = (id) => {
  setIdAEliminar(id);
  setModalConfirm(true);
};

  const fetchEstudiantes = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(apiUrl+`/estudiantes-materias-inscritas`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      let lista = data.estudiantes || [];
      // Filtrar por año escolar
      if (anioEscolar) {
        lista = lista.filter(e => normalizar(e.año_escolar) === normalizar(anioEscolar));
      }
      // Filtrar por texto (cédula, nombre, apellido)
      if (filtro) {
        const f = normalizar(filtro);
        lista = lista.filter(e =>
          normalizar(e.cedula).includes(f) ||
          normalizar(e.nombres).includes(f) ||
          normalizar(e.apellidos).includes(f)
        );
      }
      setEstudiantes(lista);
    } catch (error) {
      setMensaje("Error obteniendo materias inscritas.");
    }
    setLoading(false);
  };

  // Obtener años escolares para el select
  const fetchAniosEscolares = async () => {
    try {
      const res = await fetch(apiUrl+"/aniosescolares");
      const data = await res.json();
      setAniosEscolares(data.añosEscolares || []);
    } catch (error) {
      setAniosEscolares([]);
    }
  };

  useEffect(() => {
    fetchAniosEscolares();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    fetchEstudiantes();
    // eslint-disable-next-line
  }, [filtro, anioEscolar]);

  // Eliminar materia inscrita
  const handleEliminar = async (id) => {
    
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(apiUrl+`/materias-inscritas/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setMensaje(data.mensaje);
      fetchEstudiantes();
    } catch (error) {
      setMensaje("Error eliminando materia.");
    }
  };

  return (
    <CContainer className="py-4">
      <CRow className="justify-content-center">
        <CCol xs={12} lg={11}>
          <CCard className="shadow-sm">
            <CCardHeader style={{ background: "#114c5f", color: "#fff" }}>
              <CRow>
                <CCol xs={12} md={4}>
                  <CCardTitle>Materias Inscritas Por Inscripciones</CCardTitle>
                </CCol>
                <CCol xs={12} md={4}>
                  <CFormInput
                    type="text"
                    placeholder="Filtrar por cédula, nombre o apellido..."
                    value={filtro}
                    onChange={e => setFiltro(e.target.value)}
                    className="mb-2"
                  />
                </CCol>
                <CCol xs={12} md={4}>
                  <CFormSelect
                    value={anioEscolar}
                    onChange={e => setAnioEscolar(e.target.value)}
                    className="mb-2"
                  >
                    <option value="">Filtrar por año escolar</option>
                    {aniosEscolares.map(a => (
                      <option key={a.id_año_escolar} value={a.nombre}>{a.nombre}</option>
                    ))}
                  </CFormSelect>
                </CCol>
              </CRow>
            </CCardHeader>
            <CCardBody>
              {mensaje && (
                <CAlert color={mensaje.includes("Error") ? "danger" : "success"} dismissible onClose={() => setMensaje("")}>
                  {mensaje}
                </CAlert>
              )}
              {loading ? (
                <div className="text-center py-5"><CSpinner color="primary" /></div>
              ) : (
                <CAccordion alwaysOpen>
                  {estudiantes.length === 0 ? (
                    <div className="text-center py-4">No hay estudiantes con materias inscritas.</div>
                  ) : (
                    estudiantesPagina.map((est, idx) => (
                      <CAccordionItem itemKey={idx} key={est.cedula}>
                        <CAccordionHeader>
                          <strong> {est.nombres}  {est.apellidos} </strong> : Cédula: {est.cedula} | Año: {est.nombre_año} | Sección: {est.nombre_seccion}  | Año Escolar: {est.año_escolar}
                        </CAccordionHeader>
                        <CAccordionBody>
                          <CTable hover responsive bordered align="middle" className="mb-0">
                            <CTableHead color="light">
                              <CTableRow>
                                <CTableHeaderCell>Materia</CTableHeaderCell>
                                <CTableHeaderCell>Código</CTableHeaderCell>
                                <CTableHeaderCell>Docente</CTableHeaderCell>
                                <CTableHeaderCell>Cédula Docente</CTableHeaderCell>
                                <CTableHeaderCell>Año</CTableHeaderCell>
                                <CTableHeaderCell>Sección</CTableHeaderCell>
                                <CTableHeaderCell>Acción</CTableHeaderCell>
                              </CTableRow>
                            </CTableHead>
                            <CTableBody>
                              {est.materias.map((m, i) => (
                                <CTableRow key={i}>
                                  <CTableDataCell>{m.nombre_materia}</CTableDataCell>
                                  <CTableDataCell>{m.codigo_materia}</CTableDataCell>
                                  <CTableDataCell>{m.nombre_docente} {m.apellido_docente}</CTableDataCell>
                                  <CTableDataCell>{m.cedula_docente}</CTableDataCell>
                                  <CTableDataCell>{m.seccion}</CTableDataCell>
                                  <CTableDataCell>{m.año}</CTableDataCell>
                                  <CTableDataCell>
                                     <CButton
                                      style={{backgroundColor:'white', color:'red', borderColor:'red'}}
                                      size="sm"
                                      onClick={() => solicitarEliminar(m.id_materia_inscrita)}
                                    >
                                      Eliminar
                                    </CButton>
                                  </CTableDataCell>
                                </CTableRow>
                              ))}
                            </CTableBody>
                            <CButton
                              style={{ backgroundColor: '#114c5f', color: 'white', borderColor: '#114c5f' }}
                              size="sm"
                              onClick={() => window.open(apiUrl+`/comprobante-inscripcion/${est.id_inscripcion}`, '_blank')}
                            >
                              Imprimir
                            </CButton>
                          </CTable>
                        </CAccordionBody>
                      </CAccordionItem>
                    ))
                  )}
                </CAccordion>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <CModal visible={modalConfirm} onClose={() => setModalConfirm(false)}>
        <CModalHeader>
          <CModalTitle>Confirmar Eliminación</CModalTitle>
        </CModalHeader>
        <CModalBody>
          ¿Seguro que desea eliminar esta materia inscrita?
        </CModalBody>
        <CModalFooter>
          <CButton style={{backgroundColor:'white', color:'red', borderColor:'red'}}  onClick={() => {
            setModalConfirm(false);
            handleEliminar(idAEliminar);
          }}>
            Eliminar
          </CButton>
          <CButton style={{backgroundColor:'white', color:'#114c5f', borderColor:'#114c5f'}} variant="outline" onClick={() => setModalConfirm(false)}>
            Cancelar
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Botones de paginación */}
      <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "20px" }}>
        <CButton
          style={{ backgroundColor: '#114c5f', color: 'white', borderColor: '#114c5f' }}
          disabled={pagina === 1}
          onClick={() => setPagina(pagina - 1)}
        >
          Anterior
        </CButton>
        <span style={{ alignSelf: "center" }}>
          Página {pagina} de {totalPaginas}
        </span>
        <CButton
          style={{ backgroundColor: '#114c5f', color: 'white', borderColor: '#114c5f' }}
          disabled={pagina === totalPaginas || totalPaginas === 0}
          onClick={() => setPagina(pagina + 1)}
        >
          Siguiente
        </CButton>
      </div>
    </CContainer>
  );
};

export default MateriasInscritasAdmin;