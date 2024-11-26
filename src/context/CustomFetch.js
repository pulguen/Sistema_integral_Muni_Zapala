// customFetch.js
import Swal from 'sweetalert2';

const API_BASE_URL = process.env.REACT_APP_API_URL;

const customFetch = async (endpoint, method = 'GET', body = null) => {
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json', // Se asegura solicitar JSON
    Authorization: token ? `Bearer ${token}` : '',
  };

  const options = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body); // Convierte el cuerpo a JSON
  }

  try {
    const url = `${API_BASE_URL}${endpoint}`;

    const response = await fetch(url, options);
    const responseText = await response.text();

    // Verifica si la respuesta es HTML, lo que podría indicar redirección
    if (response.headers.get('content-type')?.includes('text/html')) {
      throw new Error('El servidor devolvió HTML en lugar de JSON. Esto sugiere un problema de configuración en el servidor o una redirección inesperada.');
    }

    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem('token');
      window.dispatchEvent(new Event('tokenExpired'));
      await Swal.fire({
        icon: 'error',
        title: 'Sesión expirada',
        text: 'Tu sesión ha expirado. Por favor, vuelve a iniciar sesión.',
      });
      return;
    }

    if (response.status === 422) {
      const errorData = JSON.parse(responseText);
      throw new Error(`Error 422: ${errorData.message}`);
    }

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${responseText}`);
    }

    return JSON.parse(responseText); // Convierte a JSON si la respuesta es JSON

  } catch (error) {
    console.error('Error en la petición:', error.message);

    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: error.message,
    });

    throw error;
  }
};

export default customFetch;
