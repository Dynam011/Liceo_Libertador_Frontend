import { useState, useEffect } from "react";
import {
  CContainer, CRow, CCol, CCard, CCardHeader, CCardBody, CForm, CFormSelect, CButton, CAlert
} from "@coreui/react";
import {apiUrl} from "../../../api"
const DescargarNotasSeccion = () => {
  const [aniosEscolares, setAniosEscolares] = useState([]);
  const [anios, setAnios] = useState([]);
  const [secciones, setSecciones] = useState([]);
  const [filtros, setFiltros] = useState({
    id_año_escolar: "",
    id_año: "",
    id_seccion: ""
  });
  const [mensaje, setMensaje] = useState("");

  // Cargar años escolares (nuevo endpoint)
  useEffect(() => {
    fetch(apiUrl+"/anios-escolares-filtrado")
      .then(res => res.json())
      .then(data => setAniosEscolares(data.listaAniosEscolares || []));
    fetch(apiUrl+"/anios")
      .then(res => res.json())
      .then(data => setAnios(data.anios || []));
  }, []);

  // Cargar secciones según año seleccionado (nuevo endpoint)
  useEffect(() => {
    if (filtros.id_año) {
      fetch(apiUrl+`/secciones-por-anio?id_año=${filtros.id_año}`)
        .then(res => res.json())
        .then(data => setSecciones(data.listaSecciones || []));
    } else {
      setSecciones([]);
    }
  }, [filtros.id_año]);

  // Seleccionar automáticamente el año escolar más reciente
  useEffect(() => {
    if (aniosEscolares.length > 0) {
      setFiltros(f => ({ ...f, id_año_escolar: aniosEscolares[0].id_año_escolar }));
    }
  }, [aniosEscolares]);

  const handleChange = e => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
  };

  const descargarPDF = () => {
    if (!filtros.id_año_escolar || !filtros.id_año || !filtros.id_seccion) {
      setMensaje("Debe seleccionar año escolar, año y sección.");
      return;
    }
    setMensaje("");
    const url = apiUrl+`/notas-seccion/pdf?id_seccion=${filtros.id_seccion}&id_año_escolar=${filtros.id_año_escolar}`;
    window.open(url, "_blank");
  };

  const descargarExcel = () => {
  if (!filtros.id_año_escolar || !filtros.id_año || !filtros.id_seccion) {
    setMensaje("Debe seleccionar año escolar, año y sección.");
    return;
  }
  setMensaje("");
  const url = apiUrl+`/exportar-listado-notas-excel?id_seccion=${filtros.id_seccion}&id_año_escolar=${filtros.id_año_escolar}`;
  window.open(url, "_blank");
};

  return (
    <CContainer className="py-4">
      <CRow className="justify-content-center">
        <CCol xs={12} md={10} lg={8}>
          <CCard>
            <CCardHeader style={{ background: "#114c5f", color: "#fff" }}>
              Imprimir Listado de Notas por Sección
            </CCardHeader>
            <CCardBody>
              {mensaje && <CAlert color="danger">{mensaje}</CAlert>}
              <CForm>
                <CRow className="mb-3">
                  <CCol md={4}>
                    <CFormSelect
                      name="id_año_escolar"
                      label="Año Escolar"
                      value={filtros.id_año_escolar}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Seleccione</option>
                      {aniosEscolares.map(ae => (
                        <option key={ae.id_año_escolar} value={ae.id_año_escolar}>{ae.nombre}</option>
                      ))}
                    </CFormSelect>
                  </CCol>
                  <CCol md={4}>
                    <CFormSelect
                      name="id_año"
                      label="Año"
                      value={filtros.id_año}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Seleccione</option>
                      {anios.map(a => (
                        <option key={a.id_año} value={a.id_año}>{a.nombre_año}</option>
                      ))}
                    </CFormSelect>
                  </CCol>
                  <CCol md={4}>
                    <CFormSelect
                      name="id_seccion"
                      label="Sección"
                      value={filtros.id_seccion}
                      onChange={handleChange}
                      required
                      disabled={!filtros.id_año}
                    >
                      <option value="">Seleccione</option>
                      {secciones.map(s => (
                        <option key={s.id_seccion} value={s.id_seccion}>{s.nombre_completo}</option>
                      ))}
                    </CFormSelect>
                  </CCol>
                </CRow>
                <CRow className="g-2">
                  <CCol xs={6}>
                    <div className="d-grid">
                      <CButton color="primary" onClick={descargarPDF}>
                        Descargar PDF
                      </CButton>
                    </div>
                  </CCol>
                  <CCol xs={6}>
                    <div className="d-grid">
                      <CButton color="success text-white" onClick={descargarExcel}>
                        Descargar Excel
                      </CButton>
                    </div>
                  </CCol>
                </CRow>
              </CForm>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  );
};

export default DescargarNotasSeccion;