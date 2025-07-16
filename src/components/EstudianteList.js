import React, { useState, useEffect } from 'react';
import { CButton, CTable, CTableBody, CTableHead, CTableHeaderCell, CTableRow, CTableDataCell, CModal, CModalBody, CModalHeader, CModalTitle } from '@coreui/react';
import { CIcon } from '@coreui/icons-react';
import { cilTrash, cilPencil, cilPlus } from '@coreui/icons';
import EstudianteForm from './EstudianteForm';

const EstudianteList = () => {
    const [estudiantes, setEstudiantes] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedEstudiante, setSelectedEstudiante] = useState(null);

    // Obtener estudiantes desde JSON Server
    useEffect(() => {
        const fetchEstudiantes = async () => {
            try {
                const response = await fetch('http://localhost:3001/estudiantes');
                const data = await response.json();
                setEstudiantes(data);
            } catch (error) {
                console.error('Error al obtener los estudiantes:', error);
            }
        };

        fetchEstudiantes();
    }, []);

    const handleEdit = (estudiante) => {
        setSelectedEstudiante(estudiante);
        setShowModal(true); // Abre el modal de edición
    };

    const handleAdd = () => {
        setSelectedEstudiante(null); // Limpia el estudiante seleccionado
        setShowModal(true); // Abre el modal para agregar un nuevo estudiante
    };

    const handleSave = async (estudiante) => {
        try {
            if (selectedEstudiante) {
                // Actualizar estudiante existente
                await fetch(`http://localhost:3001/estudiantes/${selectedEstudiante.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(estudiante),
                });
                setEstudiantes((prev) =>
                    prev.map((item) =>
                        item.id === selectedEstudiante.id ? estudiante : item
                    )
                );
            } else {
                // Agregar nuevo estudiante
                const response = await fetch('http://localhost:3001/estudiantes', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(estudiante),
                });
                const newEstudiante = await response.json();
                setEstudiantes((prev) => [...prev, newEstudiante]);
            }
            setShowModal(false); // Cierra el modal
        } catch (error) {
            console.error('Error al guardar el estudiante:', error);
        }
    };

    const handleDelete = async (estudiante) => {
        try {
            await fetch(`http://localhost:3001/estudiantes/${estudiante.id}`, {
                method: 'DELETE',
            });
            setEstudiantes((prev) =>
                prev.filter((item) => item.id !== estudiante.id)
            );
        } catch (error) {
            console.error('Error al eliminar el estudiante:', error);
        }
    };

    return (
        <>
            <CButton color="success" onClick={handleAdd} style={{ marginBottom: '10px' }}>
                <CIcon icon={cilPlus} /> Agregar Estudiante
            </CButton>
            <CTable>
                <CTableHead>
                    <CTableRow>
                        <CTableHeaderCell size="sm">Primer nombre</CTableHeaderCell>
                        <CTableHeaderCell size="sm">Segundo nombre</CTableHeaderCell>
                        <CTableHeaderCell size="sm">Primer apellido</CTableHeaderCell>
                        <CTableHeaderCell size="sm">Segundo apellido</CTableHeaderCell>
                        <CTableHeaderCell size="sm">Cedula</CTableHeaderCell>
                        <CTableHeaderCell size="sm">Fecha de Nacimiento</CTableHeaderCell>
                        <CTableHeaderCell size="sm">Acciones</CTableHeaderCell>
                    </CTableRow>
                </CTableHead>
                <CTableBody>
                    {estudiantes.map((estudiante, index) => (
                        <CTableRow key={index}>
                            <CTableDataCell>{estudiante.primer_nombre}</CTableDataCell>
                            <CTableDataCell>{estudiante.segundo_nombre}</CTableDataCell>
                            <CTableDataCell>{estudiante.primer_apellido}</CTableDataCell>
                            <CTableDataCell>{estudiante.segundo_apellido}</CTableDataCell>
                            <CTableDataCell>{estudiante.cedula}</CTableDataCell>
                            <CTableDataCell>{estudiante.fecha_nac}</CTableDataCell>
                            <CTableDataCell>
                                <CButton
                                    color="primary"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEdit(estudiante)}
                                    style={{ marginRight: '10px' }}
                                >
                                    <CIcon icon={cilPencil} />
                                </CButton>
                                <CButton
                                    color="danger"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDelete(estudiante)}
                                >
                                    <CIcon icon={cilTrash} />
                                </CButton>
                            </CTableDataCell>
                        </CTableRow>
                    ))}
                </CTableBody>
            </CTable>

            {/* Modal para agregar/editar estudiante */}
            <CModal visible={showModal} onClose={() => setShowModal(false)}>
                <CModalHeader>
                    <CModalTitle>
                        {selectedEstudiante ? 'Editar Estudiante' : 'Agregar Estudiante'}
                    </CModalTitle>
                </CModalHeader>
                <CModalBody>
                    <EstudianteForm
                        estudiante={selectedEstudiante}
                        onSubmit={handleSave}
                        onClose={() => setShowModal(false)}
                    />
                </CModalBody>
            </CModal>
        </>
    );
};

export default EstudianteList;