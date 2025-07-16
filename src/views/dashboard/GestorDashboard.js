import React, { useEffect, useState } from "react";
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
} from "@coreui/react";
import {apiUrl} from "../../api"
import CIcon from "@coreui/icons-react";
import {
  cilUser,
  cilChartPie,
  cilSchool,
  cilCheckCircle,
  cilXCircle,
  cilStar,
} from "@coreui/icons";
import { CChartBar } from "@coreui/react-chartjs";

const GestorDashboard = () => {
  const [stats, setStats] = useState(null);
  const [studentTable, setStudentTable] = useState([]);
  const [usuario, setUsuario] = useState(null);

  const [bestMetrics, setBestMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [estadisticas, setEstadisticas] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(studentTable.length / itemsPerPage);
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentStudents = studentTable.slice(indexOfFirst, indexOfLast);

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem("usuario");
    if (usuarioGuardado) {
      setUsuario(JSON.parse(usuarioGuardado));
    }
    const fetchData = async () => {
      try {
        const statsRes = await fetch(apiUrl+"/stats");
        const studentsRes = await fetch(apiUrl+"/students");
        const metricsRes = await fetch(apiUrl+"/metrics");

        const statsData = await statsRes.json();
        const studentsData = await studentsRes.json();
        const metricsData = await metricsRes.json();
        setStats(statsData);
        setStudentTable(studentsData);
        setBestMetrics(metricsData);
      } catch (error) {
        console.error("Error al obtener datos del dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    fetch(apiUrl+"/dashboardd")
      .then((res) => {
        if (!res.ok) throw new Error("Error en la respuesta del servidor");
        return res.json();
      })
      .then((data) => setEstadisticas(data))
      .catch((err) => {
        console.error("Error al obtener estadísticas:", err);
      });
    fetchData();
  }, []);

  if (loading || !stats || !bestMetrics)
    return <div className="text-center py-5">Cargando...</div>;

  return (
    <div className="container-fluid px-2 px-md-4">
      {/* Mensaje de bienvenida personalizado */}
      <CRow className="justify-content-center mt-5">
        <CCol xs={12} md={8} lg={6}>
          <CCard className="shadow-sm border-0" style={{ background: "#e3f2fd" }}>
            <CCardBody className="text-center">
              <h2 className="fw-bold mb-3" style={{ color: "#1976d2" }}>
                ¡Bienvenido, {usuario?.nombre ?? "Gestor"}!
              </h2>
              <p className="mb-0" style={{ fontSize: "1.1rem", color: "#222" }}>
                Este es tu panel principal como gestor. Aquí podrás acceder a las
                herramientas y reportes de gestión del sistema.
              </p>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Widgets de estadísticas generales */}
      <CRow className="mb-4 g-3 justify-content-center">
        <CCol xs={6} sm={6} md={3}>
          <CCard className="text-center shadow-sm border-0 h-100">
            <CCardBody>
              <div
                className="d-flex justify-content-center align-items-center mb-2"
                style={{ minHeight: 56 }}
              >
                <CIcon icon={cilSchool} size="xxl" style={{ color: "#1976d2" }} />
              </div>
              <h4 className="fw-bold mb-1">{stats?.totalStudents ?? "-"}</h4>
              <div className="text-muted mb-1">Total Estudiantes</div>
              <small className="text-primary">
                ¡Sigue creciendo la matrícula!
              </small>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol xs={6} sm={6} md={3}>
          <CCard className="text-center shadow-sm border-0 h-100">
            <CCardBody>
              <div
                className="d-flex justify-content-center align-items-center mb-2"
                style={{ minHeight: 56 }}
              >
                <CIcon icon={cilCheckCircle} size="xxl" style={{ color: "#388e3c" }} />
              </div>
              <h4 className="fw-bold mb-1">{stats?.approved ?? "-"}</h4>
              <div className="text-muted mb-1">Estudiantes Aprobados</div>
              <small className="text-success">¡Excelente desempeño!</small>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol xs={6} sm={6} md={3}>
          <CCard className="text-center shadow-sm border-0 h-100">
            <CCardBody>
              <div
                className="d-flex justify-content-center align-items-center mb-2"
                style={{ minHeight: 56 }}
              >
                <CIcon icon={cilXCircle} size="xxl" style={{ color: "#d32f2f" }} />
              </div>
              <h4 className="fw-bold mb-1">{stats?.failed ?? "-"}</h4>
              <div className="text-muted mb-1">Estudiantes Reprobados</div>
              <small className="text-danger">¡Atención a estos casos!</small>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Gráfico principal */}
      <CCard className="mb-4 shadow-sm border-0">
        <CCardHeader className="bg-white">
          <h4 className="mb-0 text-center" style={{ color: "#1976d2" }}>
            Distribución de Calificaciones
          </h4>
        </CCardHeader>
        <CCardBody>
          {estadisticas?.estudiantesPorAño &&
          estadisticas.estudiantesPorAño.length > 0 ? (
            <CChartBar
              data={{
                labels: estadisticas.estudiantesPorAño.map((e) => e.año),
                datasets: [
                  {
                    label: "Estudiantes",
                    backgroundColor: estadisticas.estudiantesPorAño.map((_, idx) => {
                      const colors = [
                        "#1d63dd",
                        "#9f3b06",
                        "#2ecc71",
                        "#e67e22",
                        "#8e44ad",
                        "#16a085",
                        "#f39c12",
                        "#c0392b",
                      ];
                      return colors[idx % colors.length];
                    }),
                    data: estadisticas.estudiantesPorAño.map((e) =>
                      parseInt(e.cantidad)
                    ),
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
            <div className="text-center py-3 text-muted">
              No hay datos de distribución de calificaciones disponibles.
            </div>
          )}
        </CCardBody>
      </CCard>

      {/* Tabla de estudiantes */}
      <CCard className="mb-4 shadow-sm border-0">
        <CCardHeader className="bg-white">
          <h4 className="mb-0 text-center" style={{ color: "#1976d2" }}>
            Detalles de Estudiantes
          </h4>
        </CCardHeader>
        <CCardBody>
          <div className="table-responsive">
            <CTable align="middle" className="mb-0 border" hover responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Nombre</CTableHeaderCell>
                  <CTableHeaderCell>Año</CTableHeaderCell>
                  <CTableHeaderCell>Estado</CTableHeaderCell>
                  <CTableHeaderCell>Promedio</CTableHeaderCell>
                  <CTableHeaderCell>Asistencia</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {currentStudents.map((student, index) => (
                  <CTableRow key={index}>
                    <CTableDataCell>{student.name ?? "-"}</CTableDataCell>
                    <CTableDataCell>{student.year ?? "-"}</CTableDataCell>
                    <CTableDataCell>
                      <span
                        className={
                          student.status === "Aprobado"
                            ? "badge bg-success"
                            : "badge bg-danger"
                        }
                      >
                        {student.status ?? "-"}
                      </span>
                    </CTableDataCell>
                    <CTableDataCell>{student.average ?? "-"}</CTableDataCell>
                    <CTableDataCell>{student.attendance ?? "-"}</CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          </div>
          {/* Paginación */}
          <div className="d-flex justify-content-center mt-3">
            <nav>
              <ul className="pagination mb-0">
                <li
                  className={`page-item${
                    currentPage === 1 ? " disabled" : ""
                  }`}
                >
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Anterior
                  </button>
                </li>
                <li className="page-item disabled">
                  <span
                    className="page-link"
                    style={{
                      minWidth: 80,
                      textAlign: "center",
                    }}
                  >
                    Página {currentPage} de {totalPages}
                  </span>
                </li>
                <li
                  className={`page-item${
                    currentPage === totalPages ? " disabled" : ""
                  }`}
                >
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Siguiente
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </CCardBody>
      </CCard>

      {/* Apartado de métricas interesantes */}
      <CCard className="mb-4 shadow-sm border-0">
        <CCardHeader className="bg-white">
          <h4 className="mb-0 text-center" style={{ color: "#1976d2" }}>
            Métricas Destacadas
          </h4>
        </CCardHeader>
        <CCardBody>
          <CRow className="g-3 justify-content-center">
            <CCol xs={12} sm={6} lg={4}>
              <CCard className="text-center shadow-sm border-0 h-100">
                <CCardBody>
                  <div
                    className="d-flex justify-content-center align-items-center mb-2"
                    style={{ minHeight: 40 }}
                  >
                    <CIcon icon={cilStar} size="xl" style={{ color: "#1976d2" }} />
                  </div>
                  <h5 className="fw-bold mb-1">{bestMetrics?.bestYear ?? "-"}</h5>
                  <div className="text-muted mb-1">Año con Mejor Promedio</div>
                  <small className="text-primary">¡Felicidades a este año!</small>
                </CCardBody>
              </CCard>
            </CCol>
            <CCol xs={12} sm={6} lg={4}>
              <CCard className="text-center shadow-sm border-0 h-100">
                <CCardBody>
                  <div
                    className="d-flex justify-content-center align-items-center mb-2"
                    style={{ minHeight: 40 }}
                  >
                    <CIcon icon={cilUser} size="xl" style={{ color: "#388e3c" }} />
                  </div>
                  <h5 className="fw-bold mb-1">
                    {bestMetrics?.bestStudent?.name ?? "-"}
                  </h5>
                  <div className="text-muted mb-1">Mejor Estudiante</div>
                  <small className="text-success">¡Un ejemplo a seguir!</small>
                </CCardBody>
              </CCard>
            </CCol>
            <CCol xs={12} sm={6} lg={4}>
              <CCard className="text-center shadow-sm border-0 h-100">
                <CCardBody>
                  <div
                    className="d-flex justify-content-center align-items-center mb-2"
                    style={{ minHeight: 40 }}
                  >
                    <CIcon icon={cilChartPie} size="xl" style={{ color: "#f39c12" }} />
                  </div>
                  <h5 className="fw-bold mb-1">
                    {bestMetrics?.highestPassRateYear ?? "-"}
                  </h5>
                  <div className="text-muted mb-1">Año con Mayor Tasa de Aprobación</div>
                  <small className="text-warning">¡Gran trabajo en equipo!</small>
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>
    </div>
  );
};

export default GestorDashboard;