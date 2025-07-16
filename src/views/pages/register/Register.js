import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    CForm,
    CRow,
    CCol,
    CFormInput,
    CFormSelect,
    CButton,
    CCard,
    CCardBody,
    CCardHeader
} from '@coreui/react';
import {apiUrl} from "../../../api"
const Formulario = () => {
    const [cedula, setCedula] = useState('');
    const [fkDocumento, setFkDocumento] = useState('');
    const [tiposDocumento, setTiposDocumento] = useState([]);
    const [nombres, setNombre] = useState('');
    const [apellidos, setApellidos] = useState('');
    const [direccion, setDireccion] = useState('');
    const [telefono, setTelefono] = useState('');
    const [sexo, setSexo] = useState('');
    const [fecha_nac, setFechaNacimiento] = useState('');
    const [usuario, setUsuario] = useState('');
    const [email, setEmail] = useState('');
    const [contraseña, setPassword] = useState('');
    const [repeatPassword, setRepeatPassword] = useState('');
    const navigate = useNavigate();

    // Cargar tipos de documento al montar
    useEffect(() => {
        const fetchTiposDocumento = async () => {
            try {
                const res = await fetch(apiUrl+'/tipos-documento');
                const data = await res.json();
                setTiposDocumento(data);
            } catch (error) {
                setTiposDocumento([]);
            }
        };
        fetchTiposDocumento();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (contraseña !== repeatPassword) {
            alert('Las contraseñas no coinciden');
            return;
        }
        if (!fkDocumento) {
            alert('Debe seleccionar un tipo de documento');
            return;
        }
        try {
            const response = await fetch(apiUrl+'/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    cedula,
                    fk_documento: fkDocumento,
                    nombres,
                    apellidos,
                    direccion,
                    telefono,
                    sexo,
                    fecha_nac,
                    usuario,
                    email,
                    contraseña
                })
            });

            if (response.ok) {
                alert('Usuario registrado correctamente');
                navigate('/login');
            } else {
                alert('Error al registrar el usuario');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al registrar el usuario');
        }
    };

    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundImage: "url('src/assets/images/liceo2.webp')",
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}
        >
            <CCard className="shadow" style={{ maxWidth: '800px', width: '100%' }}>
                <CCardHeader style={{
                    backgroundColor: '#114c5f',
                    textAlign: 'center',
                    color: 'white'
                }}>
                    <h4>Registro de Usuario</h4>
                </CCardHeader>
                <CCardBody>
                    <CForm onSubmit={handleSubmit}>
                        <CRow>
                            <CCol md={6}>
                                <CFormSelect
                                    label="Tipo de Documento"
                                    value={fkDocumento}
                                    onChange={e => setFkDocumento(e.target.value)}
                                    required
                                    className="mb-3"
                                >
                                    <option value="">Seleccione tipo de documento de Identidad</option>
                                    {tiposDocumento.map(td => (
                                        <option key={td.id_documento} value={td.id_documento}>
                                            {td.nombre}
                                        </option>
                                    ))}
                                </CFormSelect>
                                <CFormInput
                                    type="text"
                                    label="Documento de Identidad"
                                    placeholder="Ingrese Nro de Documento de Identidad"
                                    value={cedula}
                                    onChange={(e) => setCedula(e.target.value)}
                                    required
                                    className="mb-3"
                                />
                                <CFormInput
                                    type="text"
                                    label="Nombres"
                                    placeholder="Ingrese sus nombres"
                                    value={nombres}
                                    onChange={(e) => setNombre(e.target.value)}
                                    required
                                    className="mb-3"
                                />
                                <CFormInput
                                    type="text"
                                    label="Apellidos"
                                    placeholder="Ingrese sus apellidos"
                                    value={apellidos}
                                    onChange={(e) => setApellidos(e.target.value)}
                                    required
                                    className="mb-3"
                                />
                                <CFormInput
                                    type="text"
                                    label="Dirección"
                                    placeholder="Ingrese su dirección"
                                    value={direccion}
                                    onChange={(e) => setDireccion(e.target.value)}
                                    className="mb-3"
                                />
                                <CFormInput
                                    type="text"
                                    label=" Nro Celular"
                                    placeholder="Ingrese su Celular"
                                    value={telefono}
                                    onChange={(e) => setTelefono(e.target.value)}
                                    className="mb-3"
                                />
                                <CFormSelect
                                    label="Sexo"
                                    value={sexo}
                                    onChange={(e) => setSexo(e.target.value)}
                                    required
                                    className="mb-3"
                                >
                                    <option value="">Seleccione sexo</option>
                                    <option value="M">Masculino</option>
                                    <option value="F">Femenino</option>
                                   
                                </CFormSelect>
                            </CCol>
                            <CCol md={6}>
                                <CFormInput
                                    type="date"
                                    label="Fecha de nacimiento"
                                    placeholder="Fecha de nacimiento"
                                    value={fecha_nac}
                                    onChange={(e) => setFechaNacimiento(e.target.value)}
                                    required
                                    className="mb-3"
                                />
                                <CFormInput
                                    type="text"
                                    label="Usuario"
                                    placeholder="Ingrese su usuario"
                                    value={usuario}
                                    onChange={(e) => setUsuario(e.target.value)}
                                    required
                                    className="mb-3"
                                />
                                <CFormInput
                                    type="email"
                                    label="Correo eléctronico"
                                    placeholder="Ingrese su correo"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="mb-3"
                                />
                                <CFormInput
                                    type="password"
                                    label="Contraseña"
                                    placeholder="Ingrese su contraseña"
                                    value={contraseña}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="mb-3"
                                />
                                <CFormInput
                                    type="password"
                                    label="Repetir contraseña"
                                    placeholder="Repita su contraseña"
                                    value={repeatPassword}
                                    onChange={(e) => setRepeatPassword(e.target.value)}
                                    required
                                    className="mb-3"
                                />
                            </CCol>
                        </CRow>
                        <div className="text-center">
                            <CButton type="submit" style={{
                                backgroundColor: '#114c5f',
                                color: 'white',
                                marginRight: '10px'
                            }}>
                                Enviar
                            </CButton>
                            <CButton
                                type="button"
                                color="secondary"
                                onClick={() => navigate('/login')}
                            >
                                Regresar al Login
                            </CButton>
                        </div>
                    </CForm>
                </CCardBody>
            </CCard>
        </div>
    );
};

export default Formulario;