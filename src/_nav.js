import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilSpeedometer, cilUserPlus, cilUser, cilUserX, cilRain, cilBook, cilClipboard, cilHome,
  cilBuilding, cilBullhorn, cilGift, cilInstitution, cilList, cilWarning, cilCloudUpload,
  cilHeart, cilEducation, cilPeople, cilUserFemale, cilPen, cilCalendar, cilCheckCircle,
  cilAddressBook, cilLibrary,cilLibraryAdd,cilPlaylistAdd,cilWindowRestore, cilPencil, cilPaperclip, cilNotes, cilHappy, cilCopy,cilExternalLink,cilNoteAdd,cilLockLocked,cilApplications,cilColorBorder
} from '@coreui/icons'
import { CNavItem, CNavTitle, CNavGroup } from '@coreui/react'

export default function getNav() {
  const usuarioGuardado = localStorage.getItem('usuario');
  const rol = usuarioGuardado
    ? (JSON.parse(usuarioGuardado).rol || 'usuario').toLowerCase().trim()
    : 'usuario';

  // Leer materias del docente desde localStorage
  const materiasDocente = JSON.parse(localStorage.getItem('materias_docente') || '[]');
  const tieneOrientacion = materiasDocente.some(
    m => m && m.toLowerCase().includes('orientación y convivencia')
  );

  return [
    ...(rol === 'usuario'
      ? [{
        component: CNavItem,
        name: 'Dashboard',
        to: '/docente/dashboard',
        icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
      }]
      : []),
    ...(rol === 'admin'
      ? [{
        component: CNavItem,
        name: 'Dashboard',
        to: '/admin/dashboard',
        icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
      }]
      : []),
          ...(rol === 'gestor'
      ? [{
        component: CNavItem,
        name: 'Dashboard',
        to: '/gestor/dashboard',
        icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
      }]
      : []),

    {
      component: CNavTitle,
      name: 'GESTIÓN ADMINISTRATIVA',
    },




       ...(rol === 'admin'
      ? [{
        component: CNavGroup,
        name: 'Materias',
        icon: <CIcon icon={cilWindowRestore} customClassName="nav-icon" />,
        
        items: [
          {
            component: CNavItem,
            name: 'Registrar',
            to: '/registro/materia',
            icon: <CIcon icon={cilLibraryAdd} customClassName="nav-icon" />,
          },
          
          {
            component: CNavItem,
            name: 'Asignarle Año ',
            to: '/materia/año',
            icon: <CIcon icon={cilEducation} customClassName="nav-icon" />,
          },
          
        ]
      }]
      : []),


  // Agrupación de módulos de docentes
    ...(rol === 'admin'
      ? [{
        component: CNavGroup,
        name: 'Docentes',
        icon: <CIcon  icon={cilPencil} customClassName="nav-icon" />,
        items: [

           {
            component: CNavItem,
            name: 'Nuevo',
            to: '/registro/docente',
            icon: <CIcon icon={cilExternalLink} customClassName="nav-icon" />,
          },
          
          {
            component: CNavItem,
            name: 'Asignar Materias',
            to: '/materia/docente',
            icon: <CIcon icon={cilBook} customClassName="nav-icon" />,
          },
          {
            component: CNavItem,
            name: 'Materias Asignadas',
            to: '/editar',
            icon: <CIcon icon={cilPaperclip} customClassName="nav-icon" />,
          },
          {
            component: CNavItem,
            name: 'Constancia de Trabajo',
            to: '/constancia/docente',
            icon: <CIcon icon={cilCopy} customClassName="nav-icon" />,
          },
        ]
      }]
      : []),




    // Agrupación de módulos de estudiantes
    ...(rol === 'admin'
      ? [{
        component: CNavGroup,
        name: 'Estudiantes',
        icon: <CIcon icon={cilPeople} customClassName="nav-icon" />,
        items: [

          {
            component: CNavItem,
            name: 'Agregar',
            to: '/registro/estudiante',
            icon: <CIcon icon={cilNoteAdd} customClassName="nav-icon" />,
            
          },
          
          {
            component: CNavItem,
            name: 'Generar inscripción',
            to: '/inscribir/materias',
            icon: <CIcon icon={cilCloudUpload} customClassName="nav-icon" />,
          },
          {
            component: CNavItem,
            name: 'Listado de Inscripciones',
            to: '/listado/inscripciones',
            icon: <CIcon icon={cilList} customClassName="nav-icon" />,
          },
          {
            component: CNavItem,
            name: 'Listado de Estudiantes',
            to: '/EditarEstudiante',
            icon: <CIcon icon={cilNotes} customClassName="nav-icon" />,
          },
          {
            component: CNavItem,
            name: 'Constancia de Estudio',
            to: '/constancia/estudiante',
            icon: <CIcon icon={cilCheckCircle} customClassName="nav-icon" />,
          },
        ]
      }]
      : []),

          // Agrupación de módulos de estudiantes
    ...(rol === 'gestor'
      ? [{
        component: CNavGroup,
        name: 'Estudiantes',
        icon: <CIcon icon={cilPeople} customClassName="nav-icon" />,
        items: [

          {
            component: CNavItem,
            name: 'Agregar',
            to: '/registro/estudiante',
            icon: <CIcon icon={cilNoteAdd} customClassName="nav-icon" />,
            
          },
          
          {
            component: CNavItem,
            name: 'Generar inscripción',
            to: '/inscribir/materias',
            icon: <CIcon icon={cilCloudUpload} customClassName="nav-icon" />,
          },
          {
            component: CNavItem,
            name: 'Listado de Inscripciones',
            to: '/listado/inscripciones',
            icon: <CIcon icon={cilList} customClassName="nav-icon" />,
          },
          {
            component: CNavItem,
            name: 'Listado de Estudiantes',
            to: '/EditarEstudiante',
            icon: <CIcon icon={cilNotes} customClassName="nav-icon" />,
          },
        
        ]
      }]
      : []),



      
    ...(rol === 'admin'
      ? [{
        component: CNavGroup,
        name: 'Gestionar',
        icon: <CIcon icon={cilLockLocked} customClassName="nav-icon" />,
        items: [
          {
          component: CNavItem,
          name: 'Generar Sabana',
          to: '/Sabana',
          icon: <CIcon icon={cilClipboard} customClassName="nav-icon" />,
        },
        {
          component: CNavItem,
          name: 'Editar Usuarios',
          to: '/usuario',
          icon: <CIcon icon={cilHappy} customClassName="nav-icon" />,
        },
        {
          component: CNavItem,
          name: 'Editar Notas',
          to: '/administrador',
          icon: <CIcon icon={cilApplications} customClassName="nav-icon" />,
        },
        {
          component: CNavItem,
              name: 'Generar Boletin',
              to: '/boletin',
              icon: <CIcon icon={cilBullhorn} customClassName="nav-icon" />
        },
          {
          component: CNavItem,
              name: 'Crear Sección',
              to: '/secciones',
              icon: <CIcon icon={cilColorBorder} customClassName="nav-icon" />
        },
        ]
      }]
      : []),

      // gestor 
          ...(rol === 'gestor'
      ? [{
        component: CNavGroup,
        name: 'Gestionar',
        icon: <CIcon icon={cilLockLocked} customClassName="nav-icon" />,
        items: [
          {
          component: CNavItem,
          name: 'Momento Académico',
          to: '/cortes',
          icon: <CIcon icon={cilCalendar} customClassName="nav-icon" />,
        },
          {
          component: CNavItem,
          name: 'Generar Sabana',
          to: '/Sabana',
          icon: <CIcon icon={cilClipboard} customClassName="nav-icon" />,
        },
        
        {
          component: CNavItem,
          name: 'Editar Notas',
          to: '/administrador',
          icon: <CIcon icon={cilApplications} customClassName="nav-icon" />,
        },
        ]
      }]
      : []),





    // Menú para usuario docente
    ...(rol === 'usuario'
      ? [
        {
          component: CNavItem,
          name: 'Cargar Notas',
          to: '/cargar/notas',
          icon: <CIcon icon={cilCloudUpload} customClassName="nav-icon" />,
        },
        {
          component: CNavItem,
          name: 'Imprimir Notas',
          to: '/imprimir/notas',
          icon: <CIcon icon={cilClipboard} customClassName="nav-icon" />,
        },
        // Solo si tiene la materia especial
        /*
        ...(tieneOrientacion
          ? [{
              component: CNavItem,
              name: 'Generar Boletin',
              to: '/boletin',
              icon: <CIcon icon={cilBullhorn} customClassName="nav-icon" />,
            }]
          : []),*/
      ]
      : []),



      ...(rol === 'admin'
      ? [{
        component: CNavGroup,
        name: 'Nuevo',
        icon: <CIcon icon={cilLibrary} customClassName="nav-icon" />,
        items: [
        {
          component: CNavItem,
          name: 'Año Escolar',
          to: '/anioescolar',
          icon: <CIcon icon={cilCalendar} customClassName="nav-icon" />,
        },
        {
          component: CNavItem,
          name: 'Momento Académico',
          to: '/cortes',
          icon: <CIcon icon={cilCalendar} customClassName="nav-icon" />,
        },
        {
          component: CNavItem,
          name: 'Director',
          to: '/director',
          icon: <CIcon icon={cilUserFemale} customClassName="nav-icon" />,
        },
          
        ]
      }]
      : []),
  ]
}