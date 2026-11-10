import './style.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { iniciarSesion } from './api.js';
import { guardarSesion, limpiarSesion, rutaPorRol } from './auth.js';

// Al entrar al login se cierra cualquier sesión anterior
limpiarSesion();

const form = document.getElementById('form-login');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const error = document.getElementById('login-error');
  const boton = form.querySelector('button[type="submit"]');
  error.textContent = '';
  boton.disabled = true;

  try {
    const datos = await iniciarSesion(
      document.getElementById('login-usuario').value.trim(),
      document.getElementById('login-contrasenia').value
    );
    guardarSesion(datos);
    location.href = rutaPorRol(datos.usuario.rol);
  } catch (err) {
    error.textContent = err.message;
    boton.disabled = false;
  }
});
