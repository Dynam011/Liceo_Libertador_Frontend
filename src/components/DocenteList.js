import React from 'react';
import { CTable, CTableBody, CTableHead, CTableHeaderCell, CTableRow, CTableDataCell } from '@coreui/react';

const DocenteList = ({ docentes }) => {
    return (
        <CTable>
            <CTableHead>
                <CTableRow>
                    <CTableHeaderCell>Nombre</CTableHeaderCell>
                    <CTableHeaderCell>Detalles</CTableHeaderCell>
                </CTableRow>
            </CTableHead>
            <CTableBody>
                {docentes.map((docente, index) => (
                    <CTableRow key={index}>
                        <CTableDataCell>{docente.nombre}</CTableDataCell>
                        <CTableDataCell>{docente.detalles}</CTableDataCell>
                    </CTableRow>
                ))}
            </CTableBody>
        </CTable>
    );
};

export default DocenteList;