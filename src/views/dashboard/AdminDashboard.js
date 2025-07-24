import { useEffect, useState } from 'react'

import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilUser, cilSchool, cilCheckCircle, cilXCircle, cilBook, cilGroup } from '@coreui/icons'
import { CChartBar } from '@coreui/react-chartjs';
import {apiUrl} from "../../api"
const Dashboard = () => {
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(apiUrl+"/dashboardd", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      .then(res => {
        if (!res.ok) throw new Error('Error en la respuesta del servidor');
        return res.json();
      })
      .then(data => setEstadisticas(data))
      .catch(err => {
        console.error('Error al obtener estadísticas:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading || !estadisticas) return <div className="text-center py-5">Cargando...</div>

  return (
    <div className="container-fluid px-2 px-md-4">
      {/* Encabezado llamativo */}
      <CRow className="justify-content-center mb-4">
        <CCol xs={12} md={10} lg={8}>
          <CCard className="shadow-sm border-0" style={{ background: "#e3f2fd" }}>
            <CCardBody className="text-center">
              <h2 className="fw-bold mb-2" style={{ color: "#1976d2" }}>
                Panel de Control Administrativo
              </h2>
              <p className="mb-0" style={{ fontSize: "1.1rem", color: "#222" }}>
                Visualiza el estado general del liceo, monitorea el rendimiento académico y accede a métricas clave de estudiantes y docentes.
              </p>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Widgets de estadísticas generales */}
      <CRow className="mb-4 g-3 justify-content-center">
        <CCol xs={6} sm={6} md={2}>
          <CCard className="text-center shadow-sm border-0 h-100">
            <CCardBody>
              <div className="d-flex justify-content-center align-items-center mb-2" style={{ minHeight: 56 }}>
                <CIcon icon={cilSchool} size="xxl" style={{ color: "#1976d2" }} />
              </div>
              <h4 className="fw-bold mb-1">{estadisticas?.totalEstudiantes ?? '-'}</h4>
              <div className="text-muted mb-1">Total Estudiantes</div>
              <small className="text-primary">¡Sigue creciendo la matrícula!</small>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol xs={6} sm={6} md={2}>
          <CCard className="text-center shadow-sm border-0 h-100">
            <CCardBody>
              <div className="d-flex justify-content-center align-items-center mb-2" style={{ minHeight: 56 }}>
                <CIcon icon={cilUser} size="xxl" style={{ color: "#388e3c" }} />
              </div>
              <h4 className="fw-bold mb-1">{estadisticas?.totalDocentes ?? '-'}</h4>
              <div className="text-muted mb-1">Total Docentes</div>
              <small className="text-success">¡Equipo docente!</small>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol xs={6} sm={6} md={2}>
          <CCard className="text-center shadow-sm border-0 h-100">
            <CCardBody>
              <div className="d-flex justify-content-center align-items-center mb-2" style={{ minHeight: 56 }}>
                <CIcon icon={cilBook} size="xxl" style={{ color: "#8e44ad" }} />
              </div>
              <h4 className="fw-bold mb-1">{estadisticas?.totalMaterias ?? '-'}</h4>
              <div className="text-muted mb-1">Total Materias</div>
              <small className="text-info">¡Oferta académica!</small>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol xs={6} sm={6} md={2}>
          <CCard className="text-center shadow-sm border-0 h-100">
            <CCardBody>
              <div className="d-flex justify-content-center align-items-center mb-2" style={{ minHeight: 56 }}>
                <CIcon icon={cilGroup} size="xxl" style={{ color: "#16a085" }} />
              </div>
              <h4 className="fw-bold mb-1">{estadisticas?.totalInscripciones ?? '-'}</h4>
              <div className="text-muted mb-1">Total Inscripciones</div>
              <small className="text-success">¡Participación estudiantil!</small>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol xs={6} sm={6} md={2}>
          <CCard className="text-center shadow-sm border-0 h-100">
            <CCardBody>
              <div className="d-flex justify-content-center align-items-center mb-2" style={{ minHeight: 56 }}>
                <CIcon icon={cilCheckCircle} size="xxl" style={{ color: "#388e3c" }} />
              </div>
              <h4 className="fw-bold mb-1">{estadisticas?.totalAprobados ?? '-'}</h4>
              <div className="text-muted mb-1">Estudiantes Aprobados</div>
              <small className="text-success">¡Excelente desempeño!</small>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol xs={6} sm={6} md={2}>
          <CCard className="text-center shadow-sm border-0 h-100">
            <CCardBody>
              <div className="d-flex justify-content-center align-items-center mb-2" style={{ minHeight: 56 }}>
                <CIcon icon={cilXCircle} size="xxl" style={{ color: "#d32f2f" }} />
              </div>
              <h4 className="fw-bold mb-1">{estadisticas?.totalReprobados ?? '-'}</h4>
              <div className="text-muted mb-1">Estudiantes Reprobados</div>
              <small className="text-danger">¡Atención a estos casos!</small>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Gráfico principal */}
      <CCard className="mb-4 shadow-sm border-0">
        <CCardHeader className="bg-white">
          <h4 className="mb-0 text-center" style={{ color: "#1976d2" }}>Estudiantes por Año</h4>
        </CCardHeader>
        <CCardBody>
          {estadisticas?.estudiantesPorAño && estadisticas.estudiantesPorAño.length > 0 ? (
            <CChartBar
              data={{
                labels: estadisticas.estudiantesPorAño.map(e => e.año),
                datasets: [
                  {
                    label: 'Estudiantes',
                    backgroundColor: estadisticas.estudiantesPorAño.map((_, idx) => {
                      const colors = [
                        '#1d63dd', '#9f3b06', '#2ecc71', '#e67e22', '#8e44ad', '#16a085', '#f39c12', '#c0392b'
                      ];
                      return colors[idx % colors.length];
                    }),
                    data: estadisticas.estudiantesPorAño.map(e => parseInt(e.cantidad)),
                    barPercentage: 0.4,
                    categoryPercentage: 0.6,
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                  x: {
                    barPercentage: 0.4,
                    categoryPercentage: 0.6,
                  },
                },
              }}
            />
          ) : (
            <div className="text-center py-3 text-muted">No hay datos de estudiantes por año disponibles.</div>
          )}
        </CCardBody>
      </CCard>

      {/* Tabla resumen de estudiantes por año */}
      <CCard className="mb-4 shadow-sm border-0">
        <CCardHeader className="bg-white">
          <h4 className="mb-0 text-center" style={{ color: "#1976d2" }}>Resumen por Año</h4>
        </CCardHeader>
        <CCardBody>
          <div className="table-responsive">
            <CTable align="middle" className="mb-0 border" hover responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Año</CTableHeaderCell>
                  <CTableHeaderCell>Cantidad de Estudiantes</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {estadisticas?.estudiantesPorAño?.map((row, idx) => (
                  <CTableRow key={idx}>
                    <CTableDataCell>{row.año ?? '-'}</CTableDataCell>
                    <CTableDataCell>{row.cantidad ?? '-'}</CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          </div>
        </CCardBody>
      </CCard>

      {/* ...el resto del código permanece igual... */}
    </div>
  )
}

export default Dashboard