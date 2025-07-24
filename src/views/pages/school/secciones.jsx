// src/pages/Secciones.jsx
import React, { useEffect, useState } from 'react';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCardTitle,
  CForm,
  CFormInput,
  CButton,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CAlert
} from '@coreui/react';
import {apiUrl} from "../../../api"

const token = localStorage.getItem("token");

export default function Secciones() {
  const [secciones, setSecciones] = useState([]);
  const [form, setForm] = useState({ nombre: '', id_año: '' });
  const [editId, setEditId] = useState(null);
  const [pagina, setPagina] = useState(1);
  const porPagina = 5;
  const [filtro, setFiltro] = useState("");
  const [modal, setModal] = useState({ visible: false, mensaje: "", tipo: "success" });

  // Cargar secciones al montar
  useEffect(() => {
    fetch(apiUrl+'/crud-secciones',
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    )
      .then(r => r.json())
      .then(setSecciones);
  }, []);

  // Guardar o editar sección
  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.nombre || !form.id_año) {
      setModal({ visible: true, mensaje: "Completa todos los campos", tipo: "danger" });
      return;
    }
    if (editId) {
      const res = await fetch(apiUrl+`/crud-secciones/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
         },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setSecciones(secciones.map(s => s.id_seccion === editId ? { ...s, ...form } : s));
        setEditId(null);
        setForm({ nombre: '', id_año: '' });
        setModal({ visible: true, mensaje: "Sección actualizada", tipo: "success" });
      }
    } else {
      const res = await fetch(apiUrl+'/crud-secciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
         },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        const nueva = await res.json();
        setSecciones([...secciones, nueva.seccion]);
        setForm({ nombre: '', id_año: '' });
        setModal({ visible: true, mensaje: "Sección registrada", tipo: "success" });
      }
    }
  };

  // Editar sección
  const handleEdit = (s) => {
    setEditId(s.id_seccion);
    setForm({ nombre: s.nombre, id_año: s.id_año });
  };

  // Eliminar sección
  const handleDelete = async (id) => {
    await fetch(apiUrl+`/crud-secciones/${id}`, { method: 'DELETE' ,
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    setSecciones(secciones.filter(s => s.id_seccion !== id));
    setModal({ visible: true, mensaje: "Sección eliminada", tipo: "success" });
  };
  // Normalizar texto para filtro
  const normalizar = (texto) =>
    texto ? texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : "";

  // Filtrar secciones por nombre o año
  const seccionesFiltradas = secciones.filter(s =>
    normalizar(s.nombre).includes(normalizar(filtro)) ||
    normalizar(String(s.id_año)).includes(normalizar(filtro)) ||
    normalizar(s.nombre_año || "").includes(normalizar(filtro))
  );

  // Paginación
  const totalPaginas = Math.ceil(seccionesFiltradas.length / porPagina);
  const seccionesPaginadas = seccionesFiltradas.slice((pagina - 1) * porPagina, pagina * porPagina);

  return (
    <CCard className="shadow-sm mb-4" style={{ maxWidth: 700, margin: 'auto' }}>
      <CCardHeader style={{ backgroundColor: '#114c5f', color: 'white' }}>
        <CCardTitle>Registrar Sección</CCardTitle>
      </CCardHeader>
      <CCardBody>
        {/* Modal de alerta */}
        <CAlert color={modal.tipo} visible={modal.visible} dismissible onClose={() => setModal(m => ({ ...m, visible: false }))} style={{ marginBottom: 16 }}>
          {modal.mensaje}
        </CAlert>
        {/* Filtro */}
        <CFormInput
          type="text"
          placeholder="Filtrar por sección, año o nombre de año"
          value={filtro}
          onChange={e => { setFiltro(e.target.value); setPagina(1); }}
          className="mb-3"
        />
        <CForm onSubmit={handleSave} className="mb-4" style={{ display: 'flex', gap: 8 }}>
          <CFormInput
            type="text"
            placeholder="Nombre Sección ejm A,B,C,D"
            value={form.nombre}
            onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
            required
          />
          <CFormInput
            type="number"
            placeholder="Año ejm 1,2,3,4,5"
            value={form.id_año}
            onChange={e => setForm(f => ({ ...f, id_año: e.target.value }))}
            required
          />
          <CButton color="primary" type="submit">
            {editId ? 'Actualizar' : 'Registrar'}
          </CButton>
          {editId && (
            <CButton color="secondary" type="button" onClick={() => { setEditId(null); setForm({ nombre: '', id_año: '' }); }}>
              Cancelar
            </CButton>
          )}
        </CForm>
        <h4 className="mb-3">Listado de Secciones</h4>
        <CTable bordered responsive style={{textAlign: 'center'}}>
          <CTableHead>
            <CTableRow style={{ background: '#e0f7fa', textAlign: 'center' }}>
              <CTableHeaderCell>Sección</CTableHeaderCell>
              <CTableHeaderCell>Año</CTableHeaderCell>
              <CTableHeaderCell>Nombre Año</CTableHeaderCell>
              <CTableHeaderCell>Acciones</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {seccionesPaginadas.map(s => (
              <CTableRow key={s.id_seccion}>
                <CTableDataCell>{s.nombre}</CTableDataCell>
                <CTableDataCell>{s.id_año}</CTableDataCell>
                <CTableDataCell>{s.nombre_año}</CTableDataCell>
                <CTableDataCell>
                  <CButton color="info" size="sm" title="Editar" onClick={() => handleEdit(s)} style={{ marginRight: 8 }}>✏️</CButton>
                  <CButton color="danger" size="sm" title="Eliminar" onClick={() => handleDelete(s.id_seccion)}>🗑️</CButton>
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