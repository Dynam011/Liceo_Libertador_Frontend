import React, { useEffect, useState } from 'react';
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
  CFormInput,
  CFormSelect,
  CButton,
  CAlert,
} from "@coreui/react";
import {apiUrl} from "../../../api"
const EstudianteForm = () => {
  const [formData, setFormData] = useState({
    fk_documento: '',
    cedula: '',
    nombres: '',
    apellidos: '',
    nacionalidad: '',
    sexo: '',
    fecha_nacimiento: '',
    lugar_nacimiento: ''
  });

  const [tiposDocumento, setTiposDocumento] = useState([]);
  const [nacionalidades, setNacionalidades] = useState([]);
  const [mensaje, setMensaje] = useState("");

  // Obtener usuario y rol
  const usuarioGuardado = localStorage.getItem("usuario");
  const usuario = usuarioGuardado ? JSON.parse(usuarioGuardado) : null;

  // Obtener tipos de documento
  useEffect(() => {
    fetch(apiUrl+'/tipos-documento')
      .then(res => res.json())
      .then(data => setTiposDocumento(data))
      .catch(() => setTiposDocumento([]));
  }, []);

  // Obtener nacionalidades
  useEffect(() => {
    fetch(apiUrl+'/nacionalidades')
      .then(res => res.json())
      .then(data => setNacionalidades(data))
      .catch(() => setNacionalidades([]));
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const response = await fetch(apiUrl+'/registrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        setMensaje('Error al registrar estudiante');
      } else {
        setMensaje('Estudiante registrado exitosamente');
        setFormData({
          fk_documento: '',
          cedula: '',
          nombres: '',
          apellidos: '',
          nacionalidad: '',
          sexo: '',
          fecha_nacimiento: '',
          lugar_nacimiento: ''
        });
      }
    } catch (err) {
      setMensaje('Error en la conexión');
    }
  };

  return (
    <CContainer className="py-4">
      <CRow className="justify-content-center">
        <CCol xs={12} lg={8}>
          <CCard className="shadow-sm">
            <CCardHeader style={{ backgroundColor: "#114c5f", color: "white" }}>
              <CCardTitle>Registro de Estudiante</CCardTitle>
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
              {usuario?.rol === "admin" || usuario?.rol === "gestor" ?  (
                <CForm onSubmit={handleSubmit}>
                  <CRow className="g-3">
                    <CCol md={4}>
                      <CFormLabel>Tipo de Documento</CFormLabel>
                      <CFormSelect
                        name="fk_documento"
                        value={formData.fk_documento}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Seleccione tipo</option>
                        {tiposDocumento.map(td => (
                          <option key={td.id_documento} value={td.id_documento}>
                            {td.nombre}
                          </option>
                        ))}
                      </CFormSelect>
                    </CCol>
                    <CCol md={4}>
                      <CFormLabel>Cédula</CFormLabel>
                      <CFormInput
                        name="cedula"
                        placeholder="Ej: 12345678"
                        value={formData.cedula}
                        onChange={handleChange}
                        required
                      />
                    </CCol>
                    <CCol md={4}>
                      <CFormLabel>Nacionalidad</CFormLabel>
                      <CFormSelect
                        name="nacionalidad"
                        value={formData.nacionalidad}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Seleccione Nacionalidad</option>
                        {nacionalidades.map(n => (
                          <option key={n.id_nacionalidad} value={n.id_nacionalidad}>
                            {n.nombre}
                          </option>
                        ))}
                      </CFormSelect>
                    </CCol>
                    <CCol md={6}>
                      <CFormLabel>Nombres</CFormLabel>
                      <CFormInput
                        name="nombres"
                        placeholder="Ej: Juan Carlos"
                        value={formData.nombres}
                        onChange={handleChange}
                        required
                      />
                    </CCol>
                    <CCol md={6}>
                      <CFormLabel>Apellidos</CFormLabel>
                      <CFormInput
                        name="apellidos"
                        placeholder="Ej: Pérez Gómez"
                        value={formData.apellidos}
                        onChange={handleChange}
                        required
                      />
                    </CCol>
                    <CCol md={4}>
                      <CFormLabel>Sexo</CFormLabel>
                      <CFormSelect
                        name="sexo"
                        value={formData.sexo}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Seleccione</option>
                        <option value="M">Masculino</option>
                        <option value="F">Femenino</option>
                      </CFormSelect>
                    </CCol>
                    <CCol md={4}>
                      <CFormLabel>Fecha de nacimiento</CFormLabel>
                      <CFormInput
                        type="date"
                        name="fecha_nacimiento"
                        value={formData.fecha_nacimiento}
                        onChange={handleChange}
                        required
                      />
                    </CCol>
                    <CCol md={4}>
                      <CFormLabel>Lugar de nacimiento</CFormLabel>
                      <CFormInput
                        name="lugar_nacimiento"
                        placeholder="Ej: Caracas"
                        value={formData.lugar_nacimiento}
                        onChange={handleChange}
                        required
                      />
                    </CCol>
                  </CRow>
                  <CRow className="mt-4">
                    <CCol className="d-flex justify-content-center">
                      <CButton
                        type="submit"
                        size="sm"
                        style={{
                          backgroundColor: '#9cd2d3',
                          color: '#114c5f',
                          minWidth: '160px',
                          maxWidth: '220px',
                          fontWeight: 'bold',
                          fontSize: '1rem',
                          padding: '8px 8px',
                          borderRadius: '5px',
                          boxShadow: '0 2px 8px #0001'
                        }}
                      >
                        Registrar Estudiante
                      </CButton>
                    </CCol>
                  </CRow>
                </CForm>
              ) : (
                <CAlert color="warning" className="mb-0">
                  Solo los administradores pueden registrar estudiantes.
                </CAlert>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  );
};

export default EstudianteForm;