import React from 'react'


const AdminDashboard = React.lazy(() => import('./views/dashboard/AdminDashboard'))
const DocenteDashboard = React.lazy(() => import('./views/dashboard/DocenteDashboard'))
const GestorDashboard = React.lazy(() => import('./views/dashboard/GestorDashboard'))
const error = React.lazy(() => import('./views/pages/page404/Page404'))
const Docents = React.lazy(() => import('./views/pages/school/docents'))
const Estudiantes = React.lazy(() => import('./views/pages/school/estudiantes'))
const RegistroMateria = React.lazy(() => import('./views/pages/school/RegistroMateria'))
const RegistroDocente = React.lazy(() => import('./views/pages/school/RegistroDocente'))
const CargarNotas = React.lazy(() => import('./views/pages/school/CargarNotas'))
const AsignarMateriaDoc = React.lazy(() => import('./views/pages/school/AsignarMateriaDoc'))
const InscribirEstudiante = React.lazy(() => import('./views/pages/school/InscribirEstudiante'))
const ListadoInscripcion = React.lazy(() => import('./views/pages/school/ListadoInscripcion'))

const InscribirMateria = React.lazy(() => import('./views/pages/school/InscribirMateria'))
const AsignarMateriaAño = React.lazy(() => import('./views/pages/school/AsignarMateriaAño'))
const ConstanciaEst = React.lazy(() => import('./views/pages/school/ConstanciaEst'))
const Director = React.lazy(() => import('./views/pages/school/director'))
const ImprimirNotas = React.lazy(() => import('./views/pages/school/ImprimirNotas'))
const ConstanciaDoc = React.lazy(() => import('./views/pages/school/ConstanciaDoc'))
const Lista = React.lazy(() => import('./views/pages/school/lista'))
const Usuario = React.lazy(() => import('./views/pages/school/usuario'))
const Anioescolar = React.lazy(() => import('./views/pages/school/anioescolar'))
const editar = React.lazy(() => import('./views/pages/school/editar'))
const EditarEstudiante = React.lazy(() => import('./views/pages/school/EditarEstudiante'))
const Sabana = React.lazy(() => import('./views/pages/school/Sabana'))
const Administrador = React.lazy(() => import('./views/pages/school/administrador'))
const Cortes = React.lazy(() => import('./views/pages/school/cortes'))
const Boletin = React.lazy(() => import('./views/pages/school/boletin'))
const Secciones = React.lazy(() => import('./views/pages/school/secciones'))

const routes = [
  { path: '/', exact: true, name: 'Inicio' },
  { path: '/admin/dashboard', name: 'Panel', element: AdminDashboard},
  { path: '/docente/dashboard', name: 'Panel', element: DocenteDashboard},
  { path: '/gestor/dashboard', name: 'Panel', element: GestorDashboard},
  {path: '/404', name: 'Error 404', element: error },
  { path: '/registro/estudiante', name: 'Docentes', element: Docents },
  { path: '/estudiantes', name: 'Estudiantes', element: Estudiantes, private: true},
  { path: '/registro/materia', name: 'Registro Materia', element: RegistroMateria, private: true },
  { path: '/registro/docente', name: 'Registro Docente', element: RegistroDocente },
  { path: '/cargar/notas', name: 'Cargar Notas', element: CargarNotas, private: true },
  { path: '/materia/docente', name: 'Asignar Mat a Doc', element: AsignarMateriaDoc, private: true },
  { path: '/inscribir/estudiante', name: 'Inscribir Estudiante', element: InscribirEstudiante, private: true},
  { path: '/listado/inscripciones', name: 'Listado Inscripciones', element: ListadoInscripcion, private: true },

  { path: '/inscribir/materias', name: 'inscribir Materias', element: InscribirMateria, private: true },
  { path: '/materia/año', name: 'Asignar Materia a Año', element: AsignarMateriaAño, private: true },
  { path: '/constancia/estudiante', name: 'Constancia Estudiante', element: ConstanciaEst, private: true },
  { path: '/director', name: 'Director', element: Director },
  { path: '/imprimir/notas', name: 'Imprimir notas', element: ImprimirNotas , private: true},
  { path: '/constancia/docente', name: 'Constancia Docente', element: ConstanciaDoc },
  { path: '/lista', name: 'lista', element: Lista },
  { path: '/usuario', name: 'Usuario', element: Usuario },
 { path: '/anioescolar', name: 'Anio', element: Anioescolar },
 { path: '/editar', name: 'editar', element: editar },
{ path: '/EditarEstudiante', name: 'EditarEstudiante', element: EditarEstudiante },
{ path: '/Sabana', name: 'Sabana', element: Sabana },
{ path: '/administrador', name: 'Administrador', element: Administrador },
{ path: '/cortes', name: 'Cortes', element: Cortes },
{ path: '/boletin', name: 'boletin', element: Boletin },
{ path: '/secciones', name: 'boletin', element: Secciones },
]

export default routes
