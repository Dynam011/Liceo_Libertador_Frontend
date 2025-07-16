import React, { useState } from "react";
import {
  CContainer,
  CRow,
  CCol,
  CForm,
  CFormInput,
  CButton,
  CCard,
  CCardBody,
  CCardTitle,
  CAlert,
} from "@coreui/react";
import {apiUrl} from "../../../api"
const BuscarDocenteConstancia = () => {
  const [cedula, setCedula] = useState("");
  const [docente, setDocente] = useState(null);
  const [mensaje, setMensaje] = useState("");

  const handleBuscar = async (e) => {
    e.preventDefault();
    setMensaje("");
    setDocente(null);

    try {
      const res = await fetch(apiUrl+`/docente/${cedula}`);
      if (!res.ok) {
        setMensaje("Docente no encontrado");
        return;
      }
      const data = await res.json();
      setDocente(data);
    } catch (error) {
      setMensaje("Error en la búsqueda");
    }
  };

  const handleDescargar = () => {
    window.open(apiUrl+`/constancia-trabajo/${cedula}`, "_blank");
  };

  return (
    <CContainer className="py-4">
      <CRow className="justify-content-center">
        <CCol xs={12} md={8} lg={6}>
          <CCard>
            <CCardBody>
              <CCardTitle>Búsqueda de Docente para Constancia de Trabajo</CCardTitle>
              <CForm onSubmit={handleBuscar} className="mb-3">
                <CRow>
                  <CCol xs={8}>
                    <CFormInput
                      type="text"
                      placeholder="Ingrese cédula"
                      value={cedula}
                      onChange={(e) => setCedula(e.target.value)}
                      required
                    />
                  </CCol>
                  <CCol xs={4}>
                    <CButton type="submit" style={{background:'#114c5f', color:'white'}} className="w-100">
                      Buscar
                    </CButton>
                  </CCol>
                </CRow>
              </CForm>
              {mensaje && (
                <CAlert color="danger" dismissible onClose={() => setMensaje("")}>
                  {mensaje}
                </CAlert>
              )}
              {docente && (
                <div className="mt-3">
                  <strong>Nombre:</strong> {docente.nombres} {docente.apellidos} <br />
                  <strong>Tipo de documento:</strong> {docente.tipo_documento} <br />
                  <strong>Cédula:</strong> {docente.cedula} <br />
                  <CButton
                    style={{backgroundColor: '#114c5f', color: 'white'}}
                    className="mt-3"
                    onClick={handleDescargar}
                  >
                    Descargar Constancia de Trabajo
                  </CButton>
                </div>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  );
};

export default BuscarDocenteConstancia;