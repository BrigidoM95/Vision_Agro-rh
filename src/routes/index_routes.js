const express = require('express');
const router = express.Router();
const rhController = require('../controllers/rh_controller');
const { definirLogin, COOKIE_NAME } = require('../middleware/auth');

router.get('/', (req, res) => res.redirect('/login'));
router.get('/login', (req, res) => res.render('login', { erro: null, email: '' }));
router.post('/login', (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const senha = String(req.body.senha || '');
  if (senha !== '1234' || !rhController.emailCadastrado(email)) {
    return res.status(401).render('login', { erro: 'E-mail ou senha inválidos. Confira seus dados e tente novamente.', email });
  }
  definirLogin(res, email);
  res.redirect('/rh');
});
router.post('/logout', (req, res) => {
  res.clearCookie(COOKIE_NAME, { path: '/' });
  res.redirect('/login');
});

module.exports = router;
