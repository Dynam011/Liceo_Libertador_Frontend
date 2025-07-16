import React, { useState } from 'react';
import {
  CCol,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CModal,
  CModalBody,
  CModalHeader,
  CModalTitle,
  CFormInput
} from '@coreui/react';


const Estudiantes = () => {
  const [showForm, setShowForm] = useState(false);
  const [estudiantes, setEstudiantes] = useState([]);
  const [selectedEstudiante, setSelectedEstudiante] = useState(null); // Agrega el estado para el estudiante seleccionado
  const [filter, setFilter] = useState('');

  const filteredEstudiantes = estudiantes.filter((estudiante) =>
    estudiante.primer_nombre.toLowerCase().includes(filter.toLowerCase()) ||
    estudiante.cedula.includes(filter)
  );
  const toggleForm = () => {
    setShowForm(!showForm);
  };


  const handleSave = (newEstudiante) => {
    if (selectedEstudiante) {
      // Actualizar estudiante existente
      setEstudiantes((prev) =>
        prev.map((estudiante) =>
          estudiante.id === selectedEstudiante.id ? newEstudiante : estudiante
        )
      );
    } else {
      // Agregar nuevo estudiante
      setEstudiantes([...estudiantes, newEstudiante]);
    }
    setSelectedEstudiante(null); // Limpia el estudiante seleccionado
    toggleForm(); // Cierra el modal
  };


  return (
    <CCard>
      <CCardHeader>
        <CCol>
          <h5>Listado de Estudiantes</h5>
        </CCol>
        <div>
    <CFormInput
      type="text"
      placeholder="Filtrar estudiantes..."
      value={filter}
      onChange={(e) => setFilter(e.target.value)}
    />
  </div>
      </CCardHeader>
      <CCardBody>
        <EstudianteList estudiantes={filteredEstudiantes} />
      </CCardBody>

      {/* Modal para el formulario */}
      <CModal visible={showForm}>
        <CModalHeader>
          <CModalTitle>{selectedEstudiante ? 'Editar Estudiante' : 'Agregar Estudiante'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <EstudianteForm
            estudiante={selectedEstudiante}
            onSave={handleSave}
            onClose={toggleForm}
          />
        </CModalBody>
      </CModal>
    </CCard>
  );
};

export default Estudiantes;