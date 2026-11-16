const express = require('express');
const router = express.Router();

// Acessar a raiz abre diretamente a página inicial do RH.
router.get('/', (req, res) => res.redirect('/rh'));

module.exports = router;
