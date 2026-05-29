// Carrega configuração secreta
if (typeof GITHUB_CONFIG === 'undefined') {
  alert('❌ Arquivo config.js não encontrado!');
}

const { jsPDF } = window.jspdf;

// Valores padrão
const valoresMercado = {
    "deslocamento": 55,
    "atendimento residencial": 110,
    "atendimento empresarial": 130,
    "rede wi-fi": 170,
    "formatação": 140,
    "instalação de programa": 75,
    "remover vírus": 90,
    "limpeza interna": 110,
    "recuperar dados": 210,
    "câmeras": 215,
    "servidor": 250,
    "consultoria": 95,
    "trocar peça": 85,
    "backup": 70,
    "impressora": 125,
    "rede cabeada": 150
};

document.addEventListener('DOMContentLoaded', () => {
    carregarHistorico();
    calcularTotal();
    aplicarMascaras();
    configurarDesconto();
    configurarAcrescimo();

    // ✅ BOTÃO ADICIONAR NOVO SERVIÇO - CORRIGIDO
    document.getElementById('adicionarServico').addEventListener('click', () => {
        const container = document.getElementById('listaServicos');
        const modelo = document.querySelector('.servico-item');
        const novo = modelo.cloneNode(true);
        
        // Limpa os valores do novo serviço
        novo.querySelector('.tipoServico').value = '';
        novo.querySelector('.descricaoServico').value = '';
        novo.querySelector('.valorServico').value = '';
        novo.querySelector('.valor-sugerido').style.display = 'none';
        
        container.appendChild(novo);

        // Botão remover do novo item
        novo.querySelector('.removerServico').addEventListener('click', () => {
            if (document.querySelectorAll('.servico-item').length > 1) {
                novo.remove();
                calcularTotal();
            }
        });

        // Quando mudar o tipo de serviço
        novo.querySelector('.tipoServico').addEventListener('change', function() {
            calcularTotal();
        });

        // Botão buscar valor
        novo.querySelector('.btn-buscar').addEventListener('click', () => buscarValor(novo));
    });

    // Remover serviço inicial
    document.querySelector('.removerServico').addEventListener('click', function() {
        if (document.querySelectorAll('.servico-item').length > 1) {
            this.parentElement.remove();
            calcularTotal();
        }
    });

    // Buscar valor no primeiro serviço
    document.querySelector('.btn-buscar').addEventListener('click', () => buscarValor(document.querySelector('.servico-item')));

    // Gerar PDF
    document.getElementById('gerarOrcamento').addEventListener('click', gerarOrcamento);

    // Botões de nuvem e arquivo
    document.getElementById('exportarHistorico').addEventListener('click', exportarHistorico);
    document.getElementById('importarHistorico').addEventListener('click', () => document.getElementById('inputImportar').click());
    document.getElementById('salvarNoGithub').addEventListener('click', salvarNoGithub);
    document.getElementById('carregarDoGithub').addEventListener('click', carregarDoGithub);
    document.getElementById('inputImportar').addEventListener('change', importarHistorico);
});

// Desconto
function configurarDesconto() {
    const radios = document.querySelectorAll('input[name="tipoDesconto"]');
    const inputValor = document.getElementById('descontoValor');
    const inputPorc = document.getElementById('descontoPorc');

    radios.forEach(radio => {
        radio.addEventListener('change', () => {
            inputValor.disabled = radio.value !== 'valor';
            inputPorc.disabled = radio.value !== 'porcentagem';
            if (radio.value === 'nenhum') {
                inputValor.value = '';
                inputPorc.value = '';
            }
            calcularTotal();
        });
    });

    inputValor.addEventListener('input', calcularTotal);
    inputPorc.addEventListener('input', calcularTotal);
}

// Acréscimo
function configurarAcrescimo() {
    const radios = document.querySelectorAll('input[name="tipoAcrescimo"]');
    const inputValor = document.getElementById('acrescimoValor');
    const inputPorc = document.getElementById('acrescimoPorc');

    radios.forEach(radio => {
        radio.addEventListener('change', () => {
            inputValor.disabled = radio.value !== 'valor';
            inputPorc.disabled = radio.value !== 'porcentagem';
            if (radio.value === 'nenhum') {
                inputValor.value = '';
                inputPorc.value = '';
            }
            calcularTotal();
        });
    });

    inputValor.addEventListener('input', calcularTotal);
    inputPorc.addEventListener('input', calcularTotal);
}

