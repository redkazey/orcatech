const { jsPDF } = window.jspdf;

// Banco de valores médios de mercado
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

    // Adicionar novo serviço
    document.getElementById('adicionarServico').addEventListener('click', () => {
        const container = document.getElementById('listaServicos');
        const modelo = document.querySelector('.servico-item');
        const novo = modelo.cloneNode(true);
        
        novo.querySelector('.tipoServico').value = '';
        novo.querySelector('.campo-personalizado').style.display = 'none';
        novo.querySelector('.descricaoServico').value = '';
        novo.querySelector('.valorServico').value = '';
        novo.querySelector('.valor-sugerido').style.display = 'none';
        
        container.appendChild(novo);

        novo.querySelector('.removerServico').addEventListener('click', () => {
            if (document.querySelectorAll('.servico-item').length > 1) {
                novo.remove();
                calcularTotal();
            }
        });

        novo.querySelector('.tipoServico').addEventListener('change', function() {
            const campo = novo.querySelector('.campo-personalizado');
            campo.style.display = this.value === 'Outro' ? 'flex' : 'none';
            calcularTotal();
        });

        novo.querySelector('.btn-buscar').addEventListener('click', () => buscarValor(novo));
    });

    // Remover serviço inicial
    document.querySelector('.removerServico').addEventListener('click', function() {
        if (document.querySelectorAll('.servico-item').length > 1) {
            this.parentElement.remove();
            calcularTotal();
        }
    });

    // Mostrar/ocultar personalizado inicial
    document.querySelector('.tipoServico').addEventListener('change', function() {
        const campo = this.parentElement.querySelector('.campo-personalizado');
        campo.style.display = this.value === 'Outro' ? 'flex' : 'none';
        calcularTotal();
    });

    document.querySelector('.btn-buscar').addEventListener('click', () => buscarValor(document.querySelector('.servico-item')));

    // Gerar PDF
    document.getElementById('gerarOrcamento').addEventListener('click', gerarOrcamento);
});

// Busca valor médio baseado na descrição
function buscarValor(container) {
    const descricao = container.querySelector('.descricaoServico').value.toLowerCase().trim();
    const elementoValor = container.querySelector('#valorSugerido');
    const elementoDisplay = container.querySelector('.valor-sugerido');
    const inputValor = container.querySelector('.valorServico');

    if (!descricao) {
        alert('Digite uma descrição do serviço primeiro!');
        return;
    }

    // Procura palavras-chave
    let valorEncontrado = null;
    for (const [chave, valor] of Object.entries(valoresMercado)) {
        if (descricao.includes(chave)) {
            valorEncontrado = valor;
            break;
        }
    }

    // Valor médio genérico se não encontrar
    if (!valorEncontrado) {
        valorEncontrado = 90; // valor médio padrão
    }

    elementoValor.textContent = valorEncontrado.toFixed(2).replace('.', ',');
    elementoDisplay.style.display = 'inline-block';
    inputValor.value = valorEncontrado.toFixed(2);
    calcularTotal();
}

function calcularTotal() {
    let total = 0;
    document.querySelectorAll('.servico-item').forEach(s => {
        const valorTexto = s.querySelector('.tipoServico').value;
        if (valorTexto && valorTexto !== 'Outro') {
            const valor = parseFloat(valorTexto.split('R$ ')[1].replace(',', '.'));
            if (!isNaN(valor)) total += valor;
        } else if (valorTexto === 'Outro') {
            const val = parseFloat(s.querySelector('.valorServico').value.replace(',', '.'));
            if (!isNaN(val)) total += val;
        }
    });
    document.getElementById('valorTotal').textContent = total.toFixed(2).replace('.', ',');
}

function aplicarMascaras() {
    // Máscara CPF
    const cpf = document.getElementById('cpfCliente');
    cpf.addEventListener('input', (e) => {
        let v = e.target.value.replace(/\D/g, '');
        v = v.replace(/(\d{3})(\d)/, '$1.$2');
        v = v.replace(/(\d{3})(\d)/, '$1.$2');
        v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        e.target.value = v;
    });

    // Máscara Telefone
    const tel = document.getElementById('telefoneCliente');
    tel.addEventListener('input', (e) => {
        let v = e.target.value.replace(/\D/g, '');
        v = v.replace(/^(\d{2})(\d)/g, '($1) $2');
        v = v.replace(/(\d)(\d{4})$/, '$1-$2');
        e.target.value = v;
    });
}

function gerarOrcamento() {
    const nome = document.getElementById('nomeCliente').value.trim();
    const cpf = document.getElementById('cpfCliente').value.trim();
    const email = document.getElementById('emailCliente').value.trim();
    const telefone = document.getElementById('telefoneCliente').value.trim();
    const dataHora = new Date();
    const dataFormatada = dataHora.toLocaleString('pt-BR').replace(/[\/: ]/g, '-');

    // Nome do arquivo
    let nomeArquivo = 'Orcamento';
    if (nome) nomeArquivo += `_${nome.replace(/\s/g, '_')}`;
    nomeArquivo += `_${dataFormatada}.pdf`;

    // Coletar serviços
    const servicos = [];
    document.querySelectorAll('.servico-item').forEach(s => {
        const tipo = s.querySelector('.tipoServico').value;
        if (tipo && tipo !== 'Outro') {
            servicos.push(tipo);
        } else if (tipo === 'Outro') {
            const desc = s.querySelector('.descricaoServico').value.trim();
            const val = s.querySelector('.valorServico').value;
            if (desc && val) servicos.push(`${desc} - R$ ${val}`);
        }
    });

    if (servicos.length === 0) {
        alert('Adicione pelo menos um serviço!');
        return;
    }

    // Gerar PDF
    const doc = new jsPDF();
    doc.setFillColor(44, 62, 80);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255,255,255);
    doc.setFontSize(20);
    doc.setFont('bold');
    doc.text('ORÇAMENTO DE SERVIÇOS DE INFORMÁTICA', 105, 25, { align: 'center' });
    
    doc.setTextColor(0,0,0);
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
        doc.text(`• ${s}`, 22, y);
        y += 8;
    });

    const total = document.getElementById('valorTotal').textContent;
    doc.setFillColor(234, 250, 241);
    doc.rect(15, y+5, 180, 20, 'F');
    doc.setFontSize(14);
    doc.setFont('bold');
    doc.text(`VALOR TOTAL: R$ ${total}`, 20, y+18);

    doc.setFontSize(10);
    doc.text('* Orçamento válido por 7 dias', 20, 280);

    doc.save(nomeArquivo);
    salvarNoHistorico({ nomeArquivo, dataHora: dataHora.toLocaleString('pt-BR'), conteudo: doc.output('blob') });
}

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
        li.innerHTML = `
            <div>
                <strong>${item.nomeArquivo}</strong>
                <small>${item.dataHora}</small>
            </div>
            <div>
                <button onclick="baixarNovamente(${index})">⬇ Baixar</button>
                <button onclick="excluirDoHistorico(${index})">🗑 Excluir</button>
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

function baixarNovamente(index) {
    const historico = JSON.parse(localStorage.getItem('orcamentos')) || [];
    const item = historico[index];
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([item.conteudo]));
    link.download = item.nomeArquivo;
    link.click();
}

window.excluirDoHistorico = excluirDoHistorico;
window.baixarNovamente = baixarNovamente;

