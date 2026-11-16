/* Vision Agro — RH
   1) Mini calendário de férias (pré-visualização no formulário e nos cartões)
   2) Previsão de término do treinamento                                       */
(function () {
    'use strict';

    var MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    var SEMANA = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

    function pad(n) { return String(n).padStart(2, '0'); }

    // Datas "AAAA-MM-DD" são tratadas em UTC para evitar problemas de fuso horário.
    function parse(texto) {
        var p = texto.split('-').map(Number);
        return new Date(Date.UTC(p[0], p[1] - 1, p[2]));
    }
    function formatar(dt) { return dt.toISOString().slice(0, 10); }
    function somarDias(texto, dias) {
        var dt = parse(texto);
        dt.setUTCDate(dt.getUTCDate() + dias);
        return formatar(dt);
    }
    function dataBR(texto) {
        var p = texto.split('-');
        return p[2] + '/' + p[1] + '/' + p[0];
    }
    function dataValida(texto) {
        return /^\d{4}-\d{2}-\d{2}$/.test(texto || '') && formatar(parse(texto)) === texto;
    }
    // Primeiro dia útil (seg–sex) depois do último dia de férias — mesma regra do servidor.
    function dataRetorno(fim) {
        var r = somarDias(fim, 1);
        while (parse(r).getUTCDay() === 0 || parse(r).getUTCDay() === 6) r = somarDias(r, 1);
        return r;
    }

    function criarMes(ano, mes, inicio, fim, retorno) {
        var bloco = document.createElement('div');
        bloco.className = 'cal-month';

        var titulo = document.createElement('div');
        titulo.className = 'cal-title';
        titulo.textContent = MESES[mes] + ' ' + ano;
        bloco.appendChild(titulo);

        var grade = document.createElement('div');
        grade.className = 'cal-grid';

        SEMANA.forEach(function (letra) {
            var cab = document.createElement('span');
            cab.className = 'cal-weekday';
            cab.textContent = letra;
            grade.appendChild(cab);
        });

        var primeiroDia = new Date(Date.UTC(ano, mes, 1)).getUTCDay();
        for (var i = 0; i < primeiroDia; i++) {
            var vazio = document.createElement('span');
            vazio.className = 'cal-day cal-blank';
            grade.appendChild(vazio);
        }

        var diasNoMes = new Date(Date.UTC(ano, mes + 1, 0)).getUTCDate();
        for (var d = 1; d <= diasNoMes; d++) {
            var iso = ano + '-' + pad(mes + 1) + '-' + pad(d);
            var celula = document.createElement('span');
            var classes = ['cal-day'];
            var dica = '';

            if (iso >= inicio && iso <= fim) classes.push('cal-ferias');
            if (iso === inicio) { classes.push('cal-inicio'); dica = 'Início das férias'; }
            if (iso === fim) { classes.push('cal-fim'); dica = dica ? 'Início e último dia das férias' : 'Último dia de férias'; }
            if (iso === retorno) { classes.push('cal-retorno'); dica = 'Retorno ao trabalho'; }

            celula.className = classes.join(' ');
            if (dica) celula.title = dica;
            celula.textContent = d;
            grade.appendChild(celula);
        }

        bloco.appendChild(grade);
        return bloco;
    }

    function desenharCalendario(el, inicio, fim, retorno) {
        el.innerHTML = '';
        if (!inicio || !fim || !retorno) {
            var aviso = document.createElement('p');
            aviso.className = 'cal-empty';
            aviso.textContent = 'Escolha a data de início e o tempo de férias para ver o calendário.';
            el.appendChild(aviso);
            return;
        }
        var a = parse(inicio), b = parse(retorno);
        var ano = a.getUTCFullYear(), mes = a.getUTCMonth();
        var anoFim = b.getUTCFullYear(), mesFim = b.getUTCMonth();
        while (ano < anoFim || (ano === anoFim && mes <= mesFim)) {
            el.appendChild(criarMes(ano, mes, inicio, fim, retorno));
            mes++;
            if (mes > 11) { mes = 0; ano++; }
        }
    }

    /* ---------- Cartões das férias já registradas ---------- */
    document.querySelectorAll('.mini-cal[data-inicio]').forEach(function (el) {
        desenharCalendario(el, el.dataset.inicio, el.dataset.fim, el.dataset.retorno);
    });

    /* ---------- Formulário de férias (pré-visualização ao vivo) ---------- */
    var formFerias = document.getElementById('form-ferias');
    if (formFerias) {
        var campoInicio = formFerias.elements.data_inicio;
        var campoDias = formFerias.elements.dias;
        var preview = document.getElementById('preview-calendario');

        function atualizarFerias() {
            var inicio = campoInicio.value;
            var dias = Number(campoDias.value);
            var resumo = formFerias.querySelectorAll('[data-resumo]');
            var ok = dataValida(inicio) && Number.isInteger(dias) && dias >= 1 && dias <= 30;

            if (!ok) {
                resumo.forEach(function (n) { n.textContent = '—'; });
                desenharCalendario(preview, null, null, null);
                return;
            }
            var fim = somarDias(inicio, dias - 1);
            var retorno = dataRetorno(fim);
            formFerias.querySelector('[data-resumo="inicio"]').textContent = dataBR(inicio);
            formFerias.querySelector('[data-resumo="fim"]').textContent = dataBR(fim);
            formFerias.querySelector('[data-resumo="retorno"]').textContent = dataBR(retorno);
            desenharCalendario(preview, inicio, fim, retorno);
        }

        campoInicio.addEventListener('input', atualizarFerias);
        campoDias.addEventListener('input', atualizarFerias);
        atualizarFerias();
    }

    /* ---------- Formulário de treinamento (previsão de término) ---------- */
    var formTreino = document.getElementById('form-treinamento');
    if (formTreino) {
        var campoData = formTreino.elements.data_treinamento;
        var campoHora = formTreino.elements.hora_inicio;
        var campoDuracao = formTreino.elements.duracao_horas;
        var campoTermino = document.getElementById('termino-previsto');

        function atualizarTermino() {
            var duracao = Number(String(campoDuracao.value).replace(',', '.'));
            if (!dataValida(campoData.value) || !/^\d{2}:\d{2}$/.test(campoHora.value) || !(duracao > 0)) {
                campoTermino.value = '';
                return;
            }
            var hm = campoHora.value.split(':').map(Number);
            var partes = campoData.value.split('-').map(Number);
            var inicio = new Date(Date.UTC(partes[0], partes[1] - 1, partes[2], hm[0], hm[1]));
            var fim = new Date(inicio.getTime() + duracao * 3600000);
            campoTermino.value = dataBR(formatar(fim)) + ' às ' + pad(fim.getUTCHours()) + ':' + pad(fim.getUTCMinutes());
        }

        [campoData, campoHora, campoDuracao].forEach(function (c) { c.addEventListener('input', atualizarTermino); });
        atualizarTermino();
    }
})();