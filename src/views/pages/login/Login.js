import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  CContainer,
  CRow,
  CCol,
  CCardGroup,
  CCard,
  CCardBody,
  CForm,
  CInputGroup,
  CInputGroupText,
  CFormInput,
  CButton,
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilUser, cilLockLocked } from '@coreui/icons';

const Login = () => {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [mensajeError, setMensajeError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:4000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario, contraseña }),
      });

      const data = await response.json();
      console.log("Respuesta del servidor:", data);

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("usuario", JSON.stringify({
          usuario: data.usuario,
          nombre: data.nombre,
          rol: data.rol
        }));

        // Si es docente, obtener materias asignadas
        if (data.rol === 'usuario') {
          try {
            const resMaterias = await fetch("http://localhost:4000/recibir", {
              headers: { Authorization: `Bearer ${data.token}` }
            });
            const materiasData = await resMaterias.json();
            // Suponiendo que el backend responde con { asignaciones: [{ materia: "Matemáticas" }, ...] }
            if (Array.isArray(materiasData.asignaciones)) {
              // Extraer solo los nombres de las materias
              const materias = materiasData.asignaciones
                .map(a => a.materia)
                .filter(Boolean);
              localStorage.setItem("materias_docente", JSON.stringify(materias));
            } else {
              localStorage.removeItem("materias_docente");
            }
          } catch (error) {
            localStorage.removeItem("materias_docente");
            console.error("Error al obtener materias del docente:", error);
          }
        } else {
          localStorage.removeItem("materias_docente");
        }

        // Navegar según el rol
        data.rol === 'admin'
          ? navigate("/admin/dashboard")
          : data.rol === 'usuario'
          ? navigate("/docente/dashboard")
          : data.rol === 'gestor'
          ? navigate("/gestor/dashboard")
          : navigate("/404");
      } else {
        setMensajeError(data.mensaje || "Error al iniciar sesión");
        setShowErrorModal(true);
      }
    } catch (error) {
      setMensajeError("Error al iniciar sesión");
      setShowErrorModal(true);
      console.error("Error al iniciar sesión:", error);
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-row align-items-center"
      style={{
        backgroundImage: "url('src/assets/images/liceo2.webp')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={8}>
            <CCardGroup>
              <CCard className="p-4" style={{ background: '#fff', borderRight: '4px solidrgb(54, 121, 255)' }}>
                <CCardBody>
                  <CForm onSubmit={handleLogin}>
                    <h1 className="text-black fw-bold mb-3">Iniciar Sesión</h1>
                    <p className="mb-4" style={{ color: '#1976D2', fontWeight: 500 }}>
                      Accede a la plataforma de gestión de estudios
                    </p>
                    <div className="mb-3 text-secondary" style={{ fontStyle: 'italic', fontSize: 15 }}>
                      "Comprometidos con la excelencia, formando líderes del mañana"
                    </div>
                    <CInputGroup className="mb-3">
                      <CInputGroupText style={{ background: '#114c5f', color: '#fff' }}>
                        <CIcon icon={cilUser} />
                      </CInputGroupText>
                      <CFormInput
                        placeholder="Usuario"
                        autoComplete="username"
                        value={usuario}
                        onChange={(e) => setUsuario(e.target.value)}
                      />
                    </CInputGroup>
                    <CInputGroup className="mb-4">
                      <CInputGroupText style={{ background: '#114c5f', color: '#fff' }}>
                        <CIcon icon={cilLockLocked} />
                      </CInputGroupText>
                      <CFormInput
                        type="password"
                        placeholder="Contraseña"
                        autoComplete="current-password"
                        value={contraseña}
                        onChange={(e) => setContraseña(e.target.value)}
                      />
                    </CInputGroup>
                    <CRow>
                      <CCol xs={6}>
                        <CButton color="info" className="px-4 text-white fw-bold" type="submit">
                          Ingresar
                        </CButton>
                      </CCol>
                      <CCol xs={6} className="text-end">
                        <CButton color="link" className="px-0 text-info">
                          <Link to="/lista">
                            ¿Olvidaste tu contraseña?
                          </Link>
                        </CButton>
                      </CCol>
                    </CRow>
                  </CForm>
                </CCardBody>
              </CCard>
              <CCard
                className="text-white py-5 d-none d-md-block"
                style={{
                  width: '44%',
                  background: '#114c5f',
                  border: 'none',
                }}
              >
                <CCardBody className="text-center d-flex flex-column justify-content-center align-items-center h-100">
                  <div>
                    <h2 className="fw-bold mb-3">¡Bienvenido!</h2>
                    <p className="mb-4" style={{ fontSize: 17 }}>
                      Únete a nuestra comunidad educativa y accede a todas las herramientas que ofrecemos para tu formación, Educación de calidad, conocimiento sin límites.
                    </p>
                    <Link to="/register">
                      <CButton color="light" className="mt-3 fw-bold text-black" active tabIndex={-1}>
                        ¡Regístrate ahora!
                      </CButton>
                    </Link>
                  </div>
                </CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
      {/* Modal de error */}
      <CModal visible={showErrorModal} onClose={() => setShowErrorModal(false)}>
        <CModalHeader closeButton>
          Error de inicio de sesión
        </CModalHeader>
        <CModalBody>
          {mensajeError}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowErrorModal(false)}>
            Cerrar
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  );
};

export default Login;