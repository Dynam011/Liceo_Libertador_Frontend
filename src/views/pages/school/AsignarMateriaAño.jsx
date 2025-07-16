// CRUD integrado
import { useState, useEffect } from "react";
import {
  CContainer,
  CRow,
  CCol,
  CCard,
  CCardHeader,
  CCardBody,
  CCardTitle,
  CForm,
  CFormLabel,
  CFormSelect,
  CButton,
  CAlert,
  CFormInput,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
} from "@coreui/react";
import {apiUrl} from "../../../api"
// CRUD integrado

function CrudAsignacionesAnioMateria() {
  const [asignaciones, setAsignaciones] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [pagina, setPagina] = useState(1);
  const porPagina = 5;

  useEffect(() => {
    fetch('http://localhost:4000/asignaciones-anio-materia')
      .then(r => r.json())
      .then(data => setAsignaciones(Array.isArray(data) ? data : (data.asignaciones || [])));
  }, []);

  const handleDelete = async (id) => {
    await fetch(apiUrl+`/asignaciones-anio-materia/${id}`, { method: 'DELETE' });
    setAsignaciones(asignaciones.filter(a => a.id_año_materia !== id));
    setMensaje("Asignación eliminada");
    setTimeout(() => setMensaje(""), 2000);
  };

  // Paginación
  const totalPaginas = Math.ceil(asignaciones.length / porPagina);
  const asignacionesPaginadas = asignaciones.slice((pagina - 1) * porPagina, pagina * porPagina);

  return (
    <CCard className="shadow-sm mb-4">
      <CCardHeader style={{ backgroundColor: "#114c5f", color: "white" }}>
        <CCardTitle>Asignaciones Año-Materia</CCardTitle>
      </CCardHeader>
      <CCardBody>
        {mensaje && (
          <CAlert color={mensaje.toLowerCase().includes("error") ? "danger" : "success"} dismissible onClose={() => setMensaje("")}>{mensaje}</CAlert>
        )}
        <CTable bordered responsive style={{textAlign: 'center'}}>
          <CTableHead>
            <CTableRow style={{ background: '#e0f7fa' }}>
              <CTableHeaderCell>Código Materia</CTableHeaderCell>
              <CTableHeaderCell>Nombre Materia</CTableHeaderCell>
              <CTableHeaderCell>Año</CTableHeaderCell>
              <CTableHeaderCell>Nombre Año</CTableHeaderCell>
              <CTableHeaderCell>Acciones</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {asignacionesPaginadas.map(a => (
              <CTableRow key={a.id_año_materia}>
                <CTableDataCell>{a.codigo_materia}</CTableDataCell>
                <CTableDataCell>{a.nombre_materia}</CTableDataCell>
                <CTableDataCell>{a.id_año}</CTableDataCell>
                <CTableDataCell>{a.nombre_año}</CTableDataCell>
                <CTableDataCell>
                  <CButton color="danger" size="sm" onClick={() => handleDelete(a.id_año_materia)}>🗑️</CButton>
                </CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>
        {/* Paginación */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16, gap: 8 }}>
          <CButton color="secondary" disabled={pagina === 1} onClick={() => setPagina(pagina - 1)}>
            Anterior
          </CButton>
          <span style={{ alignSelf: 'center' }}>Página {pagina} de {totalPaginas}</span>
          <CButton color="secondary" disabled={pagina === totalPaginas || totalPaginas === 0} onClick={() => setPagina(pagina + 1)}>
            Siguiente
          </CButton>
        </div>
      </CCardBody>
    </CCard>
  );
}
const AsignarMateria = () => {
  const [materias, setMaterias] = useState([]);
  const [anios, setAnios] = useState([]);
  const [codigoMateriaSeleccionada, setCodigoMateriaSeleccionada] = useState("");
  const [idAnioSeleccionado, setIdAnioSeleccionado] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [filtroMateria, setFiltroMateria] = useState(""); // Nuevo estado
  // Obtener usuario y rol
  const usuarioGuardado = localStorage.getItem("usuario");
  const usuario = usuarioGuardado ? JSON.parse(usuarioGuardado) : null;

  useEffect(() => {
    obtenerMateriasYAnios();
  }, []);

  const obtenerMateriasYAnios = async () => {
    try {
      const resMaterias = await fetch(apiUrl+"/materias");
      const dataMaterias = await resMaterias.json();
      setMaterias(dataMaterias.materias || []);

      const resAnios = await fetch(apiUrl+"/anios");
      const dataAnios = await resAnios.json();
      setAnios(dataAnios.anios || []);
    } catch (error) {
      console.error("Error obteniendo datos:", error);
    }
  };

  const handleAsignar = async (e) => {
    e.preventDefault();

    if (!codigoMateriaSeleccionada || !idAnioSeleccionado) {
      setMensaje("Selecciona una materia y un año.");
      setTimeout(() => setMensaje(""), 2500);
      return;
    }

    try {
      const res = await fetch(apiUrl+"/asignar-seccion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          codigo_materia: codigoMateriaSeleccionada,
          id_año: idAnioSeleccionado
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMensaje("Materia asignada correctamente.");
        setCodigoMateriaSeleccionada("");
        setIdAnioSeleccionado("");
      } else {
        setMensaje(`Error: ${data.mensaje}`);
      }
      setTimeout(() => setMensaje(""), 2500); // Cierra el mensaje automáticamente
    } catch (error) {
      setMensaje("Error en la conexión con el servidor.");
      setTimeout(() => setMensaje(""), 2500);
    }
  };

  // Función para normalizar y eliminar acentos
  const normalizar = (texto) =>
    texto
      ? texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
      : "";

  // Filtrado de materias por nombre o código, insensible a acentos
  const materiasFiltradas = materias.filter(m =>
    normalizar(m.nombre).includes(normalizar(filtroMateria)) ||
    normalizar(m.codigo_materia).includes(normalizar(filtroMateria))
  );

  return (
    <CContainer className="pt-2 pb-4 mb-5">
      <CRow className="justify-content-center">
        <CCol xs={12} md={8} lg={6}>
          <CCard className="shadow-sm mb-4">
            <CCardHeader style={{ backgroundColor: "#114c5f", color: "white" }}>
              <CCardTitle>Asignar Materia a Año</CCardTitle>
            </CCardHeader>
            <CCardBody>
              {mensaje && (
                <CAlert
                  color={mensaje.toLowerCase().includes("error") ? "danger" : "success"}
                  dismissible
                  onClose={() => setMensaje("")}
                >
                  {mensaje}
                </CAlert>
              )}
              {usuario?.rol === "admin" ? (
                <CForm onSubmit={handleAsignar}>
                  <CRow className="g-3 align-items-end">
                    <CCol md={12}>
                      <CFormLabel>Buscar materia por nombre o código</CFormLabel>
                      <CFormInput
                        type="text"
                        placeholder="Ej: Matemática o MAT101"
                        value={filtroMateria}
                        onChange={e => setFiltroMateria(e.target.value)}
                        className="mb-2"
                      />
                      <CFormLabel>Materia</CFormLabel>
                      <CFormSelect
                        value={codigoMateriaSeleccionada}
                        onChange={(e) => setCodigoMateriaSeleccionada(e.target.value)}
                        required
                      >
                        <option value="">Selecciona una materia</option>
                        {materiasFiltradas.map((materia) => (
                          <option key={materia.codigo_materia} value={materia.codigo_materia}>
                            {materia.codigo_materia} - {materia.nombre}
                          </option>
                        ))}
                      </CFormSelect>
                    </CCol>
                    <CCol md={12}>
                      <CFormLabel>Año</CFormLabel>
                      <CFormSelect
                        value={idAnioSeleccionado}
                        onChange={(e) => setIdAnioSeleccionado(e.target.value)}
                        required
                      >
                        <option value="">Selecciona un año</option>
                        {anios.map((anio) => (
                          <option key={anio.id_año} value={anio.id_año}>
                            {anio.nombre_año}
                          </option>
                        ))}
                      </CFormSelect>
                    </CCol>
                    <CCol md={12} className="d-grid mt-3">
                      <CButton color="" type="submit" size="lg" style={{ backgroundColor: '#9cd2d3', color: '#114c5f'}}>
                        Asignar Materia
                      </CButton>
                    </CCol>
                  </CRow>
                </CForm>
              ) : (
                <CAlert color="warning" className="mb-0">
                  Solo los administradores pueden asignar materias a años.
                </CAlert>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
      {/* CRUD de asignaciones año-materia usando componente importado */}
      <CRow className="justify-content-center">
        <CCol xs={12} md={10} lg={8}>
          <CrudAsignacionesAnioMateria />
        </CCol>
      </CRow>
      <div style={{ minHeight: 120 }} />
    </CContainer>
  );
}

export default AsignarMateria;