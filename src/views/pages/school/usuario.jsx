import React, { useEffect, useState } from "react";
import {
  CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell,
  CButton, CFormInput, CFormSelect, CPagination, CPaginationItem,
  CModal, CModalHeader, CModalBody, CModalFooter, CCard, CCardBody, CCardHeader, CCardTitle
} from "@coreui/react";
import {apiUrl} from "../../../api"
const ROLES = ["usuario", "admin","gestor"];

const tablaEstilos = `
.tabla-usuarios th, .tabla-usuarios td {
  text-align: center !important;
  vertical-align: middle !important;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 180px;
  min-width: 100px;
  font-size: 0.98rem;
}
.acciones-btns {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  align-items: center;
}
`;

export default function UsuariosAdmin({ usuarioActual }) {
  const [usuarios, setUsuarios] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [mensaje, setMensaje] = useState("");
  const [pagina, setPagina] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [cedulaAEliminar, setCedulaAEliminar] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const porPagina = 5;

  useEffect(() => {
    fetch(apiUrl+"/usuarios")
      .then(res => res.json())
      .then(data => setUsuarios(Array.isArray(data) ? data : []))
      .catch(() => setUsuarios([]));
  }, []);

  const usuariosFiltrados = usuarios.filter(u =>
    (u.cedula && u.cedula.toString().toLowerCase().includes(busqueda.toLowerCase())) ||
    (u.nombres && u.nombres.toLowerCase().includes(busqueda.toLowerCase())) ||
    (u.apellidos && u.apellidos.toLowerCase().includes(busqueda.toLowerCase()))
  );

  const totalPaginas = Math.ceil(usuariosFiltrados.length / porPagina);
  const usuariosPagina = usuariosFiltrados.slice((pagina - 1) * porPagina, pagina * porPagina);

  const handleEdit = (idx) => {
    setEditIndex(idx);
    setEditForm({ ...usuariosPagina[idx], rol: usuariosPagina[idx].rol || "usuario" });
    setMensaje("");
  };

  const handleCancel = () => {
    setEditIndex(null);
    setEditForm({});
    setMensaje("");
  };

  const handleChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleSave = async (cedula) => {
    setMensaje("");
    try {
      const res = await fetch(apiUrl+`/usuarios/${cedula}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm)
      });
      if (res.ok) {
        setMensaje("Usuario actualizado correctamente");
        const nuevosUsuarios = [...usuarios];
        const globalIdx = usuarios.findIndex(u => u.cedula === cedula);
        nuevosUsuarios[globalIdx] = { ...editForm, cedula };
        setUsuarios(nuevosUsuarios);
        setEditIndex(null);
      } else {
        setMensaje("Error al actualizar usuario");
      }
    } catch {
      setMensaje("Error al actualizar usuario");
    }
  };

  const handleDeleteClick = (cedula) => {
    setCedulaAEliminar(cedula);
    setShowModal(true);
  };

  const handleDeleteConfirm = async () => {
    setMensaje("");
    setShowModal(false);
    try {
      const res = await fetch(apiUrl+`/usuarios/${cedulaAEliminar}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setMensaje("Usuario eliminado correctamente");
        setUsuarios(usuarios.filter(u => u.cedula !== cedulaAEliminar));
      } else {
        const data = await res.json();
        setMensaje(data.mensaje || "Error al eliminar usuario");
      }
    } catch {
      setMensaje("Error al eliminar usuario");
    }
    setCedulaAEliminar(null);
  };

  const handleDeleteCancel = () => {
    setShowModal(false);
    setCedulaAEliminar(null);
  };

  const handlePageChange = (newPage) => {
    setPagina(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    setPagina(1);
  }, [busqueda]);

  return (
    <div style={{ maxWidth: 1200, margin: "40px auto" }}>
      <style>{tablaEstilos}</style>
      <CCard className="shadow-sm">
        <CCardHeader style={{ background: "#114c5f", color: "#fff" }}>
          <CCardTitle>Usuarios</CCardTitle>
        </CCardHeader>
        <CCardBody>
          <div style={{ maxWidth: 350, marginBottom: 20 }}>
            <CFormInput
              placeholder="Buscar por cédula, nombres o apellidos..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
          </div>
          <CTable striped hover bordered align="middle" className="tabla-usuarios">
            <CTableHead color="light">
              <CTableRow>
                <CTableHeaderCell>Cédula</CTableHeaderCell>
                <CTableHeaderCell>Nombres</CTableHeaderCell>
                <CTableHeaderCell>Apellidos</CTableHeaderCell>
                <CTableHeaderCell>Teléfono</CTableHeaderCell>
                <CTableHeaderCell>Usuario</CTableHeaderCell>
                <CTableHeaderCell>Email</CTableHeaderCell>
                <CTableHeaderCell>Rol</CTableHeaderCell>
                <CTableHeaderCell>Acciones</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {usuariosPagina.map((u, idx) => (
                <CTableRow key={u.cedula}>
                  {editIndex === idx ? (
                    <>
                      <CTableDataCell>
                        <CFormInput
                          name="cedula"
                          value={editForm.cedula}
                          disabled
                          size="sm"
                        />
                      </CTableDataCell>
                      <CTableDataCell>
                        <CFormInput
                          name="nombres"
                          value={editForm.nombres}
                          onChange={handleChange}
                          size="sm"
                        />
                      </CTableDataCell>
                      <CTableDataCell>
                        <CFormInput
                          name="apellidos"
                          value={editForm.apellidos}
                          onChange={handleChange}
                          size="sm"
                        />
                      </CTableDataCell>
                      <CTableDataCell>
                        <CFormInput
                          name="telefono"
                          value={editForm.telefono}
                          onChange={handleChange}
                          size="sm"
                        />
                      </CTableDataCell>
                      <CTableDataCell>
                        <CFormInput
                          name="usuario"
                          value={editForm.usuario}
                          onChange={handleChange}
                          size="sm"
                        />
                      </CTableDataCell>
                      <CTableDataCell>
                        <CFormInput
                          name="email"
                          value={editForm.email}
                          onChange={handleChange}
                          size="sm"
                        />
                      </CTableDataCell>
                      <CTableDataCell>
                        <CFormSelect
                          name="rol"
                          value={editForm.rol || "usuario"}
                          onChange={handleChange}
                          size="sm"
                        >
                          {ROLES.map(r => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </CFormSelect>
                      </CTableDataCell>
                      <CTableDataCell>
                        <div className="acciones-btns">
                          <CButton color="success" variant="outline" size="sm" onClick={() => handleSave(u.cedula)}>Guardar</CButton>
                          <CButton color="danger" variant="outline" size="sm" onClick={handleCancel}>Cancelar</CButton>
                        </div>
                      </CTableDataCell>
                    </>
                  ) : (
                    <>
                      <CTableDataCell>{u.cedula}</CTableDataCell>
                      <CTableDataCell>{u.nombres}</CTableDataCell>
                      <CTableDataCell>{u.apellidos}</CTableDataCell>
                      <CTableDataCell>{u.telefono}</CTableDataCell>
                      <CTableDataCell>{u.usuario}</CTableDataCell>
                      <CTableDataCell>{u.email}</CTableDataCell>
                      <CTableDataCell>{u.rol || "usuario"}</CTableDataCell>
                      <CTableDataCell>
                        <div className="acciones-btns">
                          <CButton color="primary" variant="outline" size="sm" onClick={() => handleEdit(idx)}>
                            Editar
                          </CButton>
                          <CButton color="danger" variant="outline" size="sm" onClick={() => handleDeleteClick(u.cedula)}>
                            Eliminar
                          </CButton>
                        </div>
                      </CTableDataCell>
                    </>
                  )}
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
          <div style={{ display: "flex", justifyContent: "center", margin: 20 }}>
            <CPagination align="center" aria-label="Paginación usuarios" >
              {[...Array(totalPaginas)].map((_, i) => (
                <CPaginationItem
                  key={i}
                  active={pagina === i + 1}
                  onClick={() => handlePageChange(i + 1)}
                >
                  {i + 1}
                </CPaginationItem>
              ))}
            </CPagination>
          </div>
          {mensaje && <div style={{ textAlign: "center", color: "green" }}>{mensaje}</div>}
        </CCardBody>
      </CCard>
      {/* Modal de confirmación */}
      <CModal visible={showModal} onClose={handleDeleteCancel}>
        <CModalHeader>Confirmar eliminación</CModalHeader>
        <CModalBody>
          ¿Seguro que deseas eliminar este usuario?
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" variant="outline" onClick={handleDeleteCancel}>Cancelar</CButton>
          <CButton color="danger" variant="outline" onClick={handleDeleteConfirm}>Eliminar</CButton>
        </CModalFooter>
      </CModal>
    </div>
  );
}