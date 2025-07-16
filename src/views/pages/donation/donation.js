import React, { useState } from 'react';
import { CFormSelect } from '@coreui/react'
import DateDonation from '../donation/datedona.js'

import {
  CButton,
  CCol,
  CForm,
  CFormCheck,
  CFormInput,
  CFormLabel,
  CInputGroup,
  CInputGroupText,
} from '@coreui/react'


const Donations = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    monto: '',
    mensaje: ''
  });

  const handleChange = (e) => {
    setFormData({ 
      ...formData, 
      [e.target.name]: e.target.value 
    });
  };

 

  return (
    <div className="font">
      <h2 className="titulo">Formulario de Donación</h2>
      
        <input
          type="text"
          name="nombre"
          placeholder="Nombre Completo"
          value={formData.nombre}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded"
          required
        />
        
        <input
          type="email"
          name="correo"
          placeholder="Correo electrónico"
          value={formData.correo}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded"
          required
        />
        <input
          type="number"
          name="monto"
          placeholder="Monto a donar"
          value={formData.monto}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded"
          required
        />
          <CFormSelect
          aria-label="Default select example"
          options={[
            { label: 'Tipo de donante', value: '0' },
            { label: 'Persona', value: '1' },
            { label: 'Empresa', value: '2' },
           
          ]}
        />
        <CCol xs={12}>
        <CFormInput id="inputAddress"  placeholder="Direccion" />
      </CCol>
      <DateDonation/>
        <CCol xs="auto">
        <CButton color="primary" type="submit" className='boton'>
         DONAR
        </CButton>
      </CCol>
    
      
    </div>
  );
};

export default Donations;