// Buscar valor sugerido
function buscarValor(container) {
    const descricao = container.querySelector('.descricaoServico').value.toLowerCase().trim();
    const elementoValor = container.querySelector('#valorSugerido');
    const elementoDisplay = container.querySelector('.valor-sugerido');
    const inputValor = container.querySelector('.valorServico');

    if (!descricao) {
        alert('Digite uma descrição primeiro!');
        return;
    }

    let valorEncontrado = null;
    for (const [chave, valor] of Object.entries(valoresMercado)) {
        if (descricao.includes(chave)) {
            valorEncontrado = valor;
            break;
        }
    }

    if (!valorEncontrado) valorEncontrado = 90;

    elementoValor.textContent = valorEncontrado.toFixed(2).replace('.', ',');
    elementoDisplay.style.display = 'inline-block';
    inputValor.value = valorEncontrado.toFixed(2);
    calcularTotal();
}

// Cálculo total
function calcularTotal() {
    let subtotal = 0;
    document.querySelectorAll('.servico-item').forEach(s => {
        const valorTexto = s.querySelector('.tipoServico').value;
        if (valorTexto && valorTexto !== 'Outro') {
            const valor = parseFloat(valorTexto.split('R$ ')[1].replace(',', '.'));
            if (!isNaN(valor)) subtotal += valor;
        }
        const val = parseFloat(s.querySelector('.valorServico').value.replace(',', '.'));
        if (!isNaN(val)) subtotal += val;
    });

    // Desconto
    let desconto = 0;
    const tipoDesc = document.querySelector('input[name="tipoDesconto"]:checked').value;
    if (tipoDesc === 'valor') desconto = parseFloat(document.getElementById('descontoValor').value) || 0;
    if (tipoDesc === 'porcentagem') {
        const porc = parseFloat(document.getElementById('descontoPorc').value) || 0;
        desconto = subtotal * (porc / 100);
    }

    // Acréscimo
    let acrescimo = 0;
    const tipoAcr = document.querySelector('input[name="tipoAcrescimo"]:checked').value;
    if (tipoAcr === 'valor') acrescimo = parseFloat(document.getElementById('acrescimoValor').value) || 0;
    if (tipoAcr === 'porcentagem') {
        const porc = parseFloat(document.getElementById('acrescimoPorc').value) || 0;
        acrescimo = subtotal * (porc / 100);
    }

    const total = Math.max(subtotal - desconto + acrescimo, 0);

    document.getElementById('subtotal').textContent = subtotal.toFixed(2).replace('.', ',');
    
    const elemDesc = document.querySelector('.valor-desconto');
    elemDesc.style.display = desconto > 0 ? 'block' : 'none';
    if (desconto > 0) document.getElementById('valorDesconto').textContent = desconto.toFixed(2).replace('.', ',');

    const elemAcr = document.querySelector('.valor-acrescimo');
    elemAcr.style.display = acrescimo > 0 ? 'block' : 'none';
    if (acrescimo > 0) document.getElementById('valorAcrescimo').textContent = acrescimo.toFixed(2).replace('.', ',');

    document.getElementById('valorTotal').textContent = total.toFixed(2).replace('.', ',');
}

// Máscaras CPF e Telefone
function aplicarMascaras() {
    const cpf = document.getElementById('cpfCliente');
    cpf.addEventListener('input', (e) => {
        let v = e.target.value.replace(/\D/g, '');
        v = v.replace(/(\d{3})(\d)/, '$1.$2');
        v = v.replace(/(\d{3})(\d)/, '$1.$2');
        v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        e.target.value = v;
    });

    const tel = document.getElementById('telefoneCliente');
    tel.addEventListener('input', (e) => {
        let v = e.target.value.replace(/\D/g, '');
        v = v.replace(/^(\d{2})(\d)/g, '($1) $2');
        v = v.replace(/(\d)(\d{4})$/, '$1-$2');
        e.target.value = v;
    });
}

