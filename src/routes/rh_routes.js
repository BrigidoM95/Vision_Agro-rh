const express = require('express');
const rhController = require('../controllers/rh_controller');
const router = express.Router();

router.get('/', (req, res) => res.render('rh/index'));
router.get('/colaboradores', rhController.listarColaboradores);
router.get('/colaboradores/novo', rhController.novoColaborador);
router.post('/colaboradores', rhController.cadastrarColaborador);
router.get('/colaboradores/:id/editar', rhController.editarColaborador);
router.post('/colaboradores/:id/editar', rhController.atualizarColaborador);
router.post('/colaboradores/:id/excluir', rhController.excluirColaborador);
router.get('/departamentos', rhController.listarDepartamentos);
router.get('/treinamentos', rhController.listarTreinamentos);
router.post('/treinamentos', rhController.cadastrarTreinamento);
router.post('/treinamentos/:id/excluir', rhController.excluirTreinamento);
router.get('/ferias', rhController.listarFerias);
router.post('/ferias', rhController.cadastrarFerias);
router.post('/ferias/:id/excluir', rhController.excluirFerias);
router.get('/folha-pagamento', rhController.folhaPagamento);

module.exports = router;