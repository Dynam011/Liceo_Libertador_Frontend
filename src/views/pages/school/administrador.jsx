import React, { useState, useEffect } from "react";
import {
  CContainer, CRow, CCol, CCard, CCardHeader, CCardBody, CCardTitle,
  CFormInput, CFormSelect, CButton, CTable, CTableHead, CTableRow,
  CTableHeaderCell, CTableBody, CTableDataCell, CSpinner
} from "@coreui/react";
import {apiUrl} from "../../../api"
const API = apiUrl;
const token = localStorage.getItem("token");
export default function AdministradorNotas() {
  const [aniosEscolares, setAniosEscolares] = useState([]);
  const [anios, setAnios] = useState([]);
  const [secciones, setSecciones] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [materiaSeleccionada, setMateriaSeleccionada] = useState('');
  const [filtros, setFiltros] = useState({
    id_año_escolar: '',
    id_año: '',
    id_seccion: '',
  });
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [editando, setEditando] = useState(null); // {id_materia_inscrita, lapso}
  const [nuevaNota, setNuevaNota] = useState('');

  // Cargar años escolares al inicio
  useEffect(() => {
    fetch(`${API}/admin-notas-anios-escolares`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    )
      .then(r => r.json())
      .then(r => setAniosEscolares(r.aniosEscolaresAdmin || []));
  }, []);

  // Cargar años (grados) al inicio
  useEffect(() => {
    fetch(`${API}/admin-notas-anios`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    )
      .then(r => r.json())
      .then(r => setAnios(r.aniosAdmin || []));
  }, []);

  // Cargar secciones
  useEffect(() => {
    if (filtros.id_año) {
      fetch(`${API}/admin-notas-secciones?id_año=${filtros.id_año}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )
        .then(r => r.json())
        .then(r => setSecciones(r.seccionesAdmin || []));
    } else {
      setSecciones([]);
    }
    setFiltros(f => ({ ...f, id_seccion: '' }));
    setMaterias([]);
    setEstudiantes([]);
    setMateriaSeleccionada('');
  }, [filtros.id_año]);

  // Cargar materias
  useEffect(() => {
    if (filtros.id_seccion && filtros.id_año_escolar) {
      fetch(`${API}/admin-notas-materias?id_seccion=${filtros.id_seccion}&id_año_escolar=${filtros.id_año_escolar}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )
        .then(r => r.json())
        .then(r => setMaterias(r.materiasAdmin || []));
    } else {
      setMaterias([]);
    }
    setMateriaSeleccionada('');
    setEstudiantes([]);
  }, [filtros.id_seccion, filtros.id_año_escolar]);

  // Cargar estudiantes y notas de la materia seleccionada
  useEffect(() => {
    if (filtros.id_seccion && filtros.id_año_escolar && materiaSeleccionada) {
      setLoading(true);
      fetch(`${API}/admin-notas-estudiantes-materia?id_seccion=${filtros.id_seccion}&id_año_escolar=${filtros.id_año_escolar}&id_año_materia=${materiaSeleccionada}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )
        .then(r => r.json())
        .then(r => setEstudiantes(r.estudiantesNotasAdmin || []))
        .finally(() => setLoading(false));
    } else {
      setEstudiantes([]);
    }
  }, [filtros.id_seccion, filtros.id_año_escolar, materiaSeleccionada]);

  const handleFiltro = e => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
  };

  // Filtrado de estudiantes por nombre o cédula
  const estudiantesFiltrados = estudiantes.filter(est =>
    (est.nombres + " " + est.apellidos + " " + est.cedula)
      .toLowerCase()
      .includes(busqueda.toLowerCase())
  );

  // Editar nota
  const handleEditar = (id_materia_inscrita, lapso, valorActual) => {
    setEditando({ id_materia_inscrita, lapso });
    setNuevaNota(valorActual ?? '');
  };

  const guardarNota = async () => {
    if (!editando || nuevaNota === "") return;
    setLoading(true);
    let body = { ...editando };
    if (editando.lapso === 4) {
      body.rep = nuevaNota;
    } else {
      body.nueva_nota = nuevaNota;
    }
    await fetch(`${API}/admin-notas-editar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
       },
      body: JSON.stringify(body)
    });
    setEditando(null);
    setNuevaNota('');
    // Refrescar estudiantes y notas
    fetch(`${API}/admin-notas-estudiantes-materia?id_seccion=${filtros.id_seccion}&id_año_escolar=${filtros.id_año_escolar}&id_año_materia=${materiaSeleccionada}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    )
      .then(r => r.json())
      .then(r => setEstudiantes(r.estudiantesNotasAdmin || []))
      .finally(() => setLoading(false));
  };

  return (
    <CContainer className="py-4">
      <CRow className="justify-content-center">
        <CCol xs={12} md={10} lg={10}>
          <CCard className="shadow-sm mb-4">
            <CCardHeader style={{ backgroundColor: "#114c5f", color: "white" }}>
              <CCardTitle>Gestión de Notas por Sección y Materia</CCardTitle>
            </CCardHeader>
            <CCardBody>
              <CRow className="mb-3">
                <CCol xs={12} md={3}>
                  <CFormSelect
                    name="id_año_escolar"
                    value={filtros.id_año_escolar}
                    onChange={handleFiltro}
                  >
                    <option value="">Año Escolar</option>
                    {aniosEscolares.map(a => (
                      <option key={a.id_año_escolar} value={a.id_año_escolar}>{a.nombre}</option>
                    ))}
                  </CFormSelect>
                </CCol>
                <CCol xs={12} md={2}>
                  <CFormSelect
                    name="id_año"
                    value={filtros.id_año}
                    onChange={handleFiltro}
                    disabled={!anios.length}
                  >
                    <option value="">Año</option>
                    {anios.map(a => (
                      <option key={a.id_año} value={a.id_año}>{a.nombre}</option>
                    ))}
                  </CFormSelect>
                </CCol>
                <CCol xs={12} md={3}>
                  <CFormSelect
                    name="id_seccion"
                    value={filtros.id_seccion}
                    onChange={handleFiltro}
                    disabled={!secciones.length}
                  >
                    <option value="">Sección</option>
                    {secciones.map(s => (
                      <option key={s.id_seccion} value={s.id_seccion}>{s.nombre_seccion}</option>
                    ))}
                  </CFormSelect>
                </CCol>
                <CCol xs={12} md={4}>
                  <CFormSelect
                    value={materiaSeleccionada}
                    onChange={e => setMateriaSeleccionada(e.target.value)}
                    disabled={!materias.length}
                  >
                    <option value="">Materia</option>
                    {materias.map(m => (
                      <option key={m.id_año_materia} value={m.id_año_materia}>{m.nombre_materia}</option>
                    ))}
                  </CFormSelect>
                </CCol>
              </CRow>

              {materiaSeleccionada && estudiantes.length > 0 && (
                <>
                  <CRow className="mb-3">
                    <CCol xs={12} md={6} lg={4}>
                      <CFormInput
                        placeholder="Buscar estudiante por nombre o cédula..."
                        value={busqueda}
                        onChange={e => setBusqueda(e.target.value)}
                      />
                    </CCol>
                  </CRow>
                  <div style={{ overflowX: 'auto' }}>
                    <CTable hover responsive bordered align="middle">
                      <CTableHead color="light">
                        <CTableRow>
                          <CTableHeaderCell>Estudiante</CTableHeaderCell>
                          <CTableHeaderCell>Momento 1</CTableHeaderCell>
                          <CTableHeaderCell>Momento 2</CTableHeaderCell>
                          <CTableHeaderCell>Momento 3</CTableHeaderCell>
                          <CTableHeaderCell>Definitiva</CTableHeaderCell>
                          <CTableHeaderCell>Rep</CTableHeaderCell>
                        </CTableRow>
                      </CTableHead>
                      <CTableBody>
                        {loading ? (
                          <CTableRow>
                            <CTableDataCell colSpan={6} className="text-center">
                              <CSpinner color="primary" />
                            </CTableDataCell>
                          </CTableRow>
                        ) : estudiantesFiltrados.length === 0 ? (
                          <CTableRow>
                            <CTableDataCell colSpan={6} className="text-center text-muted">
                              No hay estudiantes que coincidan con la búsqueda.
                            </CTableDataCell>
                          </CTableRow>
                        ) : (
                          estudiantesFiltrados.map(est => (
                            <CTableRow key={est.id_inscripcion}>
                              <CTableDataCell>
                                <span style={{ fontWeight: "bold", color: "#114c5f" }}>
                                  {est.nombres} {est.apellidos}
                                </span>
                                <br />
                                <small className="text-muted">C.I.: {est.cedula}</small>
                              </CTableDataCell>
                              {[1, 2, 3].map(lapso => (
                                <CTableDataCell key={lapso} style={{ cursor: "pointer" }}>
                                  {editando &&
                                    editando.id_materia_inscrita === est.id_materia_inscrita &&
                                    editando.lapso === lapso ? (
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                      <CFormInput
                                        type="number"
                                        size="sm"
                                        value={nuevaNota}
                                        min={0}
                                        max={20}
                                        style={{ width: 60, marginRight: 4 }}
                                        onChange={e => setNuevaNota(e.target.value)}
                                        autoFocus
                                      />
                                      <CButton
                                        color="success"
                                        size="sm"
                                        style={{ marginRight: 2 }}
                                        onClick={guardarNota}
                                      >Guardar</CButton>
                                      <CButton
                                        color="danger"
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setEditando(null)}
                                      >Cancelar</CButton>
                                    </div>
                                  ) : (
                                    <span
                                      onClick={() => {
                                        setEditando({
                                          id_materia_inscrita: est.id_materia_inscrita,
                                          lapso
                                        });
                                        setNuevaNota(est[`lapso${lapso}`] ?? "");
                                      }}
                                      style={{
                                        display: "inline-block",
                                        minWidth: 30,
                                        borderBottom: "1px dashed #114c5f",
                                        color: "#114c5f"
                                      }}
                                    >
                                      {est[`lapso${lapso}`] !== null && est[`lapso${lapso}`] !== undefined
                                        ? est[`lapso${lapso}`]
                                        : "-"}
                                    </span>
                                  )}
                                </CTableDataCell>
                              ))}
                              <CTableDataCell>
                                {est.definitiva !== null && est.definitiva !== undefined ? est.definitiva : "-"}
                              </CTableDataCell>
                              <CTableDataCell style={{ cursor: "pointer" }}>
                                {editando &&
                                  editando.id_materia_inscrita === est.id_materia_inscrita &&
                                  editando.lapso === 4 ? (
                                  <div style={{ display: "flex", alignItems: "center" }}>
                                    <CFormInput
                                      type="number"
                                      size="sm"
                                      value={nuevaNota}
                                      min={0}
                                      max={20}
                                      style={{ width: 60, marginRight: 4 }}
                                      onChange={e => setNuevaNota(e.target.value)}
                                      autoFocus
                                    />
                                    <CButton
                                      color="success"
                                      size="sm"
                                      style={{ marginRight: 2 }}
                                      onClick={guardarNota}
                                    >Guardar</CButton>
                                    <CButton
                                      color="danger"
                                      size="sm"
                                      variant="outline"
                                      onClick={() => setEditando(null)}
                                    >Cancelar</CButton>
                                  </div>
                                ) : (
                                  <span
                                    onClick={() => {
                                      setEditando({
                                        id_materia_inscrita: est.id_materia_inscrita,
                                        lapso: 4
                                      });
                                      setNuevaNota(est.rep ?? "");
                                    }}
                                    style={{
                                      display: "inline-block",
                                      minWidth: 30,
                                      borderBottom: "1px dashed #114c5f",
                                      color: "#114c5f"
                                    }}
                                  >
                                    {est.rep !== null && est.rep !== undefined && est.rep !== "" ? est.rep : "-"}
                                  </span>
                                )}
                              </CTableDataCell>
                            </CTableRow>
                          ))
                        )}
                      </CTableBody>
                    </CTable>
                  </div>
                </>
              )}

              {materiaSeleccionada && estudiantes.length === 0 && (
                <div className="text-center text-muted mt-4">No hay estudiantes para esta sección.</div>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  );
}