// Gerar PDF
function gerarOrcamento() {
    const nome = document.getElementById('nomeCliente').value.trim();
    const cpf = document.getElementById('cpfCliente').value.trim();
    const email = document.getElementById('emailCliente').value.trim();
    const telefone = document.getElementById('telefoneCliente').value.trim();
    const dataHora = new Date();
    const dataFormatada = dataHora.toLocaleString('pt-BR').replace(/[\/: ]/g, '-');

    const dataValidade = new Date(dataHora);
    dataValidade.setDate(dataValidade.getDate() + 3);
    const dataValidadeTexto = dataValidade.toLocaleDateString('pt-BR');

    const subtotal = document.getElementById('subtotal').textContent;
    const descontoTexto = document.querySelector('.valor-desconto').style.display !== 'none' ? document.getElementById('valorDesconto').textContent : '0,00';
    const acrescimoTexto = document.querySelector('.valor-acrescimo').style.display !== 'none' ? document.getElementById('valorAcrescimo').textContent : '0,00';
    const total = document.getElementById('valorTotal').textContent;

    const tipoDesconto = document.querySelector('input[name="tipoDesconto"]:checked').value;
    const valorDesconto = document.getElementById('descontoValor').value;
    const porcDesconto = document.getElementById('descontoPorc').value;
    const tipoAcrescimo = document.querySelector('input[name="tipoAcrescimo"]:checked').value;
    const valorAcrescimo = document.getElementById('acrescimoValor').value;
    const porcAcrescimo = document.getElementById('acrescimoPorc').value;

    let nomeArquivo = 'Orcamento';
    if (nome) nomeArquivo += `_${nome.replace(/\s/g, '_')}`;
    nomeArquivo += `_${dataFormatada}.pdf`;

    const servicos = [];
    document.querySelectorAll('.servico-item').forEach(s => {
        servicos.push({
            tipo: s.querySelector('.tipoServico').value,
            descricao: s.querySelector('.descricaoServico').value,
            valor: s.querySelector('.valorServico').value
        });
    });

    if (servicos.every(s => !s.tipo && !s.descricao)) {
        alert('Adicione pelo menos um serviço!');
        return;
    }

    const doc = new jsPDF();
    
    doc.setFillColor(44, 62, 80);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('bold');
    doc.text('ORÇAMENTO DE SERVIÇOS DE INFORMÁTICA', 105, 25, { align: 'center' });
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont('normal');
    doc.text(`Data/Hora: ${dataHora.toLocaleString('pt-BR')}`, 20, 50);

    let y = 60;
    if (nome) { doc.text(`Cliente: ${nome}`, 20, y); y += 8; }
    if (cpf) { doc.text(`CPF: ${cpf}`, 20, y); y += 8; }
    if (email) { doc.text(`E-mail: ${email}`, 20, y); y += 8; }
    if (telefone) { doc.text(`Telefone: ${telefone}`, 20, y); y += 12; }

    doc.setFont('bold');
    doc.text('SERVIÇOS PRESTADOS:', 20, y);
    doc.setFont('normal');
    y += 10;
    servicos.forEach(s => {
        let texto = s.tipo || '';
        if (s.descricao) texto += ` | ${s.descricao}`;
        if (s.valor) texto += ` - R$ ${s.valor}`;
        doc.text(`• ${texto}`, 22, y);
        y += 8;
    });

    y += 5;
    doc.text(`Subtotal: R$ ${subtotal}`, 20, y);
    
    if (descontoTexto !== '0,00') {
        doc.setTextColor(192, 57, 43);
        doc.text(`Desconto: - R$ ${descontoTexto}`, 20, y + 8);
        doc.setTextColor(0, 0, 0);
        y += 8;
    }

    if (acrescimoTexto !== '0,00') {
        doc.setTextColor(41, 128, 185);
        doc.text(`Acréscimo: + R$ ${acrescimoTexto}`, 20, y + 8);
        doc.setTextColor(0, 0, 0);
        y += 8;
    }

    doc.setFillColor(234, 250, 241);
    doc.rect(15, y + 5, 180, 20, 'F');
    doc.setFontSize(14);
    doc.setFont('bold');
    doc.text(`VALOR FINAL: R$ ${total}`, 20, y + 18);

    doc.setFontSize(11);
    doc.setTextColor(80, 80, 80);
    doc.text(`Válido até: ${dataValidadeTexto} (3 dias)`, 20, 275);

    doc.setFont('Permanent Marker', 'cursive');
    doc.setFontSize(22);
    doc.setTextColor(44, 62, 80);
    doc.text('RDTech', 160, 285, { align: 'right' });

    doc.save(nomeArquivo);
    
    salvarNoHistorico({
        nomeArquivo, dataHora,
        dadosCliente: { nome, cpf, email, telefone },
        servicos,
        ajustes: { tipoDesconto, valorDesconto, porcDesconto, tipoAcrescimo, valorAcrescimo, porcAcrescimo }
    });
}

// Histórico
function salvarNoHistorico(item) {
    let historico = JSON.parse(localStorage.getItem('orcamentos')) || [];
    historico.unshift(item);
    localStorage.setItem('orcamentos', JSON.stringify(historico));
    carregarHistorico();
}

