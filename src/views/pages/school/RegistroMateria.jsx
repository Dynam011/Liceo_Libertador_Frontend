import { useState, useEffect } from "react";
import {
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
import { apiUrl } from "../../../api";

const token = localStorage.getItem("token");


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
  const [modalEliminar, setModalEliminar] = useState(false);

  // Para eliminar
  const [codigoEliminar, setCodigoEliminar] = useState("");

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
      const res = await fetch(apiUrl + "/materiasregistradas",
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
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
      const res = await fetch(apiUrl + "/materias", {
        method: "POST",
        headers: { "Content-Type": "application/json" ,
          'Authorization': `Bearer ${token}`
        },
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
        apiUrl + `/materias/${materiaSeleccionada.codigo_materia}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" ,
            'Authorization': `Bearer ${token}`
          },
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

  // Eliminar con modal
  const handleEliminarModal = (codigo_materia) => {
    setCodigoEliminar(codigo_materia);
    setModalEliminar(true);
  };

  const handleEliminar = async () => {
    try {
      await fetch(apiUrl + `/materias/${codigoEliminar}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" ,
          'Authorization': `Bearer ${token}`
        },
      });
      obtenerMaterias();
      setMensaje("Materia eliminada correctamente.");
    } catch (error) {
      console.error("Error eliminando materia:", error);
      setMensaje("Error al eliminar la materia.");
    }
    setModalEliminar(false);
    setCodigoEliminar("");
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
      <CRow className="justify-content-center mb-2">
        <CCol xs={12} md={10} lg={8}>
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
              className="mb-3"
              onClick={() => setModalVisible(true)}
            >
              Registrar Materia
            </CButton>
          )}
        </CCol>
      </CRow>

      {/* MODAL DE REGISTRO/EDICIÓN */}
      <CModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        alignment="center"
      >
        <CModalHeader>
          <CModalTitle>
            {materiaSeleccionada ? "Editar Materia" : "Registrar Materia"}
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm onSubmit={materiaSeleccionada ? (e) => { e.preventDefault(); handleGuardarEdicion(); } : handleSubmit}>
            <CFormLabel>Código de Materia</CFormLabel>
            <CFormInput
              type="text"
              value={materiaSeleccionada ? nuevoCodigo : codigo_materia}
              onChange={materiaSeleccionada ? (e) => setNuevoCodigo(e.target.value) : (e) => setCodigoMateria(e.target.value)}
              maxLength={15}
              className="mb-3"
              required
              placeholder="Ej: 01MAT - 01 PERTENECE AL AÑO"
            />
            <CFormLabel>Nombre</CFormLabel>
            <CFormInput
              type="text"
              value={materiaSeleccionada ? nuevoNombre : nombre}
              onChange={materiaSeleccionada ? (e) => setNuevoNombre(e.target.value) : (e) => setNombre(e.target.value)}
              maxLength={40}
              required
              placeholder="Ejm Matemáticas"
            />
            <div className="d-flex justify-content-end mt-3">
              <CButton color="primary" type="submit">
                {materiaSeleccionada ? "Guardar Cambios" : "Registrar"}
              </CButton>
              <CButton color="secondary" variant="outline" className="ms-2" onClick={() => setModalVisible(false)}>
                Cancelar
              </CButton>
            </div>
          </CForm>
        </CModalBody>
      </CModal>

      {/* MODAL DE CONFIRMACIÓN DE ELIMINACIÓN */}
      <CModal
        visible={modalEliminar}
        onClose={() => setModalEliminar(false)}
        alignment="center"
      >
        <CModalHeader>
          <CModalTitle>Eliminar Materia</CModalTitle>
        </CModalHeader>
        <CModalBody>
          ¿Seguro que deseas eliminar esta materia?
        </CModalBody>
        <CModalFooter>
          <CButton color="danger" onClick={handleEliminar}>
            Eliminar
          </CButton>
          <CButton color="secondary" variant="outline" onClick={() => setModalEliminar(false)}>
            Cancelar
          </CButton>
        </CModalFooter>
      </CModal>

      <CRow className="justify-content-center">
        <CCol xs={12} md={10} lg={8}>
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
                        style={{ backgroundColor: 'white', color: '#114c5f', borderColor: '#114c5f' }}
                        size="sm"
                        className="me-2"
                        onClick={() => handleEditar(materia)}
                      >
                        Editar
                      </CButton>
                      <CButton
                        style={{ backgroundColor: 'white', color: 'red', borderColor: 'red' }}
                        size="sm"
                        onClick={() => handleEliminarModal(materia.codigo_materia)}
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
        </CCol>
      </CRow>
    </CContainer>
  );
};

export default MateriaForm;