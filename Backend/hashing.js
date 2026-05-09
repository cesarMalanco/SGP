// Script para generar el hash de las contraseñas
// Ejecutar este archivo con: node hash.js

const bcrypt = require('bcrypt');
const password = '';

bcrypt.hash(password, 10, (err, hash) => {
  if (err) throw err;
  console.log('Hash:', hash);
});