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
} from "@coreui/react";
import {apiUrl} from "../../../api"
const AsignarMaterias = () => {
  // Función para normalizar y eliminar acentos correctamente, insensible a mayúsculas/minúsculas
  const normalizar = (texto) =>
    texto
      ? texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
      : "";
  const [docentes, setDocentes] = useState([]);
  const [añosMateria, setAñosMateria] = useState([]);
  const [secciones, setSecciones] = useState([]);
  const [añosEscolares, setAñosEscolares] = useState([]);
  const [idDocenteSeleccionado, setIdDocenteSeleccionado] = useState("");
  const [idAñoMateriaSeleccionado, setIdAñoMateriaSeleccionado] = useState("");
  const [idSeccionSeleccionada, setIdSeccionSeleccionada] = useState([]);
  const [idAñoEscolarSeleccionado, setIdAñoEscolarSeleccionado] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [busquedaDocente, setBusquedaDocente] = useState(""); // Nuevo estado para búsqueda de docente
  const [busquedaMateria, setBusquedaMateria] = useState("");
  const [busquedaSeccion, setBusquedaSeccion] = useState("");

  // Obtener usuario y rol
  const usuarioGuardado = localStorage.getItem("usuario");
  const usuario = usuarioGuardado ? JSON.parse(usuarioGuardado) : null;

  useEffect(() => {
    obtenerDatosParaAsignar();
  }, []);

  const obtenerDatosParaAsignar = async () => {
    try {
      const res = await fetch(apiUrl+"/asignar-materias");
      const data = await res.json();
      setDocentes(data.docentes || []);
      setAñosMateria(data.añosMateria || []);
      setSecciones(data.secciones || []);
      setAñosEscolares(data.añosEscolares || []);
    } catch (error) {
      console.error("Error obteniendo datos:", error);
    }
  };

  const handleAsignar = async (e) => {
    e.preventDefault();

    if (
      !idDocenteSeleccionado ||
      !idAñoMateriaSeleccionado ||
      !idSeccionSeleccionada.length ||
      !idAñoEscolarSeleccionado
    ) {
      setMensaje("Selecciona todos los campos antes de asignar.");
      setTimeout(() => setMensaje(""), 2500);
      return;
    }

    try {
      const res = await fetch(apiUrl+"/asignar-docente", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          id_docente: idDocenteSeleccionado,
          id_año_materia: idAñoMateriaSeleccionado,
          id_secciones: idSeccionSeleccionada,
          fk_año_escolar: idAñoEscolarSeleccionado,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMensaje("Materias asignadas correctamente.");
        setIdDocenteSeleccionado("");
        setIdAñoMateriaSeleccionado("");
        setIdSeccionSeleccionada([]);
        setIdAñoEscolarSeleccionado("");
      } else {
        setMensaje(`Error: ${data.mensaje}`);
      }
      setTimeout(() => setMensaje(""), 2500);
    } catch (error) {
      console.error("Error asignando materias:", error);
      setMensaje("Error en la conexión con el servidor.");
      setTimeout(() => setMensaje(""), 2500);
    }
  };

  // Filtrar docentes por nombre o cédula
  const docentesFiltrados = docentes.filter((docente) =>
    normalizar(`${docente.nombre} ${docente.cedula}`).includes(normalizar(busquedaDocente))
  );

  // Filtrar materias según la búsqueda
  const materiasFiltradas = añosMateria.filter((materia) =>
    normalizar(`${materia.codigo_materia} ${materia.nombre_materia} ${materia.nombre_año}`).includes(normalizar(busquedaMateria))
  );

  // Filtrar secciones según la búsqueda por año
  const seccionesFiltradas = secciones.filter((seccion) =>
    normalizar(seccion.nombre_año).includes(normalizar(busquedaSeccion))
  );

  return (
    <CContainer className="py-4">
      <CRow className="justify-content-center">
        <CCol xs={12} md={10} lg={8}>
          <CCard className="shadow-sm">
            <CCardHeader className="" style={{ backgroundColor: "#114c5f", color: "white" }}>
              <CCardTitle>Asignar Materias a Docentes</CCardTitle>
            </CCardHeader>
            <CCardBody>
              {usuario?.rol === "admin" ? (
                <>
                  {mensaje && (
                    <CAlert
                      color={mensaje.toLowerCase().includes("error") ? "danger" : "success"}
                      dismissible
                      onClose={() => setMensaje("")}
                    >
                      {mensaje}
                    </CAlert>
                  )}
                  <CForm onSubmit={handleAsignar}>
                    <CRow className="g-3 align-items-end">
                      <CCol md={6}>
                        <CFormLabel>Buscar docente por nombre o cédula</CFormLabel>
                        <CFormInput
                          type="text"
                          placeholder="Ej: Juan o 12345678"
                          className="mb-2"
                          value={busquedaDocente}
                          onChange={e => setBusquedaDocente(e.target.value)}
                        />
                        <CFormLabel>Docente</CFormLabel>
                        <CFormSelect
                          value={idDocenteSeleccionado}
                          onChange={(e) => setIdDocenteSeleccionado(e.target.value)}
                          required
                        >
                          <option value="">Seleccione un docente</option>
                          {docentesFiltrados.map((docente) => (
                            <option key={docente.id_docente} value={docente.id_docente}>
                              Nombre: {docente.nombre}  Cedula: {docente.cedula}
                            </option>
                          ))}
                        </CFormSelect>
                      </CCol>
                      <CCol md={6}>
                        <CFormLabel>Materia</CFormLabel>
                        <CFormInput
                          type="text"
                          className="mb-2"
                          placeholder="Buscar materia por código, nombre o año..."
                          value={busquedaMateria}
                          onChange={(e) => setBusquedaMateria(e.target.value)}
                        />
                        <CFormSelect
                          value={idAñoMateriaSeleccionado}
                          onChange={(e) => setIdAñoMateriaSeleccionado(e.target.value)}
                          required
                        >
                          <option value="">Seleccione una materia</option>
                          {materiasFiltradas.map((materia) => (
                            <option
                              key={materia.id_año_materia}
                              value={materia.id_año_materia}
                            >
                              Codigo: {materia.codigo_materia} Nombre: {materia.nombre_materia} Año: {materia.nombre_año}
                            </option>
                          ))}
                        </CFormSelect>
                      </CCol>
                      <CCol md={6}>
                        <CFormLabel>Sección</CFormLabel>
                        {/* Barra de búsqueda para filtrar sección por año */}
                        <input
                          type="text"
                          className="form-control mb-2"
                          placeholder="Buscar sección por año..."
                          value={busquedaSeccion}
                          onChange={(e) => setBusquedaSeccion(e.target.value)}
                        />
                        <div
                          style={{
                            border: "1px solid #ced4da",
                            borderRadius: 4,
                            padding: 8,
                            maxHeight: 180,
                            overflowY: "auto",
                            background: "#f8f9fa"
                          }}
                        >
                          {seccionesFiltradas.length === 0 && (
                            <div className="text-muted">No hay secciones para mostrar</div>
                          )}
                          {seccionesFiltradas.map((seccion) => (
                            <div key={seccion.id_seccion} className="form-check">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id={`seccion-${seccion.id_seccion}`}
                                value={seccion.id_seccion}
                                checked={idSeccionSeleccionada.includes(seccion.id_seccion)}
                                onChange={e => {
                                  if (e.target.checked) {
                                    setIdSeccionSeleccionada([...idSeccionSeleccionada, seccion.id_seccion]);
                                  } else {
                                    setIdSeccionSeleccionada(idSeccionSeleccionada.filter(id => id !== seccion.id_seccion));
                                  }
                                }}
                              />
                              <label className="form-check-label" htmlFor={`seccion-${seccion.id_seccion}`}>
                                {seccion.nombre_seccion} - {seccion.nombre_año}
                              </label>
                            </div>
                          ))}
                        </div>
                      </CCol>
                      <CCol md={6}>
                        <CFormLabel>Año Escolar</CFormLabel>
                        <CFormSelect
                          value={idAñoEscolarSeleccionado}
                          onChange={(e) => setIdAñoEscolarSeleccionado(e.target.value)}
                          required
                        >
                          <option value="">Seleccione año escolar</option>
                          {añosEscolares.map((a) => (
                            <option key={a.id_año_escolar} value={a.id_año_escolar}>
                              {a.nombre}
                            </option>
                          ))}
                        </CFormSelect>
                      </CCol>
                      <CCol md={12} className="d-grid mt-3">
                        <CButton color="" type="submit" size="lg" style={{ backgroundColor: '#9cd2d3', color: '#114c5f'}}>
                          Asignar Materias
                        </CButton>
                      </CCol>
                    </CRow>
                  </CForm>
                </>
              ) : (
                <CAlert color="warning" className="mb-0">
                  Solo los administradores pueden asignar materias a docentes.
                </CAlert>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  );
};

export default AsignarMaterias;