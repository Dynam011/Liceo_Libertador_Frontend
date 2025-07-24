import React, { useState, useEffect } from "react";
import {
  CCard, CCardBody, CCardHeader, CCardTitle, CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell,
  CFormInput, CButton, CFormSelect, CAlert, CRow, CCol, CBadge
} from "@coreui/react";
import CIcon from '@coreui/icons-react';
import { cilSave, cilPencil } from '@coreui/icons';
import {apiUrl} from "../../../api"
const token = localStorage.getItem("token");
const CargarNotasDocente = () => {
  const [materias, setMaterias] = useState([]);
  const [materiaSeleccionada, setMateriaSeleccionada] = useState(null);
  const [notas, setNotas] = useState({});
  const [mensaje, setMensaje] = useState("");
  const [historial, setHistorial] = useState({});
  const [aniosEscolares, setAniosEscolares] = useState([]);
  const [anioSeleccionado, setAnioSeleccionado] = useState("");
  const [cortes, setCortes] = useState([]);
  const [editando, setEditando] = useState({});

  useEffect(() => {
    const fetchMaterias = async () => {

      const res = await fetch(apiUrl+"/docente/materias-estudiantes", {
        headers: { Authorization: `Bearer ${token}` },
        'Cache-Control': 'no-cache'
      });
      const data = await res.json();
      setMaterias(data.materias || []);
      const anios = [...new Set((data.materias || []).map(m => m.año_escolar))]
        .filter(Boolean)
        .sort((a, b) => b.localeCompare(a));
      setAniosEscolares(anios);
      setAnioSeleccionado(anios[0] || "");
    };
    fetchMaterias();
  }, []);

  useEffect(() => {
    const fetchCortes = async () => {
      const res = await fetch(apiUrl+"/cortes",
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      const data = await res.json();
      setCortes(data.cortes || []);
    };
    fetchCortes();
  }, []);

  const materiasFiltradas = materias.filter(m => m.año_escolar === anioSeleccionado);

  useEffect(() => {
    setMateriaSeleccionada(null);
  }, [anioSeleccionado]);

  const fetchHistorial = async (id_materia_inscrita) => {

    const res = await fetch(apiUrl+`/evaluaciones/${id_materia_inscrita}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setHistorial(prev => ({ ...prev, [id_materia_inscrita]: data.evaluaciones || [] }));
  };

  useEffect(() => {
    if (materiaSeleccionada) {
      materiaSeleccionada.estudiantes.forEach(est => fetchHistorial(est.id_materia_inscrita));
    }
  }, [materiaSeleccionada]);

  const formatoFecha = (fecha) => fecha.toISOString().slice(0, 10);

  const corteHabilitado = (idx) => {
    if (!cortes[idx]) return false;
    const hoy = new Date().toISOString().slice(0, 10);
    const inicio = formatoFecha(new Date(cortes[idx].fecha_inicio));
    const fin = formatoFecha(new Date(cortes[idx].fecha_fin));
    return hoy >= inicio && hoy <= fin;
  };

  // Encuentra el índice del corte de reparación
  const idxReparacion = cortes.findIndex(c => (c.nombre || "").toLowerCase() === "reparacion");
  const reparacionHabilitada = idxReparacion !== -1 && corteHabilitado(idxReparacion);

  // Guardar todas las notas de todos los lapsos habilitados y reparación
  const handleGuardarNotas = async (idEstudianteEditar = null) => {

    const promises = [];
    (materiaSeleccionada.estudiantes || []).forEach(est => {
      // Si estamos editando solo un estudiante, solo guarda ese
      if (idEstudianteEditar && est.id_materia_inscrita !== idEstudianteEditar) return;
      [1, 2, 3].forEach(lapso => {
        const datos = notas[`${est.id_materia_inscrita}_${lapso}`] || {};
        if (datos.nota !== undefined && datos.nota !== "" && corteHabilitado(lapso - 1)) {
          promises.push(
            fetch(apiUrl+"/docente/guardar-nota", {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
              body: JSON.stringify({
                id_materia_inscrita: est.id_materia_inscrita,
                fk_momento: lapso,
                nota: datos.nota,
                descripcion: "",
                fk_corte: null
              })
            })
          );
        }
      });
      // Reparación
      if (reparacionHabilitada) {
        const datosRep = notas[`${est.id_materia_inscrita}_rep`] || {};
        if (datosRep.nota !== undefined && datosRep.nota !== "") {
          promises.push(
            fetch(apiUrl+"/docente/guardar-nota", {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
              body: JSON.stringify({
                id_materia_inscrita: est.id_materia_inscrita,
                fk_momento: 4, // o el id correcto para reparación
                nota: datosRep.nota,
                rep: datosRep.nota, // <---
                descripcion: "",
                fk_corte: cortes[idxReparacion]?.id_corte || null
              })
            })
          );
        }
      }
    });
    await Promise.all(promises);
    setMensaje("Notas guardadas correctamente");
    (materiaSeleccionada.estudiantes || []).forEach(est => fetchHistorial(est.id_materia_inscrita));
    setTimeout(() => setMensaje(""), 2500);
    // setNotas({}); // <-- Elimina o comenta esta línea
    if (idEstudianteEditar) {
      setEditando(prev => ({ ...prev, [idEstudianteEditar]: false }));
    } else {
      setEditando({});
    }
  };

  const handleNotaChange = (id, lapso, campo, valor) => {
    setNotas(prev => ({
      ...prev,
      [`${id}_${lapso}`]: { ...prev[`${id}_${lapso}`], [campo]: valor }
    }));
  };

  const getNotaValida = (ev) => {
    if (!ev) return null;
    return ev.nota ?? 0;
  };

  const getPromedioYFinal = (hist) => {
    if (hist.length < 3) return { promedio: "-", notaFinal: "-", estado: "-" };
    const notasValidas = [1, 2, 3].map(lapso =>
      getNotaValida(hist.find(ev => ev.fk_momento === lapso))
    );
    const suma = notasValidas.reduce((a, b) => a + (b || 0), 0);
    const promedio = Math.round(suma / 3);
    let notaFinal = promedio;
    return {
      promedio: promedio,
      notaFinal: Math.round(notaFinal),
      estado: notaFinal >= 10 ? "Aprobado" : "Reprobado"
    };
  };

  const mostrarReparacion = materiaSeleccionada &&
    !["orientación y convivencia", "participación en grupos de recreación"]
      .includes((materiaSeleccionada.materia || "").toLowerCase());

  return (
    <CCard className="shadow-sm mt-4" >
      <CCardHeader style={{ background: "#114c5f", color: "white" }}>
        <CCardTitle>Materias Asignadas</CCardTitle>
      </CCardHeader>
      <CCardBody>
        {mensaje && <CAlert color="success" className="mb-3">{mensaje}</CAlert>}
        <CRow className="mb-3">
          <CCol xs={12} md={4}>
            <CFormSelect
              value={anioSeleccionado}
              onChange={e => setAnioSeleccionado(e.target.value)}
              className="mb-2"
            >
              {aniosEscolares.map(anio => (
                <option key={anio} value={anio}>{anio}</option>
              ))}
            </CFormSelect>
          </CCol>
          <CCol xs={12} md={8}>
            <CFormSelect
              value={materiasFiltradas.findIndex(m => m === materiaSeleccionada)}
              onChange={e => setMateriaSeleccionada(materiasFiltradas[e.target.value])}
            >
              <option value="">Seleccione una materia</option>
              {materiasFiltradas.map((m, idx) => (
                <option key={idx} value={idx}>
                  {m.materia} - {m.año} - {m.seccion}
                </option>
              ))}
            </CFormSelect>
          </CCol>
        </CRow>
        {materiaSeleccionada && (
          <>
            <h5 className="mb-3">
              {materiaSeleccionada.materia} - {materiaSeleccionada.año} - {materiaSeleccionada.seccion}
              {["orientación y convivencia", "participación en grupos de recreación"].includes(
                (materiaSeleccionada.materia || "").toLowerCase()
              ) && (
                <span style={{ marginLeft: 12, color: "#0d6efd", fontWeight: "bold", fontSize: 16 }}>
                  Notas Apreciativas: A = 19-20, B = 15-18, C = 11-14, D = 1-10
                </span>
              )}
            </h5>
            <CTable hover responsive bordered align="middle">
              <CTableHead color="light">
                <CTableRow style={{textAlign:'center'}}>
                  <CTableHeaderCell rowSpan={2} style={{ minWidth: 180 }}>Estudiante</CTableHeaderCell>
                  <CTableHeaderCell rowSpan={2} style={{ minWidth: 110 }}>Cédula</CTableHeaderCell>
                  {[1, 2, 3].map(lapso => (
                    <CTableHeaderCell key={lapso} className="text-center">
                      {lapso} Momento
                      <div>
                        <CBadge color={corteHabilitado(lapso - 1) ? "success" : "secondary"}>
                          {corteHabilitado(lapso - 1) ? "Habilitado" : "Cerrado"}
                        </CBadge>
                      </div>
                    </CTableHeaderCell>
                  ))}
                  <CTableHeaderCell rowSpan={2}>Nota Final</CTableHeaderCell>
                  <CTableHeaderCell rowSpan={2}>Estado</CTableHeaderCell>
                  {mostrarReparacion && idxReparacion !== -1 && (
                    <CTableHeaderCell rowSpan={2}>
                      Rep
                      <div>
                        <CBadge color={reparacionHabilitada ? "success" : "secondary"}>
                          {reparacionHabilitada ? "Habilitado" : "Cerrado"}
                        </CBadge>
                      </div>
                    </CTableHeaderCell>
                  )}
                  {mostrarReparacion && idxReparacion !== -1 && (
                    <CTableHeaderCell rowSpan={2}>
                      Estado Rep
                    </CTableHeaderCell>
                  )}
                  <CTableHeaderCell rowSpan={2}>Acción</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody style={{ maxWidth: "98vw", width: "1800px", margin: "0 auto" }}>
                {materiaSeleccionada.estudiantes.map(est => {
                  const id = est.id_materia_inscrita;
                  const hist = historial[id] || [];
                  const { promedio, notaFinal, estado } = getPromedioYFinal(hist);

                  const sinNotas = [1, 2, 3].every(lapso => {
                    const evLapso = hist.find(ev => ev.fk_momento === lapso);
                    return !evLapso || evLapso.nota === undefined || evLapso.nota === null || evLapso.nota === "";
                  });

                  const estaEditando = !!editando[id] || sinNotas;

                  // Reparación
                  const evRep = hist.find(ev => ev.fk_momento === 4) || {};
                  const repKey = `${id}_rep`;

                  return (
                    <CTableRow key={id}>
                      <CTableDataCell style={{ minWidth: 180, whiteSpace: "nowrap" }}>
                        {est.nombres} {est.apellidos}
                      </CTableDataCell>
                      <CTableDataCell style={{ minWidth: 110 }}>{est.cedula}</CTableDataCell>
                      {[1, 2, 3].map(lapso => {
                        const evLapso = hist.find(ev => ev.fk_momento === lapso) || {};
                        const notaKey = `${id}_${lapso}`;
                        return (
                          <CTableDataCell key={lapso}>
                            <CFormInput
                              type="number"
                              min={0}
                              max={20}
                              style={{ width: 65, paddingRight: 10 }}
                              value={
                                estaEditando
                                  ? (notas[notaKey]?.nota ?? evLapso.nota ?? "")
                                  : (evLapso.nota ?? "")
                              }
                              onChange={e => handleNotaChange(id, lapso, "nota", e.target.value)}
                              disabled={
                                !corteHabilitado(lapso - 1) ||
                                (!estaEditando)
                              }
                            />
                          </CTableDataCell>
                        );
                      })}
                      <CTableDataCell>
                        <CBadge color="primary">{notaFinal}</CBadge>
                      </CTableDataCell>
                      <CTableDataCell>
                        <CBadge color={estado === "Aprobado" ? "success" : "danger"}>{estado}</CBadge>
                      </CTableDataCell>
                      {mostrarReparacion && idxReparacion !== -1 && (
                        <CTableDataCell>
                          <CFormInput
                            type="number"
                            min={0}
                            max={20}
                            style={{ width: 65, paddingRight: 10 }}
                            value={notas[repKey]?.nota ?? evRep.nota ?? ""}
                            onChange={e => handleNotaChange(id, "rep", "nota", e.target.value)}
                            disabled={
                              !reparacionHabilitada ||
                              estado === "Aprobado" ||
                              ((evRep.nota !== undefined && evRep.nota !== null && evRep.nota !== "") && !estaEditando)
                            }
                          />
                        </CTableDataCell>
                      )}
                      {mostrarReparacion && idxReparacion !== -1 && (
                        <CTableDataCell>
                          {(evRep.nota !== undefined && evRep.nota !== null && evRep.nota !== "") ? (
                            <CBadge color={Number(evRep.nota) >= 10 ? "success" : "danger"}>
                              {Number(evRep.nota) >= 10 ? "Aprobada" : "Reprobada"}
                            </CBadge>
                          ) : (
                            "-"
                          )}
                        </CTableDataCell>
                      )}
                      <CTableDataCell>
                        {(!sinNotas && !estaEditando) ? (
                          <CButton
                            size="sm"
                            onClick={() => setEditando(prev => ({ ...prev, [id]: true }))}
                            style={{ padding: "2px 6px", color: 'white', backgroundColor: 'gray' }}
                          >
                            <CIcon icon={cilPencil} size="sm" />
                          </CButton>
                        ) : (
                          <CButton
                            color="success"
                            size="sm"
                            onClick={() => handleGuardarNotas(id)}
                            style={{ padding: "2px 6px", color: 'white' }}
                          >
                            <CIcon icon={cilSave} size="sm" />
                          </CButton>
                        )}
                      </CTableDataCell>
                    </CTableRow>
                  );
                })}
              </CTableBody>
            </CTable>
            <div className="d-flex justify-content-end mt-3">
              <CButton
                color="primary"
                style={{ minWidth: 180, background: "#114c5f", border: "none" }}
                onClick={() => handleGuardarNotas()}
              >
                <CIcon icon={cilSave} size="sm" className="me-2" />
                Guardar todas las notas
              </CButton>
            </div>
          </>
        )}
      </CCardBody>
    </CCard>
  );
};

export default CargarNotasDocente;