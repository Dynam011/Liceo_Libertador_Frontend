import { useState, useEffect } from "react";
import {
  CContainer, CRow, CCol, CCard, CCardHeader, CCardBody, CTable, CTableHead, CTableRow,
  CTableHeaderCell, CTableBody, CTableDataCell, CButton, CPagination, CPaginationItem,
  CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter, CFormSelect, CAlert, CSpinner, CFormInput
} from "@coreui/react";
import {apiUrl} from "../../../api"
const token = localStorage.getItem("token");
// --- CSS en línea para la tabla y los botones ---
const tablaEstilos = `
.tabla-asignaciones th, .tabla-asignaciones td {
  vertical-align: middle !important;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 180px;
  min-width: 120px;
  font-size: 0.98rem;
}
.acciones-btns {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  align-items: center;
}
`;

const AsignacionesDocenteAdmin = () => {
  const [asignaciones, setAsignaciones] = useState([]);
  const [search, setSearch] = useState(""); // Para nombre, apellido o cédula
  const [searchAnio, setSearchAnio] = useState(""); // Para año escolar
  const [pagina, setPagina] = useState(1);
  const porPagina = 30;
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [modalEdit, setModalEdit] = useState(false);
  const [modalDelete, setModalDelete] = useState(false);
  const [asignacionEdit, setAsignacionEdit] = useState(null);
  const [asignacionDelete, setAsignacionDelete] = useState(null);

  // Para selects de edición (puedes cargar estos datos desde tu backend)
  const [docentes, setDocentes] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [secciones, setSecciones] = useState([]);
  const [aniosEscolares, setAniosEscolares] = useState([]);

  // Cargar asignaciones
  const fetchAsignaciones = async () => {
    setLoading(true);
    try {
      const res = await fetch(apiUrl+`/asignaciones-docente`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      const data = await res.json();
      setAsignaciones(data.asignaciones || []);
    } catch {
      setMensaje("Error cargando asignaciones.");
    }
    setLoading(false);
  };

  // Cargar selects para edición
  const fetchCatalogos = async () => {
    try {
      const [docRes, matRes, secRes, anioRes] = await Promise.all([
        fetch(apiUrl+"/docentes",
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        ),
        fetch(apiUrl+"/materias-anio",
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        ),
        fetch(apiUrl+"/secciones",
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        ),
        fetch(apiUrl+"/aniosescolares",
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        )
      ]);
      setDocentes((await docRes.json()).docentes || []);
      setMaterias((await matRes.json()).añosMateria || []);
      setSecciones((await secRes.json()).secciones || []);
      setAniosEscolares((await anioRes.json()).añosEscolares || []);
    } catch {
      setDocentes([]); setMaterias([]); setSecciones([]); setAniosEscolares([]);
    }
  };

  useEffect(() => { fetchAsignaciones(); }, []);
  useEffect(() => { fetchCatalogos(); }, []);

  // Eliminar
  const handleDelete = async () => {
    try {
      const res = await fetch(apiUrl+`/asignaciones-docente/${asignacionDelete.id_asignacion}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" ,
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      setMensaje(data.mensaje);
      setModalDelete(false);
      fetchAsignaciones();
    } catch {
      setMensaje("Error eliminando asignación.");
    }
  };

  // Editar
  const handleEdit = async () => {
    try {
      const res = await fetch(apiUrl+`/asignaciones-docente/${asignacionEdit.id_asignacion}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`
         },
        body: JSON.stringify(asignacionEdit)
      });
      const data = await res.json();
      setMensaje(data.mensaje);
      setModalEdit(false);
      fetchAsignaciones();
    } catch {
      setMensaje("Error editando asignación.");
    }
  };

  // Filtrar asignaciones por año escolar y por nombre, apellido o cédula
  const asignacionesFiltradas = asignaciones.filter(asig => {
    const searchLower = search.toLowerCase();
    const searchAnioLower = searchAnio.toLowerCase();
    const coincideAnio = searchAnio === "" || (asig.año_escolar && asig.año_escolar.toLowerCase().includes(searchAnioLower));
    const coincidePersona =
      search === "" ||
      (asig.nombre_docente && asig.nombre_docente.toLowerCase().includes(searchLower)) ||
      (asig.apellido_docente && asig.apellido_docente.toLowerCase().includes(searchLower)) ||
      (asig.cedula_docente && String(asig.cedula_docente).toLowerCase().includes(searchLower));
    return coincideAnio && coincidePersona;
  });

  // Paginación dinámica solo con páginas llenas
  const totalPaginas = Math.ceil(asignacionesFiltradas.length / porPagina);
  const asignacionesPagina = asignacionesFiltradas.slice((pagina - 1) * porPagina, pagina * porPagina);

  // Si cambian los filtros, vuelve a la página 1
  useEffect(() => {
    setPagina(1);
  }, [search, searchAnio]);

  return (
    <CContainer className="py-4">
      {/* Inyectar el CSS solo una vez */}
      <style>{tablaEstilos}</style>
      <CRow className="justify-content-center">
        <CCol xs={12} lg={11}>
          <CCard className="shadow-sm">
            <CCardHeader style={{ background: "#114c5f", color: "#fff" }}>
              <strong>Asignaciones de Materias a Docentes</strong>
            </CCardHeader>
            <CCardBody>
              {/* Barra de filtro por año escolar */}
              <div className="mb-2">
                <CFormInput
                  placeholder="Filtrar por año escolar"
                  value={searchAnio}
                  onChange={e => setSearchAnio(e.target.value)}
                />
              </div>
              {/* Barra de filtro por nombre, apellido o cédula */}
              <div className="mb-3">
                <CFormInput
                  placeholder="Filtrar por nombre, apellido o cédula"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              {mensaje && (
                <CAlert color={mensaje.includes("Error") ? "danger" : "success"} dismissible onClose={() => setMensaje("")}>
                  {mensaje}
                </CAlert>
              )}
              {loading ? (
                <div className="text-center py-5"><CSpinner color="primary" /></div>
              ) : (
                <>
                  <CTable hover responsive bordered align="middle" className="mb-0 tabla-asignaciones">
                    <CTableHead color="light">
                      <CTableRow>
                        <CTableHeaderCell>Docente</CTableHeaderCell>
                        <CTableHeaderCell>Cédula</CTableHeaderCell>
                        <CTableHeaderCell>Materia</CTableHeaderCell>
                        <CTableHeaderCell>Año</CTableHeaderCell>
                        <CTableHeaderCell>Sección</CTableHeaderCell>
                        <CTableHeaderCell>Año Escolar</CTableHeaderCell>
                        <CTableHeaderCell>Acciones</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {asignacionesPagina.map(asig => (
                        <CTableRow key={asig.id_asignacion}>
                          <CTableDataCell>
                            {asig.nombre_docente} {asig.apellido_docente}
                          </CTableDataCell>
                          <CTableDataCell>
                            {asig.tipo_documento_docente || "V"}-{asig.cedula_docente}
                          </CTableDataCell>
                          <CTableDataCell>
                            {asig.nombre_materia} ({asig.codigo_materia})
                          </CTableDataCell>
                          <CTableDataCell>{asig.año}</CTableDataCell>
                          <CTableDataCell>{asig.seccion}</CTableDataCell>
                          <CTableDataCell>{asig.año_escolar}</CTableDataCell>
                          <CTableDataCell>
                            <div className="acciones-btns">
                              <CButton
                                style={{backgroundColor:'white', color:'blue', borderColor:'blue'}}
                                size="sm"
                                onClick={() => { setAsignacionEdit(asig); setModalEdit(true); }}
                              >Editar</CButton>
                              <CButton
                                style={{backgroundColor:'white', color:'red', borderColor:'red'}}
                                size="sm"
                                onClick={() => { setAsignacionDelete(asig); setModalDelete(true); }}
                              >Eliminar</CButton>
                            </div>
                          </CTableDataCell>
                        </CTableRow>
                      ))}
                    </CTableBody>
                  </CTable>
                  {/* Paginación solo si hay más de una página */}
                  {totalPaginas > 1 && (
                    <CPagination align="center" className="mt-3">
                      <CPaginationItem
                        disabled={pagina === 1}
                        onClick={() => setPagina(pagina - 1)}
                      >
                        &laquo;
                      </CPaginationItem>
                      {Array.from({ length: totalPaginas }, (_, i) => (
                        asignacionesFiltradas.slice(i * porPagina, (i + 1) * porPagina).length > 0 && (
                          <CPaginationItem
                            key={i + 1}
                            active={pagina === i + 1}
                            onClick={() => setPagina(i + 1)}
                          >
                            {i + 1}
                          </CPaginationItem>
                        )
                      ))}
                      <CPaginationItem
                        disabled={pagina === totalPaginas}
                        onClick={() => setPagina(pagina + 1)}
                      >
                        &raquo;
                      </CPaginationItem>
                    </CPagination>
                  )}
                </>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Modal Editar */}
      <CModal visible={modalEdit} onClose={() => setModalEdit(false)}>
        <CModalHeader>
          <CModalTitle>Editar Asignación</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {asignacionEdit && (
            <>
              <CFormSelect
                className="mb-2"
                value={asignacionEdit.id_docente}
                onChange={e => setAsignacionEdit({ ...asignacionEdit, id_docente: e.target.value })}
              >
                <option value="">Seleccione Docente</option>
                {docentes.map(d => (
                  <option key={d.id_docente} value={d.id_docente}>
                    {d.nombre} ({d.cedula})
                  </option>
                ))}
              </CFormSelect>
              <CFormSelect
                className="mb-2"
                value={asignacionEdit.id_año_materia}
                onChange={e => setAsignacionEdit({ ...asignacionEdit, id_año_materia: e.target.value })}
              >
                <option value="">Seleccione Materia</option>
                {materias.map(m => (
                  <option key={m.id_año_materia} value={m.id_año_materia}>
                    {m.nombre_materia} - {m.nombre_año}
                  </option>
                ))}
              </CFormSelect>
              <CFormSelect
                className="mb-2"
                value={asignacionEdit.id_seccion}
                onChange={e => setAsignacionEdit({ ...asignacionEdit, id_seccion: e.target.value })}
              >
                <option value="">Seleccione Sección</option>
                {secciones.map(s => (
                  <option key={s.id_seccion} value={s.id_seccion}>
                    {s.nombre_seccion} - {s.nombre_año}
                  </option>
                ))}
              </CFormSelect>
              <CFormSelect
                className="mb-2"
                value={asignacionEdit.fk_año_escolar}
                onChange={e => setAsignacionEdit({ ...asignacionEdit, fk_año_escolar: e.target.value })}
              >
                <option value="">Seleccione Año Escolar</option>
                {aniosEscolares.map(a => (
                  <option key={a.id_año_escolar} value={a.id_año_escolar}>
                    {a.nombre}
                  </option>
                ))}
              </CFormSelect>
            </>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton style={{backgroundColor:'white', color:'blue', borderColor:'blue'}} onClick={handleEdit}>Guardar</CButton>
          <CButton style={{backgroundColor:'white', color:'red', borderColor:'red'}} onClick={() => setModalEdit(false)}>Cancelar</CButton>
        </CModalFooter>
      </CModal>

      {/* Modal Eliminar */}
      <CModal visible={modalDelete} onClose={() => setModalDelete(false)}>
        <CModalHeader>
          <CModalTitle>Eliminar Asignación</CModalTitle>
        </CModalHeader>
        <CModalBody>
          ¿Está seguro que desea eliminar esta asignación?
        </CModalBody>
        <CModalFooter>
          <CButton color="danger" onClick={handleDelete}>Eliminar</CButton>
          <CButton color="secondary" onClick={() => setModalDelete(false)}>Cancelar</CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  );
};

export default AsignacionesDocenteAdmin;