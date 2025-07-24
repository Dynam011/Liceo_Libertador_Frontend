import { useState, useEffect } from "react";
import {
  CContainer,
  CRow,
  CCol,
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
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
} from "@coreui/react";
import { apiUrl } from "../../../api";
 const token = localStorage.getItem("token");
// CRUD Asignaciones Año-Materia
function CrudAsignacionesAnioMateria() {
  const [asignaciones, setAsignaciones] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [pagina, setPagina] = useState(1);
  const porPagina = 5;

  // Modal para eliminar asignación
  const [modalEliminar, setModalEliminar] = useState(false);
  const [idEliminar, setIdEliminar] = useState(null);

  useEffect(() => {
   
    fetch(apiUrl + '/asignaciones-anio-materia', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(r => r.json())
      .then(data => setAsignaciones(Array.isArray(data) ? data : (data.asignaciones || [])));
  }, []);

  const handleDelete = (id) => {
    setIdEliminar(id);
    setModalEliminar(true);
  };

  const confirmarEliminar = async () => {
    await fetch(apiUrl + `/asignaciones-anio-materia/${idEliminar}`, { 
      headers: {
        'Authorization': `Bearer ${token}`
      },
      method: 'DELETE' });
    setAsignaciones(asignaciones.filter(a => a.id_año_materia !== idEliminar));
    setMensaje("Asignación eliminada");
    setTimeout(() => setMensaje(""), 2000);
    setModalEliminar(false);
    setIdEliminar(null);
  };

  // Paginación
  const totalPaginas = Math.ceil(asignaciones.length / porPagina);
  const asignacionesPaginadas = asignaciones.slice((pagina - 1) * porPagina, pagina * porPagina);

  return (
    <div>
      {mensaje && (
        <CAlert color={mensaje.toLowerCase().includes("error") ? "danger" : "success"} dismissible onClose={() => setMensaje("")}>
          {mensaje}
        </CAlert>
      )}
      <CTable bordered responsive style={{ textAlign: 'center' }}>
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
                <CButton color="danger" size="sm" onClick={() => handleDelete(a.id_año_materia)}>
                  🗑️
                </CButton>
              </CTableDataCell>
            </CTableRow>
          ))}
        </CTableBody>
      </CTable>
      {/* Paginación */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16, gap: 8 }}>
        <CButton color="secondary" size="sm" disabled={pagina === 1} onClick={() => setPagina(pagina - 1)}>
          Anterior
        </CButton>
        <span style={{ alignSelf: 'center', fontSize: 14 }}>Página {pagina} de {totalPaginas}</span>
        <CButton color="secondary" size="sm" disabled={pagina === totalPaginas || totalPaginas === 0} onClick={() => setPagina(pagina + 1)}>
          Siguiente
        </CButton>
      </div>
      {/* Modal Eliminar Asignación */}
      <CModal visible={modalEliminar} onClose={() => setModalEliminar(false)} alignment="center" backdrop="static" size="sm">
        <CModalHeader className="bg-danger" style={{ borderRadius: 8 }}>
          <CModalTitle className="text-white fs-6">Eliminar Asignación</CModalTitle>
        </CModalHeader>
        <CModalBody style={{ background: "#fff5f5" }}>
          ¿Seguro que desea eliminar esta asignación?
        </CModalBody>
        <CModalFooter>
          <CButton color="danger" size="sm" shape="rounded-pill" className="fw-bold" onClick={confirmarEliminar}>
            Eliminar
          </CButton>
          <CButton color="secondary" size="sm" shape="rounded-pill" onClick={() => setModalEliminar(false)}>
            Cancelar
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  );
}

