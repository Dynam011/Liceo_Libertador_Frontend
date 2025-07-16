export const apiUrl = "http://localhost:4000";
export const registrarUsuario = async (datos) => {
  try {
    const respuesta = await fetch('http://localhost:4000/users', {  // Asegúrate de usar /users
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    });

    if (!respuesta.ok) throw new Error('Error en la solicitud');

    return await respuesta.json();
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    return null;
  }
};