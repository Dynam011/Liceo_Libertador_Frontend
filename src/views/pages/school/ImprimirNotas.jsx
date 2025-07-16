import { useState, useEffect } from "react";
import {
  CContainer, CRow, CCol, CCard, CCardHeader, CCardBody, CCardTitle,
  CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell, CButton,
  CFormSelect, CPagination, CPaginationItem
} from "@coreui/react";
import {apiUrl} from "../../../api"
const MisAsignaciones = () => {
  const [asignaciones, setAsignaciones] = useState([]);
  const [aniosEscolares, setAniosEscolares] = useState([]);
  const [anioSeleccionado, setAnioSeleccionado] = useState("");
  const [pagina, setPagina] = useState(1);
  const porPagina = 10;

  useEffect(() => {
    const fetchAsignaciones = async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(apiUrl+"/recibir", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setAsignaciones(data.asignaciones || []);
      // Extraer y ordenar años escolares
      const anios = [...new Set((data.asignaciones || []).map(a => a.año_escolar))]
        .filter(Boolean)
        .sort((a, b) => b.localeCompare(a));
      setAniosEscolares(anios);
      setAnioSeleccionado(anios[0] || "");
    };
    fetchAsignaciones();
  }, []);

  // Filtrar por año escolar seleccionado
  const asignacionesFiltradas = asignaciones.filter(a => a.año_escolar === anioSeleccionado);

  // Paginación
  const totalPaginas = Math.ceil(asignacionesFiltradas.length / porPagina);
  const asignacionesPagina = asignacionesFiltradas.slice((pagina - 1) * porPagina, pagina * porPagina);

  // Reiniciar página al cambiar año escolar
  useEffect(() => { setPagina(1); }, [anioSeleccionado]);

  return (
    <CContainer className="py-4">
      <CRow className="justify-content-center">
        <CCol xs={12} md={10} lg={8}>
          <CCard className="shadow-sm">
            <CCardHeader style={{ backgroundColor: "#114c5f", color: "white" }}>
              <CCardTitle>Mis Asignaciones</CCardTitle>
            </CCardHeader>
            <CCardBody>
              {/* Filtro por año escolar */}
              {aniosEscolares.length > 0 && (
                <CFormSelect
                  className="mb-3"
                  value={anioSeleccionado}
                  onChange={e => setAnioSeleccionado(e.target.value)}
                  style={{ maxWidth: 300 }}
                >
                  {aniosEscolares.map(anio => (
                    <option key={anio} value={anio}>{anio}</option>
                  ))}
                </CFormSelect>
              )}
              <CTable hover responsive>
                <CTableHead>
                  <CTableRow>
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
                      <CTableDataCell>{asig.materia}</CTableDataCell>
                      <CTableDataCell>{asig.año}</CTableDataCell>
                      <CTableDataCell>{asig.seccion}</CTableDataCell>
                      <CTableDataCell>{asig.año_escolar}</CTableDataCell>
                      <CTableDataCell>
                        <CButton
                          color="primary"
                          onClick={() =>
                            window.open(
                              apiUrl+`/docente/registro-calificaciones/${asig.id_asignacion}`,
                              "_blank"
                            )
                          }
                        >
                          Descargar PDF
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
              {/* Paginación */}
              {totalPaginas > 1 && (
                <div className="d-flex justify-content-center mt-3">
                  <CPagination>
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
                </div>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  );
};

export default MisAsignaciones;