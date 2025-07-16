import React, { useEffect, useState } from 'react';
import { CButton, CCol, CForm, CFormInput, CContainer, CAlert } from '@coreui/react';

const EstudianteForm = ({ estudiante, onClose, onSave }) => {
  const [cedula, setCedula] = useState('');
  const [primerNombre, setPrimerNombre] = useState('');
  const [segundoNombre, setSegundoNombre] = useState('');
  const [primerApellido, setPrimerApellido] = useState('');
  const [segundoApellido, setSegundoApellido] = useState('');
  const [fechaNac, setFechaNac] = useState('');
  const [celular, setCelular] = useState('');
  const [tarjetaDeIdent, setTarjetaDeIdent] = useState('');
  const [lugarDeNac, setLugarDeNac] = useState('');
  const [estadoNac, setEstadoNac] = useState('');
  const [edoCivil, setEdoCivil] = useState('');
  const [correo, setCorreo] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (estudiante) {
      setCedula(estudiante.cedula || '');
      setPrimerNombre(estudiante.primer_nombre || '');
      setSegundoNombre(estudiante.segundo_nombre || '');
      setPrimerApellido(estudiante.primer_apellido || '');
      setSegundoApellido(estudiante.segundo_apellido || '');
      setFechaNac(estudiante.fecha_nac || '');
      setCelular(estudiante.celular || '');
      setTarjetaDeIdent(estudiante.tarjeta_de_ident || '');
      setLugarDeNac(estudiante.lugar_de_nac || '');
      setEstadoNac(estudiante.estado_nac || '');
      setEdoCivil(estudiante.edo_civil || '');
      setCorreo(estudiante.correo || '');
    }
  }, [estudiante]);

  const validateFields = () => {
    if (!cedula.match(/^\d+$/)) return 'La cédula debe contener solo números.';
    if (!primerNombre.trim()) return 'El primer nombre es obligatorio.';
    if (!primerApellido.trim()) return 'El primer apellido es obligatorio.';
    if (!fechaNac) return 'La fecha de nacimiento es obligatoria.';
    if (!celular.match(/^\d{10,11}$/)) return 'El celular debe contener entre 10 y 11 dígitos.';
    if (!correo.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) return 'El correo no tiene un formato válido.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateFields();
    if (validationError) {
      setError(validationError);
      return;
    }

    const newEstudiante = {
      cedula,
      primer_nombre: primerNombre,
      segundo_nombre: segundoNombre,
      primer_apellido: primerApellido,
      segundo_apellido: segundoApellido,
      fecha_nac: fechaNac,
      celular,
      tarjeta_de_ident: tarjetaDeIdent,
      lugar_de_nac: lugarDeNac,
      estado_nac: estadoNac,
      edo_civil: edoCivil,
      correo,
    };

    try {
      let response;
      if (estudiante) {
        // Actualizar estudiante existente
        response = await fetch(`http://localhost:3001/estudiantes/${estudiante.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newEstudiante),
        });
      } else {
        // Agregar nuevo estudiante
        response = await fetch('http://localhost:3001/estudiantes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newEstudiante),
        });
      }

      const savedEstudiante = await response.json();
      onClose(); // Cierra el modal
    } catch (error) {
      console.error('Error al guardar los datos:', error);
    }
  };

  return (
    <CForm onSubmit={handleSubmit}>
      <CContainer>
        {error && <CAlert color="danger">{error}</CAlert>}
        <label>Cédula</label>
        <CFormInput
          type="text"
          value={cedula}
          onChange={(e) => setCedula(e.target.value)}
          required
        />
        <label>Primer Nombre</label>
        <CFormInput
          type="text"
          value={primerNombre}
          onChange={(e) => setPrimerNombre(e.target.value)}
          required
        />
        <label>Segundo Nombre</label>
        <CFormInput
          type="text"
          value={segundoNombre}
          onChange={(e) => setSegundoNombre(e.target.value)}
        />
        <label>Primer Apellido</label>
        <CFormInput
          type="text"
          value={primerApellido}
          onChange={(e) => setPrimerApellido(e.target.value)}
          required
        />
        <label>Segundo Apellido</label>
        <CFormInput
          type="text"
          value={segundoApellido}
          onChange={(e) => setSegundoApellido(e.target.value)}
        />
        <label>Fecha de Nacimiento</label>
        <CFormInput
          type="date"
          value={fechaNac}
          onChange={(e) => setFechaNac(e.target.value)}
          required
        />
        <label>Celular</label>
        <CFormInput
          type="text"
          value={celular}
          onChange={(e) => setCelular(e.target.value)}
        />
        <label>Tarjeta de Identidad</label>
        <CFormInput
          type="text"
          value={tarjetaDeIdent}
          onChange={(e) => setTarjetaDeIdent(e.target.value)}
        />
        <label>Lugar de Nacimiento</label>
        <CFormInput
          type="text"
          value={lugarDeNac}
          onChange={(e) => setLugarDeNac(e.target.value)}
        />
        <label>Estado de Nacimiento</label>
        <CFormInput
          type="text"
          value={estadoNac}
          onChange={(e) => setEstadoNac(e.target.value)}
        />
        <label>Estado Civil</label>
        <CFormInput
          type="text"
          value={edoCivil}
          onChange={(e) => setEdoCivil(e.target.value)}
        />
        <label>Correo</label>
        <CFormInput
          type="email"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
        />
      </CContainer>

      <CButton type="submit" color="primary">
        {estudiante ? 'Guardar Cambios' : 'Agregar Estudiante'}
      </CButton>
      <CButton type="button" color="secondary" onClick={onClose} style={{ marginLeft: '10px' }}>
        Cancelar
      </CButton>
    </CForm>
  );
};

export default EstudianteForm;