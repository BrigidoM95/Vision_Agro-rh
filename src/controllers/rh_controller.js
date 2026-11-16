// Dados demonstrativos em memória: esta versão é somente para apresentação do frontend.
// Qualquer cadastro/edição/exclusão é temporário e será perdido quando a função reiniciar.
const departamentos = [
  { id: 1, nome: 'Financeiro', descricao: 'Responsável pela gestão financeira da Vision Agro' },
  { id: 2, nome: 'Marketing', descricao: 'Responsável pelas ações de divulgação da Vision Agro' },
  { id: 3, nome: 'Vendas', descricao: 'Responsável pelo processo comercial da Vision Agro' },
  { id: 4, nome: 'Clientes', descricao: 'Responsável pelo atendimento aos clientes da Vision Agro' },
  { id: 5, nome: 'Recursos Humanos', descricao: 'Responsável pela gestão de pessoas da Vision Agro' }
];

let colaboradores = [
  { id: 1, nome: 'Jão', email: 'jao@visionagro.com', telefone: '(67) 99999-1111', cargo: 'Analista de RH', salario: 1999.98, data_admissao: '2025-02-10', status: 'Ativo', departamento_id: 2 },
  { id: 2, nome: 'Biu', email: 'biu@visionagro.com', telefone: '(67) 99999-2222', cargo: 'Assistente Administrativo', salario: 10000, data_admissao: '2025-04-15', status: 'Ativo', departamento_id: 5 },
  { id: 3, nome: 'Games edu', email: 'games@visionagro.com', telefone: '(67) 99999-3333', cargo: 'Analista Financeiro', salario: 11, data_admissao: '2024-08-20', status: 'Ativo', departamento_id: 1 },
  { id: 4, nome: 'Biu', email: 'bia@gmail.com', telefone: '(67) 99999-2222', cargo: 'Assistente Administrativo', salario: 10000, data_admissao: '2025-04-15', status: 'Inativo', departamento_id: 5 }
];
let treinamentos = [];
let ferias = [];
let proximoColaborador = 5, proximoTreinamento = 1, proximaFerias = 1;

const pad = n => String(n).padStart(2, '0');
const dataBR = s => s ? s.split('-').reverse().join('/') : '—';
const dataValida = s => /^\d{4}-\d{2}-\d{2}$/.test(s || '') && !Number.isNaN(Date.parse(`${s}T00:00:00`));
const horaValida = s => /^([01]\d|2[0-3]):[0-5]\d$/.test(s || '');
const somarDias = (s, n) => { const [a,m,d] = s.split('-').map(Number); return new Date(Date.UTC(a,m-1,d+n)).toISOString().slice(0,10); };
const diaSemana = s => { const [a,m,d] = s.split('-').map(Number); return new Date(Date.UTC(a,m-1,d)).getUTCDay(); };
const retornoUtil = fim => { let r = somarDias(fim,1); while ([0,6].includes(diaSemana(r))) r = somarDias(r,1); return r; };
const totalDias = (a,b) => Math.round((Date.parse(`${b}T00:00:00Z`)-Date.parse(`${a}T00:00:00Z`))/86400000)+1;
const classeStatus = s => ({ 'Agendado':'status-agendado','Agendada':'status-agendado','Em andamento':'status-andamento','Concluído':'status-concluido','Concluída':'status-concluido' }[s] || '');
const deptNome = id => departamentos.find(d => d.id === Number(id))?.nome || '—';
const listaColaboradores = () => colaboradores.map(c => ({ ...c, departamento: deptNome(c.departamento_id) })).sort((a,b) => a.nome.localeCompare(b.nome));
const ativos = () => listaColaboradores().filter(c => c.status === 'Ativo');
const renderFerias = (res, status = 200, erro = null, valores = {}) => {
  const hoje = new Date().toISOString().slice(0,10);
  const lista = ferias.map(f => {
    const c = colaboradores.find(x => x.id === f.colaborador_id) || {};
    const statusAtual = hoje > f.data_fim ? 'Concluída' : hoje >= f.data_inicio ? 'Em andamento' : 'Agendada';
    return { ...f, colaborador:c.nome || '—', cargo:c.cargo || '—', dias:totalDias(f.data_inicio,f.data_fim), data_retorno:retornoUtil(f.data_fim), inicio_br:dataBR(f.data_inicio), fim_br:dataBR(f.data_fim), retorno_br:dataBR(retornoUtil(f.data_fim)), status:statusAtual, status_classe:classeStatus(statusAtual) };
  });
  res.status(status).render('rh/ferias', { ferias:lista, colaboradores:ativos(), erro, valores });
};
const formatarDuracao = h => { const mins = Math.round(Number(h)*60), hh = Math.floor(mins/60), mm = mins%60; return mm ? `${hh}h${pad(mm)}` : `${hh}h`; };