function carregarHistorico() {
    const lista = document.getElementById('listaHistorico');
    lista.innerHTML = '';
    const historico = JSON.parse(localStorage.getItem('orcamentos')) || [];
    document.getElementById('vazioHistorico').style.display = historico.length ? 'none' : 'block';

    historico.forEach((item, index) => {
        const li = document.createElement('li');
        const nome = (item.dadosCliente && item.dadosCliente.nome) ? `Cliente: ${item.dadosCliente.nome}` : 'Cliente não informado';
        li.innerHTML = `
            <div><strong>${nome}</strong><br><small>${item.nomeArquivo} | ${item.dataHora}</small></div>
            <div style="margin-top:8px;">
                <button onclick="reeditarOrcamento(${index})" style="background:#27ae60;color:white;border:none;padding:8px 12px;border-radius:4px;margin-right:5px;">✏️ Editar</button>
                <button onclick="excluirDoHistorico(${index})" style="background:#e74c3c;color:white;border:none;padding:8px 12px;border-radius:4px;">🗑 Excluir</button>
            </div>
        `;
        lista.appendChild(li);
    });
}

function excluirDoHistorico(index) {
    let historico = JSON.parse(localStorage.getItem('orcamentos')) || [];
    historico.splice(index, 1);
    localStorage.setItem('orcamentos', JSON.stringify(historico));
    carregarHistorico();
}

function reeditarOrcamento(index) {
    const historico = JSON.parse(localStorage.getItem('orcamentos')) || [];
    const item = historico[index];
    if (!item) return;

    document.getElementById('nomeCliente').value = item.dadosCliente?.nome || '';
    document.getElementById('cpfCliente').value = item.dadosCliente?.cpf || '';
    document.getElementById('emailCliente').value = item.dadosCliente?.email || '';
    document.getElementById('telefoneCliente').value = item.dadosCliente?.telefone || '';
    
    const listaServicos = document.getElementById('listaServicos');
    while (listaServicos.children.length > 1) listaServicos.removeChild(listaServicos.lastChild);

    document.querySelector('input[name="tipoDesconto"][value="nenhum"]').checked = true;
    document.getElementById('descontoValor').value = '';
    document.getElementById('descontoValor').disabled = true;
    document.getElementById('descontoPorc').value = '';
    document.getElementById('descontoPorc').disabled = true;
    document.querySelector('input[name="tipoAcrescimo"][value="nenhum"]').checked = true;
    document.getElementById('acrescimoValor').value = '';
    document.getElementById('acrescimoValor').disabled = true;
    document.getElementById('acrescimoPorc').value = '';
    document.getElementById('acrescimoPorc').disabled = true;

    if (item.servicos && item.servicos.length > 0) {
        item.servicos.forEach((servico, idx) => {
            let el;
            if (idx === 0) el = listaServicos.children[0];
            else {
                const modelo = document.querySelector('.servico-item');
                const novo = modelo.cloneNode(true);
                novo.querySelector('.valor-sugerido').style.display = 'none';
                listaServicos.appendChild(novo);
                el = novo;
                el.querySelector('.removerServico').addEventListener('click', () => {
                    if (document.querySelectorAll('.servico-item').length > 1) { el.remove(); calcularTotal(); }
                });
                el.querySelector('.btn-buscar').addEventListener('click', () => buscarValor(el));
            }
            el.querySelector('.tipoServico').value = servico.tipo || '';
            el.querySelector('.descricaoServico').value = servico.descricao || '';
            el.querySelector('.valorServico').value = servico.valor || '';
        });
    }

    if (item.ajustes) {
        if (item.ajustes.tipoDesconto) {
            document.querySelector(`input[name="tipoDesconto"][value="${item.ajustes.tipoDesconto}"]`).checked = true;
            document.getElementById('descontoValor').disabled = item.ajustes.tipoDesconto !== 'valor';
            document.getElementById('descontoPorc').disabled = item.ajustes.tipoDesconto !== 'porcentagem';
            document.getElementById('descontoValor').value = item.ajustes.valorDesconto || '';
            document.getElementById('descontoPorc').value = item.ajustes.porcDesconto || '';
        }
        if (item.ajustes.tipoAcrescimo) {
            document.querySelector(`input[name="tipoAcrescimo"][value="${item.ajustes.tipoAcrescimo}"]`).checked = true;
            document.getElementById('acrescimoValor').disabled = item.ajustes.tipoAcrescimo !== 'valor';
            document.getElementById('acrescimoPorc').disabled = item.ajustes.tipoAcrescimo !== 'porcentagem';
            document.getElementById('acrescimoValor').value = item.ajustes.valorAcrescimo || '';
            document.getElementById('acrescimoPorc').value = item.ajustes.porcAcrescimo || '';
        }
    }

    calcularTotal();
    window.scrollTo({top:0,behavior:'smooth'});
}

