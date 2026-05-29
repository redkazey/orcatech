const { jsPDF } = window.jspdf;

document.addEventListener('DOMContentLoaded', () => {
    carregarHistorico();
    calcularTotal();

    // Adicionar novo serviço
    document.getElementById('adicionarServico').addEventListener('click', () => {
        const container = document.getElementById('listaServicos');
        const novoServico = document.querySelector('.servico').cloneNode(true);
        novoServico.querySelector('.tipoServico').value = '';
        novoServico.querySelector('.descricaoExtra').style.display = 'none';
        novoServico.querySelector('.descricaoExtra').value = '';
        container.appendChild(novoServico);

        novoServico.querySelector('.removerServico').addEventListener('click', () => {
            novoServico.remove();
            calcularTotal();
        });

        novoServico.querySelector('.tipoServico').addEventListener('change', function() {
            const campoExtra = novoServico.querySelector('.descricaoExtra');
            campoExtra.style.display = this.value === 'Outro' ? 'block' : 'none';
            calcularTotal();
        });

        calcularTotal();
    });

    // Mostrar campo extra quando selecionar "Outro"
    document.addEventListener('change', (e) => {
        if (e.target.classList.contains('tipoServico')) {
            const campoExtra = e.target.parentElement.querySelector('.descricaoExtra');
            campoExtra.style.display = e.target.value === 'Outro' ? 'block' : 'none';
            calcularTotal();
        }
    });

    // Remover serviço
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('removerServico')) {
            e.target.parentElement.remove();
            calcularTotal();
        }
    });

    // Gerar orçamento
    document.getElementById('gerarOrcamento').addEventListener('click', gerarOrcamento);
});

function calcularTotal() {
    let total = 0;
    document.querySelectorAll('.servico').forEach(servico => {
        const valorTexto = servico.querySelector('.tipoServico').value;
        if (valorTexto && valorTexto !== 'Outro') {
            const valor = parseFloat(valorTexto.split('R$ ')[1].replace(',', '.'));
            if (!isNaN(valor)) total += valor;
        } else if (valorTexto === 'Outro') {
            const valorExtra = servico.querySelector('.descricaoExtra').value;
            const match = valorExtra.match(/R\$\s*(\d+[,.]\d+)/);
            if (match) {
                const val = parseFloat(match[1].replace(',', '.'));
                if (!isNaN(val)) total += val;
            }
        }
    });
    document.getElementById('valorTotal').textContent = total.toFixed(2).replace('.', ',');
}

function gerarOrcamento() {
    const nomeCliente = document.getElementById('nomeCliente').value.trim();
    const cpfCliente = document.getElementById('cpfCliente').value.trim();
    const emailCliente = document.getElementById('emailCliente').value.trim();
    const telefoneCliente = document.getElementById('telefoneCliente').value.trim();
    const dataHora = new Date();
    const dataFormatada = dataHora.toLocaleString('pt-BR').replace(/[\/: ]/g, '-');

    // Nome do arquivo com dados preenchidos
    let nomeArquivo = 'Orcamento';
    if (nomeCliente) nomeArquivo += `_${nomeCliente.replace(/\s/g, '_')}`;
    if (cpfCliente) nomeArquivo += `_CPF_${cpfCliente.replace(/\D/g, '')}`;
    nomeArquivo += `_${dataFormatada}.pdf`;

    // Coletar serviços
    const servicos = [];
    document.querySelectorAll('.servico').forEach(s => {
        const tipo = s.querySelector('.tipoServico').value;
        if (tipo && tipo !== 'Outro') {
            servicos.push(tipo);
        } else if (tipo === 'Outro') {
            const extra = s.querySelector('.descricaoExtra').value.trim();
            if (extra) servicos.push(extra);
        }
    });

    if (servicos.length === 0) {
        alert('Adicione pelo menos um serviço para gerar o orçamento!');
        return;
    }

    // Gerar PDF
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('ORÇAMENTO DE SERVIÇOS DE INFORMÁTICA', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(`Data/Hora: ${dataHora.toLocaleString('pt-BR')}`, 20, 40);
    
    // Adiciona dados apenas se estiverem preenchidos
    let y = 50;
    if (nomeCliente) { doc.text(`Nome: ${nomeCliente}`, 20, y); y += 10; }
    if (cpfCliente) { doc.text(`CPF: ${cpfCliente}`, 20, y); y += 10; }
    if (emailCliente) { doc.text(`E-mail: ${emailCliente}`, 20, y); y += 10; }
    if (telefoneCliente) { doc.text(`Telefone: ${telefoneCliente}`, 20, y); y += 10; }

    y += 10;
    doc.text('Serviços:', 20, y);
    y += 10;
    servicos.forEach(s => {
        doc.text(`• ${s}`, 25, y);
        y += 10;
    });

    const total = document.getElementById('valorTotal').textContent;
    doc.setFontSize(14);
    doc.text(`Valor Total: R$ ${total}`, 20, y + 10);

    // Salvar e guardar no histórico
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

    historico.forEach((item, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div>
                <strong>${item.nomeArquivo}</strong><br>
                <small>${item.dataHora}</small>
            </div>
            <div>
                <button onclick="baixarNovamente(${index})">Baixar</button>
                <button onclick="excluirDoHistorico(${index})" style="background:#e74c3c">Excluir</button>
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

