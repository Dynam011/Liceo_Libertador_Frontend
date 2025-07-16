import React, { useState } from 'react';
import { CButton, CCol, CForm, CFormInput } from '@coreui/react';

const DocenteForm = ({ onAddDocente, onClose }) => {
    const [nombre, setNombre] = useState('');
    const [detalles, setDetalles] = useState('');
    const [cedula, setCedula] = useState('');
    const [telefono, setTelefono] = useState('');
    const [anioNacimiento, setAnioNacimiento] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (nombre && detalles && cedula && telefono && anioNacimiento) {
            onAddDocente({ nombre, detalles, cedula, telefono, anioNacimiento });
            setNombre('');
            setDetalles('');
            setCedula('');
            setTelefono('');
            setAnioNacimiento('');
            onClose(); // Cierra el modal después de agregar el docente
        }
    };

    return (
        <CForm onSubmit={handleSubmit}>
            <CCol className="mb-3">
                <label htmlFor="nombre">Nombre</label>
                <CFormInput
                    type="text"
                    id="nombre"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                />
            </CCol>
            <CCol className="mb-3">
                <label htmlFor="detalles">Detalles</label>
                <CFormInput
                    type="text"
                    id="detalles"
                    value={detalles}
                    onChange={(e) => setDetalles(e.target.value)}
                    required
                />
            </CCol>
            <CCol className="mb-3">
                <label htmlFor="cedula">Cédula</label>
                <CFormInput
                    type="text"
                    id="cedula"
                    value={cedula}
                    onChange={(e) => setCedula(e.target.value)}
                    required
                />
            </CCol>
            <CCol className="mb-3">
                <label htmlFor="telefono">Número Telefónico</label>
                <CFormInput
                    type="text"
                    id="telefono"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    required
                />
            </CCol>
            <CCol className="mb-3">
                <label htmlFor="anioNacimiento">Año de Nacimiento</label>
                <CFormInput
                    type="number"
                    id="anioNacimiento"
                    value={anioNacimiento}
                    onChange={(e) => setAnioNacimiento(e.target.value)}
                    required
                />
            </CCol>
            <CButton type="submit" color="primary">
                Agregar Docente
            </CButton>
        </CForm>
    );
};

export default DocenteForm;