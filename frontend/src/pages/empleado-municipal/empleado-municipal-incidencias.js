import '../../style.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import * as bootstrap from 'bootstrap';
import {
  listarIncidencias, crearIncidencia, cancelarIncidencia, listarArticulos, urlArchivo,
} from '../../api.js';
import { badgeEstado, alerta, filaMensaje } from '../../ui.js';
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
    filaMensaje(tbody, 6, 'Todavía no registraste incidencias.');
    return;
  }

  tbody.textContent = '';

  incidencias.forEach((inc) => {
    const cancelable = inc.estado === 'Pendiente';
    const tr = document.createElement('tr');

    const tdId = document.createElement('td');
    tdId.className = 'ps-3 fw-bold';
    tdId.textContent = `#${inc.id_incidencia}`;

    const tdArticulo = document.createElement('td');
    tdArticulo.textContent = inc.articulo;

    const tdDescripcion = document.createElement('td');
    tdDescripcion.textContent = inc.descripcion_pedido;

    if (inc.imagen) {
      const enlaceImagen = document.createElement('a');
      enlaceImagen.href = urlArchivo(inc.imagen);
      enlaceImagen.target = '_blank';
      enlaceImagen.rel = 'noopener';
      enlaceImagen.className = 'd-block small';
      enlaceImagen.textContent = 'Ver imagen';
      tdDescripcion.appendChild(enlaceImagen);
    }

    const tdPrioridad = document.createElement('td');
    const badgePrioridad = document.createElement('span');
    badgePrioridad.className = 'badge bg-light text-dark border';
    badgePrioridad.textContent = inc.prioridad_texto;
    tdPrioridad.appendChild(badgePrioridad);

    const tdEstado = document.createElement('td');
    const spanEstado = document.createElement('span');
    spanEstado.className = `badge ${badgeEstado(inc.estado)}`;
    spanEstado.textContent = inc.estado;
    tdEstado.appendChild(spanEstado);

    const tdAccion = document.createElement('td');
    tdAccion.className = 'text-end pe-3';

    const btnCancelar = document.createElement('button');
    btnCancelar.className = 'btn btn-outline-danger btn-sm';
    btnCancelar.textContent = 'Cancelar';
    btnCancelar.disabled = !cancelable;
    btnCancelar.addEventListener('click', () => cancelar(inc.id_incidencia));

    tdAccion.appendChild(btnCancelar);
    tr.append(tdId, tdArticulo, tdDescripcion, tdPrioridad, tdEstado, tdAccion);
    tbody.appendChild(tr);
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
    select.textContent = '';

    const optInicial = document.createElement('option');
    optInicial.value = '';
    optInicial.disabled = true;
    optInicial.selected = true;
    optInicial.textContent = 'Seleccione un artículo...';
    select.appendChild(optInicial);

    articulos.forEach((a) => {
      const option = document.createElement('option');
      option.value = a.id_articulo;
      option.textContent = a.descripcion;
      select.appendChild(option);
    });
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
      imagen: document.getElementById('input-imagen').files[0] || null,
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