function listarColaboradores(req,res) { res.render('rh/colaboradores', { colaboradores:listaColaboradores() }); }
function novoColaborador(req,res) { res.render('rh/novo-colaborador', { departamentos, erro:null, valores:{} }); }
function cadastrarColaborador(req,res) {
  const v = req.body, salario = Number(String(v.salario || '').replace(',','.'));
  if (!v.nome?.trim() || !v.email?.trim() || !v.cargo?.trim() || !Number.isFinite(salario) || salario < 0 || !dataValida(v.data_admissao) || !departamentos.some(d => d.id === Number(v.departamento_id))) return res.status(400).render('rh/novo-colaborador',{ departamentos, erro:'Confira os campos obrigatórios, salário, data e departamento.', valores:v });
  if (colaboradores.some(c => c.email.toLowerCase() === v.email.trim().toLowerCase())) return res.status(400).render('rh/novo-colaborador',{ departamentos, erro:'Já existe um colaborador com esse e-mail.', valores:v });
  colaboradores.push({ id:proximoColaborador++, nome:v.nome.trim(), email:v.email.trim().toLowerCase(), telefone:v.telefone || '', cargo:v.cargo.trim(), salario, data_admissao:v.data_admissao, status:v.status === 'Inativo' ? 'Inativo':'Ativo', departamento_id:Number(v.departamento_id) });
  res.redirect('/rh/colaboradores');
}
function editarColaborador(req,res) { const c = colaboradores.find(x => x.id === Number(req.params.id)); if (!c) return res.status(404).send('Colaborador não encontrado.'); res.render('rh/editar-colaborador',{ colaborador:c, departamentos, erro:null, valores:c }); }
function atualizarColaborador(req,res) {
  const c = colaboradores.find(x => x.id === Number(req.params.id)); if (!c) return res.status(404).send('Colaborador não encontrado.');
  const v = req.body, salario = Number(String(v.salario || '').replace(',','.'));
  const valores = { nome:(v.nome||'').trim(), email:(v.email||'').trim().toLowerCase(), telefone:v.telefone||'', cargo:(v.cargo||'').trim(), salario:v.salario, data_admissao:v.data_admissao, departamento_id:Number(v.departamento_id), status:v.status === 'Inativo' ? 'Inativo':'Ativo' };
  const erro = !valores.nome || !valores.email || !valores.cargo || !Number.isFinite(salario) || salario < 0 || !dataValida(valores.data_admissao) || !departamentos.some(d=>d.id===valores.departamento_id) ? 'Confira os campos obrigatórios, salário, data e departamento.' : colaboradores.some(x=>x.id!==c.id && x.email===valores.email) ? 'Já existe outro colaborador com esse e-mail.' : null;
  if (erro) return res.status(400).render('rh/editar-colaborador',{ colaborador:c, departamentos, erro, valores });
  Object.assign(c,valores,{salario}); res.redirect('/rh/colaboradores');
}
function excluirColaborador(req,res) { const id=Number(req.params.id); colaboradores=colaboradores.filter(c=>c.id!==id); ferias=ferias.filter(f=>f.colaborador_id!==id); treinamentos=treinamentos.filter(t=>t.colaborador_id!==id); res.redirect('/rh/colaboradores'); }
function listarDepartamentos(req,res) {
  const lista = departamentos.map(d => { const grupo=colaboradores.filter(c=>c.departamento_id===d.id); return {...d,total_colaboradores:grupo.length,folha_total:grupo.filter(c=>c.status==='Ativo').reduce((s,c)=>s+(c.salario||0),0)}; });
  const id = req.query.departamento ? Number(req.query.departamento) : null;
  const filtrados = listaColaboradores().filter(c=>!id || c.departamento_id===id);
  res.render('rh/departamentos',{ departamentos:lista, colaboradores:filtrados, departamentoId:id && departamentos.some(d=>d.id===id)?id:null });
}
function folhaPagamento(req,res) {
  const resumo=departamentos.map(d=>{const grupo=colaboradores.filter(c=>c.departamento_id===d.id && c.status==='Ativo'), total_folha=grupo.reduce((s,c)=>s+(c.salario||0),0);return {id:d.id,nome:d.nome,total_ativos:grupo.length,total_folha,media_salarial:grupo.length?total_folha/grupo.length:0};});
  const lista=listaColaboradores().filter(c=>c.status==='Ativo');
  res.render('rh/folha-pagamento',{resumo,colaboradores:lista,totalGeral:resumo.reduce((s,x)=>s+x.total_folha,0),totalAtivos:lista.length});
}
function listarTreinamentos(req,res) {
  const agora=new Date();
  const lista=treinamentos.map(t=>{const c=colaboradores.find(x=>x.id===t.colaborador_id)||{};const ini=new Date(`${t.data_treinamento}T${t.hora_inicio}:00`),fim=new Date(ini.getTime()+t.duracao_horas*3600000);const termino=`${dataBR(fim.getFullYear()+'-'+pad(fim.getMonth()+1)+'-'+pad(fim.getDate()))} às ${pad(fim.getHours())}:${pad(fim.getMinutes())}`;const st=agora<ini?'Agendado':agora<fim?'Em andamento':'Concluído';return {...t,colaborador:c.nome||'—',data_br:dataBR(t.data_treinamento),hora_br:t.hora_inicio,duracao_txt:formatarDuracao(t.duracao_horas),termino_txt:termino,status_exibido:st,status_classe:classeStatus(st)};});
  res.render('rh/treinamentos',{treinamentos:lista,colaboradores:ativos(),erro:null,valores:{}});
}
function cadastrarTreinamento(req,res) { const v=req.body, dur=Number(v.duracao_horas), c=colaboradores.find(x=>x.id===Number(v.colaborador_id)&&x.status==='Ativo'); if(!c||!v.titulo?.trim()||!dataValida(v.data_treinamento)||!horaValida(v.hora_inicio)||!Number.isFinite(dur)||dur<.5||dur>72) return res.status(400).render('rh/treinamentos',{treinamentos:[],colaboradores:ativos(),erro:'Confira os dados do treinamento.',valores:v}); treinamentos.push({id:proximoTreinamento++,titulo:v.titulo.trim(),data_treinamento:v.data_treinamento,hora_inicio:v.hora_inicio,duracao_horas:dur,colaborador_id:c.id}); res.redirect('/rh/treinamentos'); }
function excluirTreinamento(req,res) { treinamentos=treinamentos.filter(t=>t.id!==Number(req.params.id)); res.redirect('/rh/treinamentos'); }
function listarFerias(req,res) { renderFerias(res); }
function cadastrarFerias(req,res) { const v=req.body,id=Number(v.colaborador_id),dias=Number(v.dias),c=colaboradores.find(x=>x.id===id&&x.status==='Ativo'); if(!c||!dataValida(v.data_inicio)||!Number.isInteger(dias)||dias<1||dias>30) return renderFerias(res,400,'Confira o colaborador, a data e a quantidade de dias.',v); const fim=somarDias(v.data_inicio,dias-1); ferias.push({id:proximaFerias++,colaborador_id:id,data_inicio:v.data_inicio,data_fim:fim}); res.redirect('/rh/ferias'); }
function excluirFerias(req,res) { ferias=ferias.filter(f=>f.id!==Number(req.params.id)); res.redirect('/rh/ferias'); }

module.exports={emailCadastrado: email => colaboradores.some(c => c.email.toLowerCase() === String(email || '').trim().toLowerCase()), listarColaboradores,novoColaborador,cadastrarColaborador,editarColaborador,atualizarColaborador,excluirColaborador,listarDepartamentos,folhaPagamento,listarTreinamentos,cadastrarTreinamento,excluirTreinamento,listarFerias,cadastrarFerias,excluirFerias};
