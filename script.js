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
    configurarDesconto();
    configurarAcrescimo();

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

// Configurar lógica do desconto (valor ou porcentagem)
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

// Configurar lógica do acréscimo / taxa extra (valor ou porcentagem)
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

// Busca valor médio baseado na descrição do serviço
function buscarValor(container) {
    const descricao = container.querySelector('.descricaoServico').value.toLowerCase().trim();
    const elementoValor = container.querySelector('#valorSugerido');
    const elementoDisplay = container.querySelector('.valor-sugerido');
    const inputValor = container.querySelector('.valorServico');

    if (!descricao) {
        alert('Digite uma descrição do serviço primeiro!');
        return;
    }

    let valorEncontrado = null;
    for (const [chave, valor] of Object.entries(valoresMercado)) {
        if (descricao.includes(chave)) {
            valorEncontrado = valor;
            break;
        }
    }

    if (!valorEncontrado) {
        valorEncontrado = 90; // Valor padrão se não encontrar
    }

    elementoValor.textContent = valorEncontrado.toFixed(2).replace('.', ',');
    elementoDisplay.style.display = 'inline-block';
    inputValor.value = valorEncontrado.toFixed(2);
    calcularTotal();
}

// Cálculo principal: subtotal, desconto, acréscimo e valor final
function calcularTotal() {
    let subtotal = 0;
    document.querySelectorAll('.servico-item').forEach(s => {
        const valorTexto = s.querySelector('.tipoServico').value;
        if (valorTexto && valorTexto !== 'Outro') {
            const valor = parseFloat(valorTexto.split('R$ ')[1].replace(',', '.'));
            if (!isNaN(valor)) subtotal += valor;
        } else if (valorTexto === 'Outro') {
            const val = parseFloat(s.querySelector('.valorServico').value.replace(',', '.'));
            if (!isNaN(val)) subtotal += val;
        }
    });

    // Cálculo Desconto
    let desconto = 0;
    const tipoDesc = document.querySelector('input[name="tipoDesconto"]:checked').value;
    if (tipoDesc === 'valor') {
        desconto = parseFloat(document.getElementById('descontoValor').value) || 0;
    } else if (tipoDesc === 'porcentagem') {
        const porc = parseFloat(document.getElementById('descontoPorc').value) || 0;
        desconto = subtotal * (porc / 100);
    }

    // Cálculo Acréscimo / Taxa Extra
    let acrescimo = 0;
    const tipoAcr = document.querySelector('input[name="tipoAcrescimo"]:checked').value;
    if (tipoAcr === 'valor') {
        acrescimo = parseFloat(document.getElementById('acrescimoValor').value) || 0;
    } else if (tipoAcr === 'porcentagem') {
        const porc = parseFloat(document.getElementById('acrescimoPorc').value) || 0;
        acrescimo = subtotal * (porc / 100);
    }

    const total = Math.max(subtotal - desconto + acrescimo, 0); // Evita valor negativo

    // Atualiza valores na tela
    document.getElementById('subtotal').textContent = subtotal.toFixed(2).replace('.', ',');
    
    const elemDesc = document.querySelector('.valor-desconto');
    if (desconto > 0) {
        elemDesc.style.display = 'block';
        document.getElementById('valorDesconto').textContent = desconto.toFixed(2).replace('.', ',');
    } else {
        elemDesc.style.display = 'none';
    }

    const elemAcr = document.querySelector('.valor-acrescimo');
    if (acrescimo > 0) {
        elemAcr.style.display = 'block';
        document.getElementById('valorAcrescimo').textContent = acrescimo.toFixed(2).replace('.', ',');
    } else {
        elemAcr.style.display = 'none';
    }

    document.getElementById('valorTotal').textContent = total.toFixed(2).replace('.', ',');
}

// Aplica máscaras de CPF e Telefone
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

