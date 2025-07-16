import { useState, useEffect } from "react";
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCardTitle,
  CForm,
  CFormLabel,
  CFormInput,
  CButton,
  CRow,
  CCol,
  CContainer,
  CAlert,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CPagination,
  CPaginationItem,
} from "@coreui/react";
import {apiUrl} from "../../../api"
const MateriaForm = () => {
  const [codigo_materia, setCodigoMateria] = useState("");
  const [nombre, setNombre] = useState("");
  const [materias, setMaterias] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [mensaje, setMensaje] = useState("");

  const [modalVisible, setModalVisible] = useState(false);
  const [materiaSeleccionada, setMateriaSeleccionada] = useState(null);
  const [nuevoCodigo, setNuevoCodigo] = useState("");
  const [nuevoNombre, setNuevoNombre] = useState("");

  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const materiasPorPagina = 5;

  const usuarioGuardado = localStorage.getItem("usuario");
  const usuario = usuarioGuardado ? JSON.parse(usuarioGuardado) : null;

  useEffect(() => {
    obtenerMaterias();
  }, []);

  const obtenerMaterias = async () => {
    try {
      const res = await fetch(apiUrl+"/materiasregistradas");
      const data = await res.json();
      setMaterias(data);
    } catch (error) {
      console.error("Error obteniendo materias:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!codigo_materia || !nombre) {
      setMensaje("El código y el nombre son obligatorios.");
      return;
    }

    try {
      const res = await fetch(apiUrl+"/materias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codigo_materia, nombre }),
      });

      const data = await res.json();
      if (res.ok) {
        setMensaje("Materia registrada exitosamente.");
        setCodigoMateria("");
        setNombre("");
        obtenerMaterias();
      } else {
        setMensaje(`Error: ${data.mensaje}`);
      }
    } catch (error) {
      console.error("Error al registrar materia:", error);
      setMensaje("Error en la conexión con el servidor.");
    }
  };

  const handleEditar = (materia) => {
    setMateriaSeleccionada(materia);
    setNuevoCodigo(materia.codigo_materia);
    setNuevoNombre(materia.nombre);
    setModalVisible(true);
  };

  const handleGuardarEdicion = async () => {
    if (!nuevoCodigo && !nuevoNombre) {
      setMensaje("Debes ingresar al menos un campo para actualizar.");
      return;
    }

    try {
      const res = await fetch(
        apiUrl+`/materias/${materiaSeleccionada.codigo_materia}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nuevo_codigo: nuevoCodigo || null,
            nombre: nuevoNombre || null,
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        setMensaje(`Error: ${data.mensaje}`);
        return;
      }

      obtenerMaterias();
      setModalVisible(false);
      setMensaje("Materia actualizada correctamente.");
    } catch (error) {
      console.error("Error editando materia:", error);
      setMensaje("Error al editar la materia.");
    }
  };

  const handleEliminar = async (codigo_materia) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta materia?")) return;

    try {
      await fetch(apiUrl+`/materias/${codigo_materia}`, {
        method: "DELETE",
      });
      obtenerMaterias();
      setMensaje("Materia eliminada correctamente.");
    } catch (error) {
      console.error("Error eliminando materia:", error);
      setMensaje("Error al eliminar la materia.");
    }
  };

  // Filtrado y paginación
  const materiasFiltradas = materias.filter((m) =>
    m.nombre.toLowerCase().includes(filtro.toLowerCase())
  );
  const totalPaginas = Math.ceil(materiasFiltradas.length / materiasPorPagina);
  const indiceInicial = (paginaActual - 1) * materiasPorPagina;
  const materiasPagina = materiasFiltradas.slice(
    indiceInicial,
    indiceInicial + materiasPorPagina
  );

  const cambiarPagina = (nuevaPagina) => {
    if (nuevaPagina < 1 || nuevaPagina > totalPaginas) return;
    setPaginaActual(nuevaPagina);
  };

  useEffect(() => {
    setPaginaActual(1); // Reinicia a la página 1 al filtrar
  }, [filtro]);

  return (
    <CContainer className="py-4">
      <CRow className="justify-content-center">
        <CCol xs={12} md={10} lg={8}>
          <CCard className="shadow-sm mb-4">
            <CCardHeader className="" style={{ backgroundColor: "#114c5f", color: "white" }}>
              <CCardTitle>Registrar Materia</CCardTitle>
            </CCardHeader>
            <CCardBody>
              {mensaje && (
                <CAlert
                  color={
                    mensaje.toLowerCase().includes("error") ? "danger" : "success"
                  }
                  dismissible
                  onClose={() => setMensaje("")}
                >
                  {mensaje}
                </CAlert>
              )}
              {usuario?.rol === "admin" ? (
                <CForm onSubmit={handleSubmit}>
                  <CRow className="g-3 align-items-end">
                    <CCol md={5}>
                      <CFormLabel>Código de Materia</CFormLabel>
                      <CFormInput
                        type="text"
                        value={codigo_materia}
                        placeholder="Ej: 01MAT - 01 PERTENECE AL AÑO "
                        onChange={(e) => setCodigoMateria(e.target.value)}
                        maxLength={15}
                        required
                      />
                    </CCol>
                    <CCol md={5}>
                      <CFormLabel>Nombre</CFormLabel>
                      <CFormInput
                        type="text"
                        value={nombre}
                        placeholder="Ejm Matemáticas"
                        onChange={(e) => setNombre(e.target.value)}
                        maxLength={40}
                        required
                      />
                    </CCol>
                    <CCol md={2}>
                      <CButton style={{ backgroundColor: '#9cd2d3', color: '#114c5f'}} type="submit" className="w-100">
                        Registrar
                      </CButton>
                    </CCol>
                  </CRow>
                </CForm>
              ) : (
                <CAlert color="warning" className="mb-0">
                  Solo los administradores pueden registrar materias.
                </CAlert>
              )}
            </CCardBody>
          </CCard>

          <CCard className="shadow-sm">
            <CCardHeader className="bg-secondary text-white">
              <CCardTitle>Materias Registradas</CCardTitle>
            </CCardHeader>
            <CCardBody>
              <CRow className="mb-3">
                <CCol md={6}>
                  <CFormInput
                    type="text"
                    placeholder="Filtrar por nombre..."
                    value={filtro}
                    onChange={(e) => setFiltro(e.target.value)}
                  />
                </CCol>
              </CRow>
              <CTable hover responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Código</CTableHeaderCell>
                    <CTableHeaderCell>Nombre</CTableHeaderCell>
                    {usuario?.rol === "admin" && (
                      <CTableHeaderCell>Acciones</CTableHeaderCell>
                    )}
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {materiasPagina.map((materia) => (
                    <CTableRow key={materia.codigo_materia}>
                      <CTableDataCell>{materia.codigo_materia}</CTableDataCell>
                      <CTableDataCell>{materia.nombre}</CTableDataCell>
                      {usuario?.rol === "admin" && (
                        <CTableDataCell>
                          <CButton
                            style={{ backgroundColor: 'white', color:'#114c5f', borderColor: '#114c5f'}}
                            size="sm"
                            className="me-2"
                            onClick={() => handleEditar(materia)}
                          >
                            Editar
                          </CButton>
                          <CButton
                            style={{ backgroundColor: 'white', color:'red', borderColor: 'red'}}
                            size="sm"
                            onClick={() =>
                              handleEliminar(materia.codigo_materia)
                            }
                          >
                            Eliminar
                          </CButton>
                        </CTableDataCell>
                      )}
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
              {/* Paginación */}
              {totalPaginas > 1 && (
                <CPagination align="center" className="mt-3">
                  <CPaginationItem
                    disabled={paginaActual === 1}
                    onClick={() => cambiarPagina(paginaActual - 1)}
                  >
                    Anterior
                  </CPaginationItem>
                  {[...Array(totalPaginas)].map((_, idx) => (
                    <CPaginationItem
                      key={idx + 1}
                      active={paginaActual === idx + 1}
                      onClick={() => cambiarPagina(idx + 1)}
                    >
                      {idx + 1}
                    </CPaginationItem>
                  ))}
                  <CPaginationItem
                    disabled={paginaActual === totalPaginas}
                    onClick={() => cambiarPagina(paginaActual + 1)}
                  >
                    Siguiente
                  </CPaginationItem>
                </CPagination>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* MODAL DE EDICIÓN */}
      <CModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        alignment="center"
      >
        <CModalHeader>
          <CModalTitle>Editar Materia</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CFormLabel>Código de Materia</CFormLabel>
            <CFormInput
              type="text"
              value={nuevoCodigo}
              onChange={(e) => setNuevoCodigo(e.target.value)}
              maxLength={15}
              className="mb-3"
            />
            <CFormLabel>Nombre</CFormLabel>
            <CFormInput
              type="text"
              value={nuevoNombre}
              onChange={(e) => setNuevoNombre(e.target.value)}
              maxLength={40}
            />
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="primary" onClick={handleGuardarEdicion}>
            Guardar Cambios
          </CButton>
          <CButton color="secondary" variant="outline" onClick={() => setModalVisible(false)}>
            Cancelar
          </CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  );
};

export default MateriaForm;