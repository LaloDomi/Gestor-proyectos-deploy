// node-pg devuelve las columnas DATE como objetos Date; usar String(fecha)
// directo da formatos confusos ("Sun Jun 28 2026..."). Esto siempre da YYYY-MM-DD.
function fechaISO(valor) {
  if (valor instanceof Date) return valor.toISOString().slice(0, 10);
  return String(valor).slice(0, 10);
}

module.exports = { fechaISO };
