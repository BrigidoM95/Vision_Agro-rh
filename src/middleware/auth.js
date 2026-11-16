const crypto = require('crypto');
const rhController = require('../controllers/rh_controller');

const COOKIE_NAME = 'vision_agro_auth';
const DURACAO = 12 * 60 * 60 * 1000;
const segredo = () => process.env.LOGIN_SECRET || 'vision-agro-demo-secret-altere-na-vercel';

function assinatura(valor) {
  return crypto.createHmac('sha256', segredo()).update(valor).digest('hex');
}

function criarToken(email) {
  const payload = Buffer.from(`${email}|${Date.now() + DURACAO}`).toString('base64url');
  return `${payload}.${assinatura(payload)}`;
}

function tokenValido(token) {
  if (!token || !token.includes('.')) return false;
  const [payload, recebido] = token.split('.');
  const esperado = assinatura(payload);
  const a = Buffer.from(recebido || '');
  const b = Buffer.from(esperado);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;
  try {
    const [email, validade] = Buffer.from(payload, 'base64url').toString().split('|');
    return Boolean(email && Number(validade) > Date.now() && rhController.emailCadastrado(email));
  } catch { return false; }
}

function exigirLogin(req, res, next) {
  const cookies = Object.fromEntries((req.headers.cookie || '').split(';').filter(Boolean).map(item => {
    const pos = item.indexOf('=');
    return [item.slice(0, pos).trim(), decodeURIComponent(item.slice(pos + 1).trim())];
  }));
  if (tokenValido(cookies[COOKIE_NAME])) return next();
  res.redirect('/login');
}

function definirLogin(res, email) {
  res.cookie(COOKIE_NAME, criarToken(email), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL),
    sameSite: 'lax',
    maxAge: DURACAO,
    path: '/'
  });
}

module.exports = { exigirLogin, definirLogin, COOKIE_NAME };
