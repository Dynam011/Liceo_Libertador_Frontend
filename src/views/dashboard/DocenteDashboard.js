import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CContainer,
  CRow,
  CCol,
  CCard,
  CCardBody,
  CCardHeader,
  CCardTitle,
  CButton,
  CAlert,
  CPagination,
  CPaginationItem,
} from "@coreui/react";
import { CChartBar } from '@coreui/react-chartjs';
import {apiUrl} from "../../api"
const Dashboard = () => {
  const navigate = useNavigate();
  const [materias, setMaterias] = useState([]);
  const [usuario, setUsuario] = useState(null);
  const [estadisticas, setEstadisticas] = useState(null);

  // NUEVO: Estados para filtro y paginación
  const [aniosEscolares, setAniosEscolares] = useState([]);
  const [anioSeleccionado, setAnioSeleccionado] = useState("");
  const [pagina, setPagina] = useState(1);
  const porPagina = 6; // Cambia según cuántas tarjetas quieras por página

  // Cargar usuario
  useEffect(() => {
    const usuarioGuardado = localStorage.getItem("usuario");
    if (usuarioGuardado) {
      setUsuario(JSON.parse(usuarioGuardado));
    } else {
      navigate("/login");
    }
  }, [navigate]);

  // Cargar materias asignadas
  useEffect(() => {
    const obtenerMaterias = async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(apiUrl+"/recibir", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) return;
      const data = await res.json();
      setMaterias(Array.isArray(data.asignaciones) ? data.asignaciones : []);
      // NUEVO: Extraer y ordenar años escolares
      const anios = [...new Set((data.asignaciones || []).map(m => m.año_escolar))]
        .filter(Boolean)
        .sort((a, b) => b.localeCompare(a)); // Orden descendente
      setAniosEscolares(anios);
      setAnioSeleccionado(anios[0] || "");
    };
    obtenerMaterias();
  }, []);

  // Cargar estadísticas para admin
  useEffect(() => {
    if (usuario?.rol === "admin") {
      fetch(apiUrl+"/dashboardd")
        .then(res => res.json())
        .then(data => setEstadisticas(data));
    }
  }, [usuario]);

  // Filtrar materias por año escolar seleccionado
  const materiasFiltradas = materias.filter(m => m.año_escolar === anioSeleccionado);

  // Paginación
  const totalPaginas = Math.ceil(materiasFiltradas.length / porPagina);
  const materiasPagina = materiasFiltradas.slice((pagina - 1) * porPagina, pagina * porPagina);

  // Reiniciar página al cambiar año escolar
  useEffect(() => { setPagina(1); }, [anioSeleccionado]);

  // Estadísticas para docente
  const totalMaterias = materias.length;
  const secciones = [...new Set(materias.map(m => m.seccion))];
  const años = [...new Set(materias.map(m => m.año))];
  const añosEscolares = [...new Set(materias.map(m => m.año_escolar))];

  return (
    <CContainer className="py-4">
      <CRow className="justify-content-center mb-4">
        <CCol xs={12} md={10} lg={8}>
          <CCard className="shadow-sm border-0" style={{ background: "#eaf6f6" }}>
            <CCardBody>
              <h2 className="fw-bold mb-2" style={{ color: "#114c5f" }}>
                ¡Bienvenido, Profesor(a) {usuario?.usuario}!
              </h2>
              <p className="mb-0" style={{ fontSize: "1.1rem", color: "#444" }}>
                Este es tu panel personal donde puedes visualizar tus materias asignadas, secciones, años escolares y un resumen de tu actividad docente. 
                Utiliza este espacio para mantenerte al día con tus asignaciones y estadísticas relevantes.
              </p>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <CRow className="mb-4">
        {usuario?.rol === "admin" ? (
          <CCol xs={12}>
            {/* Panel administrativo (igual que antes) */}
            <CCard className="shadow-sm mb-4">
              <CCardHeader style={{ backgroundColor: "#09515f", color: "white" }}>
                <CCardTitle className="mb-0">
                  Panel Administrativo
                </CCardTitle>
              </CCardHeader>
              <CCardBody>
                {estadisticas ? (
                  <>
                    <CRow className="g-3 mb-4">
                      <CCol xs={12} md={3}>
                        <CCard className="border-0 shadow-sm text-center">
                          <CCardBody>
                            <h6 className="fw-bold" style={{ color: "#1d63dd" }}>Estudiantes</h6>
                            <div style={{ fontSize: "2.2rem" }}>👨‍🎓 {estadisticas.totalEstudiantes}</div>
                          </CCardBody>
                        </CCard>
                      </CCol>
                      <CCol xs={12} md={3}>
                        <CCard className="border-0 shadow-sm text-center">
                          <CCardBody>
                            <h6 className="fw-bold" style={{ color: "#1d63dd" }}>Docentes</h6>
                            <div style={{ fontSize: "2.2rem" }}>👩‍🏫 {estadisticas.totalDocentes}</div>
                          </CCardBody>
                        </CCard>
                      </CCol>
                      <CCol xs={12} md={3}>
                        <CCard className="border-0 shadow-sm text-center">
                          <CCardBody>
                            <h6 className="fw-bold" style={{ color: "#1d63dd" }}>Materias</h6>
                            <div style={{ fontSize: "2.2rem" }}>📚 {estadisticas.totalMaterias}</div>
                          </CCardBody>
                        </CCard>
                      </CCol>
                      <CCol xs={12} md={3}>
                        <CCard className="border-0 shadow-sm text-center">
                          <CCardBody>
                            <h6 className="fw-bold" style={{ color: "#1d63dd" }}>Inscripciones</h6>
                            <div style={{ fontSize: "2.2rem" }}>📝 {estadisticas.totalInscripciones}</div>
                          </CCardBody>
                        </CCard>
                      </CCol>
                    </CRow>
                    <CCard className="mb-4">
                      <CCardHeader style={{ backgroundColor: "#eaf6f6" }}>
                        <strong>Estudiantes por Año</strong>
                      </CCardHeader>
                      <CCardBody>
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
                      </CCardBody>
                    </CCard>
                  </>
                ) : (
                  <div>Cargando estadísticas...</div>
                )}
              </CCardBody>
            </CCard>
          </CCol>
        ) : (
          <>
            {/* Estadísticas rápidas para docente */}
            <CCol xs={12} md={3}>
              <CCard className="border-0 shadow-sm text-center" style={{ background: "#fffbe6" }}>
                <CCardBody>
                  <h6 className="fw-bold" style={{ color: "#e67e22" }}>Materias Asignadas</h6>
                  <div style={{ fontSize: "2.2rem" }}>📚 {totalMaterias}</div>
                </CCardBody>
              </CCard>
            </CCol>
            <CCol xs={12} md={3}>
              <CCard className="border-0 shadow-sm text-center" style={{ background: "#eaf6f6" }}>
                <CCardBody>
                  <h6 className="fw-bold" style={{ color: "#16a085" }}>Secciones</h6>
                  <div style={{ fontSize: "2.2rem" }}>🏷️ {secciones.length}</div>
                </CCardBody>
              </CCard>
            </CCol>
            <CCol xs={12} md={3}>
              <CCard className="border-0 shadow-sm text-center" style={{ background: "#f6eaf6" }}>
                <CCardBody>
                  <h6 className="fw-bold" style={{ color: "#8e44ad" }}>Años</h6>
                  <div style={{ fontSize: "2.2rem" }}>📅 {años.length}</div>
                </CCardBody>
              </CCard>
            </CCol>
            <CCol xs={12} md={3}>
              <CCard className="border-0 shadow-sm text-center" style={{ background: "#eaf6ff" }}>
                <CCardBody>
                  <h6 className="fw-bold" style={{ color: "#1d63dd" }}>Años Escolares</h6>
                  <div style={{ fontSize: "2.2rem" }}>🗓️ {añosEscolares.length}</div>
                </CCardBody>
              </CCard>
            </CCol>
          </>
        )}
      </CRow>

      {/* Materias asignadas */}
      {usuario?.rol !== "admin" && (
        <CCard className="shadow-sm mb-4">
          <CCardHeader style={{ backgroundColor: "#09515f", color: "white" }}>
            <CCardTitle className="mb-0">
              Tus Materias Asignadas
            </CCardTitle>
          </CCardHeader>
          <CCardBody>
            {/* NUEVO: Filtro por año escolar */}
            {aniosEscolares.length > 0 && (
              <div className="mb-3" style={{ maxWidth: 300 }}>
                <label className="fw-bold mb-1">Año Escolar:</label>
                <select
                  className="form-select"
                  value={anioSeleccionado}
                  onChange={e => setAnioSeleccionado(e.target.value)}
                >
                  {aniosEscolares.map(anio => (
                    <option key={anio} value={anio}>{anio}</option>
                  ))}
                </select>
              </div>
            )}

            {materiasFiltradas.length === 0 ? (
              <CAlert color="info" className="text-center mb-0">
                No tienes materias asignadas para este año escolar.
              </CAlert>
            ) : (
              <>
                <CRow className="g-3">
                  {materiasPagina.map((materia, index) => (
                    <CCol xs={12} md={6} lg={4} key={index}>
                      <CCard className="h-100 border-0 shadow-sm">
                        <CCardBody>
                          <h5 className="fw-bold mb-2" style={{ color: "#9f3b06" }}>
                            {materia.materia}
                          </h5>
                          <div>
                            <strong>Sección:</strong> {materia.seccion}
                          </div>
                          <div>
                            <strong>Año:</strong> {materia.año}
                          </div>
                          <div>
                            <strong>Año Escolar:</strong> {materia.año_escolar}
                          </div>
                        </CCardBody>
                      </CCard>
                    </CCol>
                  ))}
                </CRow>
                {/* NUEVO: Paginación */}
                {totalPaginas > 1 && (
                  <div className="d-flex justify-content-center mt-4">
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
              </>
            )}
          </CCardBody>
        </CCard>
      )}
    </CContainer>
  );
};

export default Dashboard;