// Função principal para gerar o PDF
function gerarOrcamento() {
    const nome = document.getElementById('nomeCliente').value.trim();
    const cpf = document.getElementById('cpfCliente').value.trim();
    const email = document.getElementById('emailCliente').value.trim();
    const telefone = document.getElementById('telefoneCliente').value.trim();
    const dataHora = new Date();
    const dataFormatada = dataHora.toLocaleString('pt-BR').replace(/[\/: ]/g, '-');

    // 📅 Cálculo da validade: data atual + 3 dias
    const dataValidade = new Date(dataHora);
    dataValidade.setDate(dataValidade.getDate() + 3);
    const dataValidadeTexto = dataValidade.toLocaleDateString('pt-BR');

    const subtotal = document.getElementById('subtotal').textContent;
    const descontoElem = document.querySelector('.valor-desconto');
    const descontoTexto = descontoElem.style.display !== 'none' ? document.getElementById('valorDesconto').textContent : '0,00';
    const acrescimoElem = document.querySelector('.valor-acrescimo');
    const acrescimoTexto = acrescimoElem.style.display !== 'none' ? document.getElementById('valorAcrescimo').textContent : '0,00';
    const total = document.getElementById('valorTotal').textContent;

    // Nome do arquivo PDF
    let nomeArquivo = 'Orcamento';
    if (nome) nomeArquivo += `_${nome.replace(/\s/g, '_')}`;
    nomeArquivo += `_${dataFormatada}.pdf`;

    // Coletar lista de serviços
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

    // 📄 Criação do PDF
    const doc = new jsPDF();
    
    // Cabeçalho
    doc.setFillColor(44, 62, 80);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('bold');
    doc.text('ORÇAMENTO DE SERVIÇOS DE INFORMÁTICA', 105, 25, { align: 'center' });
    
    // Dados gerais
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont('normal');
    doc.text(`Data/Hora: ${dataHora.toLocaleString('pt-BR')}`, 20, 50);

    let y = 60;
    if (nome) { doc.text(`Cliente: ${nome}`, 20, y); y += 8; }
    if (cpf) { doc.text(`CPF: ${cpf}`, 20, y); y += 8; }
    if (email) { doc.text(`E-mail: ${email}`, 20, y); y += 8; }
    if (telefone) { doc.text(`Telefone: ${telefone}`, 20, y); y += 12; }

    // Lista de Serviços
    doc.setFont('bold');
    doc.text('SERVIÇOS PRESTADOS:', 20, y);
    doc.setFont('normal');
    y += 10;
    servicos.forEach(s => {
        doc.text(`• ${s}`, 22, y);
        y += 8;
    });

    // Seção de Valores
    y += 5;
    doc.text(`Subtotal: R$ ${subtotal}`, 20, y);
    
    if (descontoTexto !== '0,00') {
        doc.setTextColor(192, 57, 43); // Vermelho para desconto
        doc.text(`Desconto: - R$ ${descontoTexto}`, 20, y + 8);
        doc.setTextColor(0, 0, 0);
        y += 8;
    }

    if (acrescimoTexto !== '0,00') {
        doc.setTextColor(41, 128, 185); // Azul para acréscimo
        doc.text(`Acréscimo: + R$ ${acrescimoTexto}`, 20, y + 8);
        doc.setTextColor(0, 0, 0);
        y += 8;
    }

    // Valor Final Destaque
    doc.setFillColor(234, 250, 241);
    doc.rect(15, y + 5, 180, 20, 'F');
    doc.setFontSize(14);
    doc.setFont('bold');
    doc.text(`VALOR FINAL: R$ ${total}`, 20, y + 18);

    // 📅 Validade alterada: Válido até + (3 dias)
    doc.setFontSize(11);
    doc.setTextColor(80, 80, 80);
    doc.text(`Válido até: ${dataValidadeTexto} (3 dias)`, 20, 275);

    // ✍️ Assinatura Digital estilo Pichação / Manuscrito
    doc.setFont('Permanent Marker', 'cursive');
    doc.setFontSize(22);
    doc.setTextColor(44, 62, 80);
    doc.text('RDTech', 160, 285, { align: 'right' });

    // Salva o arquivo
    doc.save(nomeArquivo);
    salvarNoHistorico({ nomeArquivo, dataHora: dataHora.toLocaleString('pt-BR'), conteudo: doc.output('blob') });
}

// Funções de Histórico (LocalStorage)
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

// Disponibiliza funções globalmente
window.excluirDoHistorico = excluirDoHistorico;
window.baixarNovamente = baixarNovamente;

