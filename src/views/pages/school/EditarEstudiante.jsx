import { useState, useEffect } from "react";
import {
  CContainer, CRow, CCol, CCard, CCardHeader, CCardBody, CTable, CTableHead, CTableRow,
  CTableHeaderCell, CTableBody, CTableDataCell, CButton, CPagination, CPaginationItem,
  CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter, CFormInput, CFormSelect, CAlert, CSpinner
} from "@coreui/react";
import {apiUrl} from "../../../api"
const EstudiantesAdmin = () => {
  const [estudiantes, setEstudiantes] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [modalEdit, setModalEdit] = useState(false);
  const [modalDelete, setModalDelete] = useState(false);
  const [estudianteEdit, setEstudianteEdit] = useState(null);
  const [estudianteDelete, setEstudianteDelete] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [tiposDocumento, setTiposDocumento] = useState([]);
  const [nacionalidades, setNacionalidades] = useState([]);
  const [errorEdit, setErrorEdit] = useState("");

  // Cargar catálogos
  const fetchCatalogos = async () => {
    try {
      const [tdRes, nacRes] = await Promise.all([
        fetch(apiUrl+"/tipos-documento"),
        fetch(apiUrl+"/nacionalidades")
      ]);
      setTiposDocumento(await tdRes.json());
      setNacionalidades(await nacRes.json());
    } catch {
      setTiposDocumento([]);
      setNacionalidades([]);
    }
  };

  // Listar estudiantes paginados
  const fetchEstudiantes = async (pagina = 1) => {
    setLoading(true);
    try {
      const res = await fetch(apiUrl+`/estudiante?page=${pagina}&limit=1000`);
      const data = await res.json();
      setEstudiantes(data.estudiantes || []);
      setTotalPages(data.totalPages || 1);
      setPage(data.page || 1);
    } catch {
      setMensaje("Error cargando estudiantes.");
    }
    setLoading(false);
  };

  useEffect(() => { fetchEstudiantes(); }, []);
  useEffect(() => { fetchCatalogos(); }, []);

  // Eliminar
  const handleDelete = async () => {
    try {
      const res = await fetch(apiUrl+`/estudiante/${estudianteDelete.cedula}`, {
        method: "DELETE"
      });
      const data = await res.json();
      setMensaje(data.mensaje);
      setModalDelete(false);
      fetchEstudiantes();
    } catch {
      setMensaje("Error eliminando estudiante.");
    }
  };

  // Editar
  const handleEdit = async () => {
    setErrorEdit("");
    try {
      const res = await fetch(apiUrl+`/estudiante/${estudianteEdit.cedula}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(estudianteEdit)
      });
      const data = await res.json();
      if (res.ok) {
        setMensaje(data.mensaje);
        setModalEdit(false);
        fetchEstudiantes();
      } else {
        setErrorEdit(data.mensaje || "Error editando estudiante.");
      }
    } catch {
      setErrorEdit("Error editando estudiante.");
    }
  };

  // Manejar cambios en los campos del modal de edición
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEstudianteEdit({ ...estudianteEdit, [name]: value });
  };

  // Filtrar estudiantes por búsqueda
  const estudiantesFiltrados = estudiantes.filter(est =>
    (est.nombres && est.nombres.toLowerCase().includes(busqueda.toLowerCase())) ||
    (est.apellidos && est.apellidos.toLowerCase().includes(busqueda.toLowerCase())) ||
    (est.cedula && est.cedula.toString().includes(busqueda))
  );

  // Reiniciar a la página 1 cuando cambia la búsqueda
  useEffect(() => {
    setPage(1);
  }, [busqueda]);

  // Paginación local sobre los filtrados
  const estudiantesPorPagina = 20;
  const totalPagesFiltrado = Math.ceil(estudiantesFiltrados.length / estudiantesPorPagina);
  const estudiantesPaginaActual = estudiantesFiltrados.slice(
    (page - 1) * estudiantesPorPagina,
    page * estudiantesPorPagina
  );

  // Ajuste de estilos para que los nombres y apellidos no se monten ni hagan scroll
  const tablaEstilos = `
  .celda-nombre, .celda-apellido {
    white-space: normal;
    word-break: break-word;
    max-width: 200px;
    min-width: 100px;
  }
  `;

  return (
    <CContainer className="py-4">
      <style>{tablaEstilos}</style>
      <CRow className="justify-content-center">
        <CCol xs={12} lg={11}>
          <CCard className="shadow-sm">
            <CCardHeader style={{ background: "#114c5f", color: "#fff" }}>
              <strong>Estudiantes</strong>
            </CCardHeader>
            <CCardBody>
              {/* Barra de búsqueda */}
              <CFormInput
                className="mb-3"
                placeholder="Buscar por nombres, apellidos o cédula..."
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
              />
              {mensaje && (
                <CAlert color={mensaje.includes("Error") ? "danger" : "success"} dismissible onClose={() => setMensaje("")}>
                  {mensaje}
                </CAlert>
              )}
              {loading ? (
                <div className="text-center py-5"><CSpinner color="primary" /></div>
              ) : (
                <>
                  <CTable hover bordered align="middle" className="mb-0">
                    <CTableHead color="light">
                      <CTableRow style={{ textAlign: 'center' }}>
                        <CTableHeaderCell>Tipo Documento</CTableHeaderCell>
                        <CTableHeaderCell>Cédula</CTableHeaderCell>
                        <CTableHeaderCell>Nombres</CTableHeaderCell>
                        <CTableHeaderCell>Apellidos</CTableHeaderCell>
                        <CTableHeaderCell>Nacionalidad</CTableHeaderCell>
                        <CTableHeaderCell>Sexo</CTableHeaderCell>
                        <CTableHeaderCell>Fecha Nacimiento</CTableHeaderCell>
                        <CTableHeaderCell>Lugar Nacimiento</CTableHeaderCell>
                        <CTableHeaderCell>Acciones</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {estudiantesPaginaActual.map(est => (
                        <CTableRow key={est.cedula} style={{ textAlign: 'center' }}>
                          <CTableDataCell>{est.tipo_documento}</CTableDataCell>
                          <CTableDataCell>{est.cedula}</CTableDataCell>
                          <CTableDataCell className="celda-nombre">{est.nombres}</CTableDataCell>
                          <CTableDataCell className="celda-apellido">{est.apellidos}</CTableDataCell>
                          <CTableDataCell>{est.nacionalidad}</CTableDataCell>
                          <CTableDataCell>{est.sexo}</CTableDataCell>
                          <CTableDataCell>{est.fecha_nacimiento ? est.fecha_nacimiento.substring(0, 10) : ""}</CTableDataCell>
                          <CTableDataCell>{est.lugar_nacimiento}</CTableDataCell>
                          <CTableDataCell style={{ width: '150px' }}>
                            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
                              <CButton
                                style={{backgroundColor:'white', color:'blue', borderColor:'blue'}}
                                size="sm"
                                onClick={() => {
                                  setEstudianteEdit({
                                    ...est,
                                    nueva_cedula: est.cedula,
                                    fk_documento: tiposDocumento.find(td => td.nombre === est.tipo_documento)?.id_documento || "",
                                    nacionalidad: nacionalidades.find(n => n.nombre === est.nacionalidad)?.id_nacionalidad || ""
                                  });
                                  setModalEdit(true);
                                }}
                              >Editar</CButton>
                              <CButton
                                style={{backgroundColor:'white', color:'red', borderColor:'red'}}
                                size="sm"
                                onClick={() => { setEstudianteDelete(est); setModalDelete(true); }}
                              >Eliminar</CButton>
                            </div>
                          </CTableDataCell>
                        </CTableRow>
                      ))}
                    </CTableBody>
                  </CTable>
                  <CPagination align="center" className="mt-3">
                    {[...Array(totalPagesFiltrado)].map((_, idx) => (
                      <CPaginationItem
                        key={idx + 1}
                        active={page === idx + 1}
                        onClick={() => setPage(idx + 1)}
                      >
                        {idx + 1}
                      </CPaginationItem>
                    ))}
                  </CPagination>
                </>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Modal Editar */}
      <CModal visible={modalEdit} onClose={() => { setModalEdit(false); setErrorEdit(""); }}>
        <CModalHeader>
          <CModalTitle>Editar Estudiante</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {errorEdit && (
            <CAlert color="danger" className="mb-2">
              {errorEdit}
            </CAlert>
          )}
          {estudianteEdit && (
            <>
              <CFormInput
                className="mb-2"
                label="Cédula"
                name="nueva_cedula"
                value={estudianteEdit.nueva_cedula}
                onChange={handleEditChange}
              />
              <CFormInput
                className="mb-2"
                label="Nombres"
                name="nombres"
                value={estudianteEdit.nombres}
                onChange={handleEditChange}
              />
              <CFormInput
                className="mb-2"
                label="Apellidos"
                name="apellidos"
                value={estudianteEdit.apellidos}
                onChange={handleEditChange}
              />
              <CFormSelect
                className="mb-2"
                label="Nacionalidad"
                name="nacionalidad"
                value={estudianteEdit.nacionalidad}
                onChange={handleEditChange}
              >
                <option value="">Seleccione</option>
                {nacionalidades.map(n => (
                  <option key={n.id_nacionalidad} value={n.id_nacionalidad}>{n.nombre}</option>
                ))}
              </CFormSelect>
              <CFormInput
                className="mb-2"
                label="Sexo"
                name="sexo"
                value={estudianteEdit.sexo}
                onChange={handleEditChange}
              />
              <CFormInput
                className="mb-2"
                label="Fecha de Nacimiento"
                name="fecha_nacimiento"
                type="date"
                value={estudianteEdit.fecha_nacimiento ? estudianteEdit.fecha_nacimiento.substring(0, 10) : ""}
                onChange={handleEditChange}
              />
              <CFormInput
                className="mb-2"
                label="Lugar de Nacimiento"
                name="lugar_nacimiento"
                value={estudianteEdit.lugar_nacimiento}
                onChange={handleEditChange}
              />
              <CFormSelect
                className="mb-2"
                label="Tipo Documento"
                name="fk_documento"
                value={estudianteEdit.fk_documento || ""}
                onChange={handleEditChange}
              >
                <option value="">Seleccione</option>
                {tiposDocumento.map(td => (
                  <option key={td.id_documento} value={td.id_documento}>{td.nombre}</option>
                ))}
              </CFormSelect>
            </>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton style={{backgroundColor:'white', color:'blue', borderColor:'blue'}} onClick={handleEdit}>Guardar</CButton>
          <CButton style={{backgroundColor:'white', color:'red', borderColor:'red'}} onClick={() => { setModalEdit(false); setErrorEdit(""); }}>Cancelar</CButton>
        </CModalFooter>
      </CModal>

      {/* Modal Eliminar */}
      <CModal visible={modalDelete} onClose={() => setModalDelete(false)}>
        <CModalHeader>
          <CModalTitle>Eliminar Estudiante</CModalTitle>
        </CModalHeader>
        <CModalBody>
          ¿Está seguro que desea eliminar este estudiante?
        </CModalBody>
        <CModalFooter>
          <CButton style={{backgroundColor:'white', color:'red', borderColor:'red'}} onClick={handleDelete}>Eliminar</CButton>
          <CButton style={{backgroundColor:'white', color:'blue', borderColor:'blue'}} onClick={() => setModalDelete(false)}>Cancelar</CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  );
};

export default EstudiantesAdmin;