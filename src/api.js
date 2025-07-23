export const apiUrl = "https://liceo-libertador.onrender.com";
export const registrarUsuario = async (datos) => {
  try {
    const respuesta = await fetch('https://liceo-libertador.onrender.com/users', {  // Asegúrate de usar /users
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