// Modal para crear asignación
function ModalCrearAsignacion({ visible, onClose, materias, anios, onAsignar }) {
  const [codigoMateriaSeleccionada, setCodigoMateriaSeleccionada] = useState("");
  const [idAnioSeleccionado, setIdAnioSeleccionado] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [filtroMateria, setFiltroMateria] = useState("");

  // Filtrado de materias por nombre o código, insensible a acentos
  const normalizar = (texto) =>
    texto
      ? texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
      : "";

  const materiasFiltradas = materias.filter(m =>
    normalizar(m.nombre).includes(normalizar(filtroMateria)) ||
    normalizar(m.codigo_materia).includes(normalizar(filtroMateria))
  );

  const handleAsignar = async (e) => {
    e.preventDefault();
    if (!codigoMateriaSeleccionada || !idAnioSeleccionado) {
      setMensaje("Selecciona una materia y un año.");
      setTimeout(() => setMensaje(""), 2500);
      return;
    }
    await onAsignar(codigoMateriaSeleccionada, idAnioSeleccionado, setMensaje, setCodigoMateriaSeleccionada, setIdAnioSeleccionado);
  };

  return (
    <CModal visible={visible} onClose={onClose} size="md" alignment="center" backdrop="static">
      <CModalHeader className="bg-info" style={{ borderRadius: 8 }}>
        <CModalTitle className="text-white fs-6">Asignar Materia a Año</CModalTitle>
      </CModalHeader>
      <CModalBody>
        {mensaje && (
          <CAlert color={mensaje.toLowerCase().includes("error") ? "danger" : "success"} dismissible onClose={() => setMensaje("")}>
            {mensaje}
          </CAlert>
        )}
        <CForm onSubmit={handleAsignar}>
          <CFormLabel>Buscar materia por nombre o código</CFormLabel>
          <CFormInput
            type="text"
            size="sm"
            placeholder="Ej: Matemática o MAT101"
            value={filtroMateria}
            onChange={e => setFiltroMateria(e.target.value)}
            className="mb-2"
          />
          <CFormLabel>Materia</CFormLabel>
          <CFormSelect
            size="sm"
            value={codigoMateriaSeleccionada}
            onChange={(e) => setCodigoMateriaSeleccionada(e.target.value)}
            required
            className="mb-2"
          >
            <option value="">Selecciona una materia</option>
            {materiasFiltradas.map((materia) => (
              <option key={materia.codigo_materia} value={materia.codigo_materia}>
                {materia.codigo_materia} - {materia.nombre}
              </option>
            ))}
          </CFormSelect>
          <CFormLabel>Año</CFormLabel>
          <CFormSelect
            size="sm"
            value={idAnioSeleccionado}
            onChange={(e) => setIdAnioSeleccionado(e.target.value)}
            required
            className="mb-2"
          >
            <option value="">Selecciona un año</option>
            {anios.map((anio) => (
              <option key={anio.id_año} value={anio.id_año}>
                {anio.nombre_año}
              </option>
            ))}
          </CFormSelect>
          <div className="d-flex justify-content-end mt-3">
            <CButton color="info" type="submit" size="sm" shape="rounded-pill">
              Asignar Materia
            </CButton>
          </div>
        </CForm>
      </CModalBody>
    </CModal>
  );
}

const AsignarMateria = () => {
  const [materias, setMaterias] = useState([]);
  const [anios, setAnios] = useState([]);
  const [modalCrear, setModalCrear] = useState(false);

  // Obtener usuario y rol
  const usuarioGuardado = localStorage.getItem("usuario");
  const usuario = usuarioGuardado ? JSON.parse(usuarioGuardado) : null;

  useEffect(() => {
    obtenerMateriasYAnios();
  }, []);

  const obtenerMateriasYAnios = async () => {
    try {
      const resMaterias = await fetch(apiUrl + "/materias",
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      const dataMaterias = await resMaterias.json();
      setMaterias(dataMaterias.materias || []);

      const resAnios = await fetch(apiUrl + "/anios",
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      const dataAnios = await resAnios.json();
      setAnios(dataAnios.anios || []);
    } catch (error) {
      console.error("Error obteniendo datos:", error);
    }
  };

  // Función de asignar materia a año, llamada desde el modal
  const handleAsignar = async (codigoMateria, idAnio, setMensaje, setCodigoMateriaSeleccionada, setIdAnioSeleccionado) => {
    try {
      const res = await fetch(apiUrl + "/asignar-seccion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          codigo_materia: codigoMateria,
          id_año: idAnio
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
      setTimeout(() => setMensaje(""), 2500);
    } catch (error) {
      setMensaje("Error en la conexión con el servidor.");
      setTimeout(() => setMensaje(""), 2500);
    }
  };

  return (
    <CContainer className="pt-2 pb-4 mb-5">
      

      {/* Modal para crear asignación */}
      <ModalCrearAsignacion
        visible={modalCrear}
        onClose={() => setModalCrear(false)}
        materias={materias}
        anios={anios}
        onAsignar={handleAsignar}
      />

      <CRow className="justify-content-center">
        <CCol xs={12} md={10} lg={8}>
          <CRow className="mb-2">
        <CCol xs={12} md={6} className="d-flex gap-2 align-items-center">
          {usuario?.rol === "admin" && (
            <CButton
              color="info"
              size="sm"
              style={{
                borderRadius: 10,
                fontWeight: "bold",
                fontSize: 15,
                minWidth: 140,
                background: "linear-gradient(95deg, #17b6ce 80%, #0bb5d4 100%)"
              }}
              onClick={() => setModalCrear(true)}
            >
              Asignar Materia a Año
            </CButton>
          )}
        </CCol>
      </CRow>
          <CrudAsignacionesAnioMateria />
        </CCol>
      </CRow>
      <div style={{ minHeight: 80 }} />
    </CContainer>
  );
};

export default AsignarMateria;