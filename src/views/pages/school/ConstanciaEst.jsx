import { useState } from "react";
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCardTitle,
  CCardText,
  CButton,
  CFormInput,
  CRow,
  CCol,
  CContainer,
  CSpinner,
  CAlert,
} from "@coreui/react";
import {apiUrl} from "../../../api"
const BuscarEstudiante = () => {
  const [cedula, setCedula] = useState("");
  const [estudiante, setEstudiante] = useState(null);
  const [loading, setLoading] = useState(false);
  const [noEncontrado, setNoEncontrado] = useState(false);

  // Obtener usuario y rol
  const usuarioGuardado = localStorage.getItem("usuario");
  const usuario = usuarioGuardado ? JSON.parse(usuarioGuardado) : null;

  const buscarEstudiante = async () => {
    setLoading(true);
    setNoEncontrado(false);
    try {
      const res = await fetch(apiUrl+`/estudiante/${cedula}`);
      if (res.status === 404) {
        setEstudiante(null);
        setNoEncontrado(true);
      } else {
        const data = await res.json();
        setEstudiante(data);
        setNoEncontrado(false);
      }
    } catch (error) {
      console.error("Error al obtener estudiante");
      setEstudiante(null);
      setNoEncontrado(true);
    }
    setLoading(false);
  };

  return (
    <CContainer className="py-5">
      <CRow className="justify-content-center">
        <CCol xs={12} md={8} lg={6}>
          <CCard className="shadow-sm">
            <CCardHeader className="" style={{ backgroundColor: "#114c5f", color: "white" }}>
              <CCardTitle>Búsqueda de Estudiante</CCardTitle>
            </CCardHeader>
            <CCardBody>
              {usuario?.rol === "admin" || usuario?.rol === "gestor" ? (
                <>
                  <CRow className="g-2 align-items-center mb-3">
                    <CCol xs={8}>
                      <CFormInput
                        type="text"
                        placeholder="Ingrese cédula"
                        value={cedula}
                        onChange={(e) => setCedula(e.target.value)}
                      />
                    </CCol>
                    <CCol xs={4}>
                      <CButton
                        style={{ backgroundColor: '#9cd2d3', color: '#114c5f'}}
                        className="w-100"
                        onClick={buscarEstudiante}
                        disabled={loading || !cedula}
                      >
                        {loading ? <CSpinner size="sm" /> : "Buscar"}
                      </CButton>
                    </CCol>
                  </CRow>

                  {(estudiante || noEncontrado) && (
                    <CCard className="mt-4 border-0 shadow-sm">
                      <CCardBody>
                        <CCardTitle className="mb-2">
                          {noEncontrado
                            ? "Estudiante no encontrado"
                            : `${estudiante.nombres} ${estudiante.apellidos}`}
                        </CCardTitle>
                        <CCardText>
                          <strong>Cédula:</strong>{" "}
                          {noEncontrado ? "No disponible" : estudiante.cedula}
                        </CCardText>
                        <CButton
                          style={{ backgroundColor: '#114c5f', color: 'white'}}
                          disabled={noEncontrado}
                          onClick={() =>
                            window.open(
                              apiUrl+`/constancia/${cedula}`,
                              "_blank"
                            )
                          }
                        >
                          Descargar Constancia
                        </CButton>
                      </CCardBody>
                    </CCard>
                  )}
                </>
              ) : (
                <CAlert color="warning" className="mb-0">
                  Solo los administradores pueden buscar estudiantes y generar
                  constancias.
                </CAlert>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  );
};

export default BuscarEstudiante;