// Arquivo local
function exportarHistorico() {
    const historico = localStorage.getItem('orcamentos') || '[]';
    const blob = new Blob([historico], {type:'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `historico_${new Date().toLocaleString('pt-BR').replace(/[\/: ]/g,'-')}.json`;
    a.click();
    alert('✅ Salvo com sucesso!');
}

function importarHistorico(e) {
    const arq = e.target.files[0];
    if (!arq) return;
    const leitor = new FileReader();
    leitor.onload = ev => {
        try {
            const dados = JSON.parse(ev.target.result);
            if (!Array.isArray(dados)) throw Error('inválido');
            const junta = confirm('JUNTAR com atual ou SUBSTITUIR?\nOK = JUNTAR | CANCELAR = SUBSTITUIR');
            let atual = JSON.parse(localStorage.getItem('orcamentos')) || [];
            if (junta) {
                const ids = atual.map(i => i.nomeArquivo+i.dataHora);
                const novos = dados.filter(i => !ids.includes(i.nomeArquivo+i.dataHora));
                atual = [...novos, ...atual];
            } else atual = dados;
            localStorage.setItem('orcamentos', JSON.stringify(atual));
            carregarHistorico();
            alert('✅ Importado!');
        } catch { alert('❌ Erro no arquivo'); }
        e.target.value = '';
    };
    leitor.readAsText(arq);
}

// GitHub
async function salvarNoGithub() {
    try {
        const hist = localStorage.getItem('orcamentos') || '[]';
        const conteudo = btoa(unescape(encodeURIComponent(hist)));
        let sha = '';
        try {
            const res = await fetch(`https://api.github.com/repos/${GITHUB_CONFIG.usuario}/${GITHUB_CONFIG.repositorio}/contents/${GITHUB_CONFIG.nomeArquivo}`, {headers:{Authorization:`token ${GITHUB_CONFIG.token}`}});
            if (res.ok) sha = (await res.json()).sha;
        } catch {}
        const res = await fetch(`https://api.github.com/repos/${GITHUB_CONFIG.usuario}/${GITHUB_CONFIG.repositorio}/contents/${GITHUB_CONFIG.nomeArquivo}`, {
            method:'PUT',
            headers:{Authorization:`token ${GITHUB_CONFIG.token}`,'Content-Type':'application/json'},
            body:JSON.stringify({message:`Atualização ${new Date().toLocaleString('pt-BR')}`, content:conteudo, sha})
        });
        res.ok ? alert('✅ Salvo na nuvem!') : alert('❌ Erro ao salvar');
    } catch { alert('❌ Erro de conexão'); }
}

async function carregarDoGithub() {
    try {
        const res = await fetch(`https://api.github.com/repos/${GITHUB_CONFIG.usuario}/${GITHUB_CONFIG.repositorio}/contents/${GITHUB_CONFIG.nomeArquivo}`, {headers:{Authorization:`token ${GITHUB_CONFIG.token}`}});
        if (!res.ok) throw Error('não encontrado');
        const dados = await res.json();
        const conteudo = JSON.parse(decodeURIComponent(escape(atob(dados.content))));
        const junta = confirm('JUNTAR ou SUBSTITUIR?\nOK = JUNTAR | CANCELAR = SUBSTITUIR');
        let atual = JSON.parse(localStorage.getItem('orcamentos')) || [];
        if (junta) {
            const ids = atual.map(i => i.nomeArquivo+i.dataHora);
            const novos = conteudo.filter(i => !ids.includes(i.nomeArquivo+i.dataHora));
            atual = [...novos, ...atual];
        } else atual = conteudo;
        localStorage.setItem('orcamentos', JSON.stringify(atual));
        carregarHistorico();
        alert('✅ Carregado da nuvem!');
    } catch (e) { alert('❌ Erro: '+e.message); }
}

window.excluirDoHistorico = excluirDoHistorico;
window.reeditarOrcamento = reeditarOrcamento;
window.exportarHistorico = exportarHistorico;
window.importarHistorico = importarHistorico;
window.salvarNoGithub = salvarNoGithub;
window.carregarDoGithub = carregarDoGithub;

