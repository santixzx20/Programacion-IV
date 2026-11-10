import PDFDocument from 'pdfkit';

const fecha = (valor) => new Date(valor).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' });
const recortar = (texto, max) => {
  const t = String(texto ?? '');
  return t.length > max ? `${t.slice(0, max - 1)}…` : t;
};

const COLUMNAS = [
  { titulo: 'ID', ancho: 40, valor: (i) => `#${i.id_incidencia}` },
  { titulo: 'Fecha', ancho: 105, valor: (i) => fecha(i.creado) },
  { titulo: 'Artículo', ancho: 150, valor: (i) => recortar(i.articulo, 34) },
  { titulo: 'Descripción', ancho: 220, valor: (i) => recortar(i.descripcion_pedido, 55) },
  { titulo: 'Estado', ancho: 90, valor: (i) => i.estado },
  { titulo: 'Prioridad', ancho: 70, valor: (i) => i.prioridad_texto },
];

export function generarReporte(incidencias) {
  const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 40 });

  doc.fontSize(18).text('Gestor de Incidencias - Reporte', { align: 'center' });
  doc.moveDown(0.2);
  doc.fontSize(9).fillColor('#555').text(`Generado: ${fecha(new Date())}  |  Total: ${incidencias.length}`, { align: 'center' });
  doc.moveDown(0.8).fillColor('#000');

  const dibujarCabecera = () => {
    let x = 40;
    const y = doc.y;
    doc.fontSize(9).font('Helvetica-Bold');
    COLUMNAS.forEach((c) => { doc.text(c.titulo, x, y, { width: c.ancho }); x += c.ancho; });
    doc.font('Helvetica');
    doc.moveDown(0.4);
    doc.moveTo(40, doc.y).lineTo(802, doc.y).stroke();
    doc.moveDown(0.3);
  };

  dibujarCabecera();

  incidencias.forEach((i) => {
    if (doc.y > 540) {
      doc.addPage();
      dibujarCabecera();
    }
    let x = 40;
    const y = doc.y;
    doc.fontSize(8);
    COLUMNAS.forEach((c) => { doc.text(c.valor(i), x, y, { width: c.ancho }); x += c.ancho; });
    doc.moveDown(0.6);
  });

  if (!incidencias.length) {
    doc.fontSize(10).fillColor('#777').text('No hay incidencias para los filtros seleccionados.', { align: 'center' });
  }

  doc.end();
  return doc;
}
