import React, { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  CContainer,
  CHeader,
  CHeaderNav,
  CHeaderToggler,
  CNavItem,
  CButton,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilMenu,
  cilAccountLogout,
} from '@coreui/icons'

const AppHeader = () => {
  const headerRef = useRef()
  const dispatch = useDispatch()
  const sidebarShow = useSelector((state) => state.sidebarShow)
  const navigate = useNavigate()

  useEffect(() => {
    document.addEventListener('scroll', () => {
      headerRef.current &&
        headerRef.current.classList.toggle('shadow-sm', document.documentElement.scrollTop > 0)
    })
  }, [])

  const usuario = localStorage.getItem('usuario')

  const handleLogout = () => {
    localStorage.clear()
    localStorage.removeItem("usuario");
    localStorage.removeItem("token");
    navigate('/login')
  }

  const handleLogin = () => {
    navigate('/login')
  }

  return (
    <CHeader position="sticky" className="mb-4 p-0" ref={headerRef} style={{
      background: '#114c5f',
      color:'white',
    }}>
      <CContainer className="border-bottom px-4" fluid>
        <CHeaderToggler
          onClick={() => dispatch({ type: 'set', sidebarShow: !sidebarShow })}
          style={{ marginInlineStart: '-14px', color: 'white' }}
        >
          <CIcon icon={cilMenu} size="lg" />
        </CHeaderToggler>
        <div className="text-secondary " style={{ fontStyle: 'italic', fontSize: 15 }}>
          <span style={{
            color:'white'
          }}>"Comprometidos con la excelencia, formando líderes del mañana"</span>
        </div>
        <CHeaderNav className="ms-auto" style={{ gap: 12 }}>
          <CNavItem>
            {usuario ? (
              <CButton color="danger" variant="outline" onClick={handleLogout} style={{marginTop:'0'}}>
                <CIcon icon={cilAccountLogout} className="me-2" />
                Cerrar sesión
              </CButton>
            ) : (
              <CButton color="primary" variant="outline" onClick={handleLogin}>
                <CIcon icon={cilAccountLogout} className="me-2" />
                Iniciar sesión
              </CButton>
            )}
          </CNavItem>
        </CHeaderNav>
      </CContainer>
      <CContainer className="px-4" fluid>
        {/* Puedes agregar más contenido aquí si lo necesitas */}
      </CContainer>
    </CHeader>
  )
}

export default AppHeader