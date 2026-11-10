import '../../style.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import * as bootstrap from 'bootstrap';
import {
  listarIncidencias, crearIncidencia, cancelarIncidencia, listarArticulos,
} from '../../api.js';
import { escaparHTML, badgeEstado, alerta } from '../../ui.js';
import { requerirSesion } from '../../auth.js';

const usuario = requerirSesion(1);
if (!usuario) await new Promise(() => {});

const ID_USUARIO = usuario.id_usuario;

const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('modalNuevaIncidencia'));
let incidencias = [];

function renderizarTabla() {
  const tbody = document.getElementById('tabla-mis-incidencias');
  if (!tbody) return;

  if (!incidencias.length) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">Todavía no registraste incidencias.</td></tr>`;
    return;
  }

  tbody.innerHTML = incidencias.map((inc) => {
    const cancelable = inc.estado === 'Pendiente';
    return `
      <tr>
        <td class="ps-3 fw-bold">#${inc.id_incidencia}</td>
        <td>${escaparHTML(inc.articulo)}</td>
        <td>${escaparHTML(inc.descripcion_pedido)}</td>
        <td><span class="badge bg-light text-dark border">${escaparHTML(inc.prioridad_texto)}</span></td>
        <td><span class="badge ${badgeEstado(inc.estado)}">${escaparHTML(inc.estado)}</span></td>
        <td class="text-end pe-3">
          <button class="btn btn-outline-danger btn-sm btn-cancelar" data-id="${inc.id_incidencia}" ${cancelable ? '' : 'disabled'}>
            Cancelar
          </button>
        </td>
      </tr>
    `;
  }).join('');

  document.querySelectorAll('.btn-cancelar').forEach((btn) => {
    btn.addEventListener('click', () => cancelar(Number(btn.dataset.id)));
  });
}

async function cargarIncidencias() {
  try {
    incidencias = await listarIncidencias({ creado_por: ID_USUARIO });
    renderizarTabla();
  } catch (error) {
    alerta('alerta-inc', error.message, 'danger');
  }
}

async function cargarSelectArticulos() {
  const select = document.getElementById('select-articulo');
  try {
    const articulos = await listarArticulos();
    select.innerHTML = `<option value="" disabled selected>Seleccione un artículo...</option>` +
      articulos.map((a) => `<option value="${a.id_articulo}">${escaparHTML(a.descripcion)}</option>`).join('');
  } catch (error) {
    alerta('alerta-inc', error.message, 'danger');
  }
}

async function cancelar(id) {
  if (!confirm(`¿Cancelar la incidencia #${id}?`)) return;
  try {
    await cancelarIncidencia(id);
    alerta('alerta-inc', 'Incidencia cancelada');
    cargarIncidencias();
  } catch (error) {
    alerta('alerta-inc', error.message, 'danger');
  }
}

document.getElementById('form-nueva-incidencia').addEventListener('submit', async (e) => {
  e.preventDefault();
  const boton = e.target.querySelector('button[type="submit"]');
  boton.disabled = true;

  try {
    await crearIncidencia({
      id_articulo: Number(document.getElementById('select-articulo').value),
      prioridad: Number(document.getElementById('select-prioridad').value),
      descripcion_pedido: document.getElementById('input-descripcion').value.trim(),
      creado_por: ID_USUARIO,
    });
    modal.hide();
    e.target.reset();
    alerta('alerta-inc', 'Incidencia registrada');
    cargarIncidencias();
  } catch (error) {
    alerta('alerta-inc', error.message, 'danger');
  } finally {
    boton.disabled = false;
  }
});

cargarSelectArticulos();
cargarIncidencias();
