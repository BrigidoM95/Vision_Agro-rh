const express = require('express');
const path = require('path');
const indexRoutes = require('./routes/index_routes');
const rhRoutes = require('./routes/rh_routes');

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));
app.use('/', indexRoutes);
app.use('/rh', rhRoutes);
app.use((req, res) => res.status(404).send('Página não encontrada. <a href="/">Voltar ao início</a>'));

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Vision Agro demonstrativo em http://localhost:${PORT}`));
}

module.exports = app;
