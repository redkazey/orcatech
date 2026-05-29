const { jsPDF } = window.jspdf;

// ✅ MAIS DE 50 SERVIÇOS CADASTRADOS
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
    "rede cabeada": 150,
    "instalação de sistema operacional": 120,
    "configuração de servidor de arquivos": 220,
    "manutenção de notebook": 130,
    "troca de tela notebook": 180,
    "troca de teclado notebook": 120,
    "troca de bateria notebook": 90,
    "troca de carcaça notebook": 150,
    "instalação de placa de vídeo": 60,
    "instalação de memória ram": 40,
    "instalação de hd/ssd": 45,
    "troca de pasta térmica": 50,
    "configuração de e-mail corporativo": 80,
    "monitoramento de rede": 190,
    "contrato de manutenção mensal": 350,
    "remoção de programas indesejados": 70,
    "otimização de desempenho": 95,
    "configuração de firewall": 140,
    "instalação de antivírus": 85,
    "configuração de vpn": 110,
    "mapeamento de rede": 130,
    "instalação de switch": 75,
    "configuração de roteador": 80,
    "instalação de servidor nuvem": 280,
    "migração de dados": 160,
    "clonagem de hd": 100,
    "desbloqueio de bios": 95,
    "reparo de placa mãe": 200,
    "reparo de fonte de alimentação": 110,
    "configuração de impressora em rede": 140,
    "instalação de sistema de segurança": 230,
    "auditoria de segurança": 300,
    "consultoria em ti": 150,
    "instalação de servidor de backup": 260,
    "configuração de domínio": 180,
    "criação de usuário e permissões": 60,
    "restauração de sistema": 120,
    "limpeza de software": 65,
    "atualização de bios": 80,
    "configuração de acessos remotos": 90,
    "instalação de cabo de rede": 35,
    "teste de cabeamento": 50,
    "configuração de proxy": 120,
    "instalação de nobreak": 90,
    "calibração de bateria": 40,
    "recuperação de senha": 70,
    "configuração de hd externo": 55,
    "instalação de leitor de código de barras": 85,
    "manutenção de estação de trabalho": 160
};

// ✅ COMBOS DE SERVIÇOS COM DESCONTO
const combosServicos = {
    "Combo Manutenção Completa (Limpeza + Troca Pasta + Otimização)": {
        servicos: ["limpeza interna", "troca de pasta térmica", "otimização de desempenho"],
        valorOriginal: 290,
        valorCombo: 240,
        desconto: 50
    },
    "Combo Segurança (Remoção Vírus + Backup + Antivírus)": {
        servicos: ["remover vírus", "backup", "instalação de antivírus"],
        valorOriginal: 245,
        valorCombo: 195,
        desconto: 50
    },
    "Combo Rede Completa (Wi-Fi + Cabeada + Configuração)": {
        servicos: ["rede wi-fi", "rede cabeada", "configuração de roteador"],
        valorOriginal: 400,
        valorCombo: 330,
        desconto: 70
    },
    "Combo Formatação Completa (Formatar + Instalar Programas + Drivers)": {
        servicos: ["formatação", "instalação de programa", "instalação de sistema operacional"],
        valorOriginal: 335,
        valorCombo: 270,
        desconto: 65
    },
    "Combo Upgrade PC (Memória + SSD + Instalação + Configuração)": {
        servicos: ["instalação de memória ram", "instalação de hd/ssd", "otimização de desempenho"],
        valorOriginal: 180,
        valorCombo: 145,
        desconto: 35
    },
    "Combo Suporte Empresarial (Atendimento + Rede + Servidor)": {
        servicos: ["atendimento empresarial", "rede cabeada", "servidor"],
        valorOriginal: 530,
        valorCombo: 450,
        desconto: 80
    }
};

// ✅ LINKS DE PAGAMENTO
const DADOS_PAGAMENTO = {
    linkPrincipal: "https://linknabio.gg/redkz",
    pixLink: "https://linknabio.gg/redkz#pix",
    cartaoLink: "https://linknabio.gg/redkz#cartao",
    qrCodePixUrl: "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://linknabio.gg/redkz#pix"
};

document.addEventListener('DOMContentLoaded', () => {
    carregarHistorico();
    calcularTotal();
    aplicarMascaras();
    configurarDesconto();
    configurarAcrescimo();
    preencherCombosNoSelect();

    // ✅ ADICIONAR NOVO SERVIÇO - CORRIGIDO
    const btnAdicionar = document.getElementById('adicionarServico');
    if (btnAdicionar) {
        btnAdicionar.addEventListener('click', () => {
            const container = document.getElementById('listaServicos');
            const modelo = document.querySelector('.servico-item');
            if (!modelo) return;

            const novo = modelo.cloneNode(true);
            
            novo.querySelector('.tipoServico').value = '';
            novo.querySelector('.descricaoServico').value = '';
            novo.querySelector('.valorServico').value = '';
            novo.querySelector('.valor-sugerido').style.display = 'none';
            novo.querySelector('.valorServico').disabled = false; // SEMPRE EDITÁVEL
            
            container.appendChild(novo);

            novo.querySelector('.removerServico').addEventListener('click', () => {
                if (document.querySelectorAll('.servico-item').length > 1) {
                    novo.remove();
                    calcularTotal();
                }
            });

            novo.querySelector('.tipoServico').addEventListener('change', function() {
                const valorSelecionado = this.value;
                const inputValor = novo.querySelector('.valorServico');
                
                if (combosServicos[valorSelecionado]) {
                    const combo = combosServicos[valorSelecionado];
                    novo.querySelector('.descricaoServico').value = `${valorSelecionado} | Economia de R$ ${combo.desconto.toFixed(2).replace('.', ',')}`;
                    inputValor.value = combo.valorCombo.toFixed(2);
                    novo.querySelector('.valor-sugerido').textContent = `Valor do Combo: R$ ${combo.valorCombo.toFixed(2).replace('.', ',')}`;
                    novo.querySelector('.valor-sugerido').style.display = 'inline-block';
                }
                else if (valorSelecionado && valorSelecionado !== 'Outro') {
                    const valor = parseFloat(valorSelecionado.split('R$ ')[1].replace(',', '.'));
                    if (!isNaN(valor)) {
                        inputValor.value = valor.toFixed(2);
                        novo.querySelector('.valor-sugerido').textContent = `Valor sugerido: R$ ${valor.toFixed(2).replace('.', ',')}`;
                        novo.querySelector('.valor-sugerido').style.display = 'inline-block';
                    }
                } else {
                    novo.querySelector('.valor-sugerido').style.display = 'none';
                }
                calcularTotal();
            });

            novo.querySelector('.btn-buscar').addEventListener('click', () => buscarValor(novo));
            novo.querySelector('.valorServico').addEventListener('input', calcularTotal);
        });
    }

    // Remover primeiro item
    document.querySelector('.removerServico').addEventListener('click', function() {
        if (document.querySelectorAll('.servico-item').length > 1) {
            this.parentElement.remove();
            calcularTotal();
        }
    });

    document.querySelector('.btn-buscar').addEventListener('click', () => buscarValor(document.querySelector('.servico-item')));
    document.querySelector('.valorServico').addEventListener('input', calcularTotal);

    document.getElementById('gerarOrcamento').addEventListener('click', gerarOrcamento);
    document.getElementById('gerarFaturaAprovada').addEventListener('click', () => gerarOrcamento(true));

    document.getElementById('exportarHistorico').addEventListener('click', exportarHistorico);
    document.getElementById('importarHistorico').addEventListener('click', () => document.getElementById('inputImportar').click());
    document.getElementById('inputImportar').addEventListener('change', importarHistorico);
});

function preencherCombosNoSelect() {
    const selects = document.querySelectorAll('.tipoServico');
    selects.forEach(select => {
        const separador = document.createElement('optgroup');
        separador.label = '--- 🎁 COMBOS COM DESCONTO ---';
        select.appendChild(separador);

        Object.keys(combosServicos).forEach(nomeCombo => {
            const opt = document.createElement('option');
            opt.value = nomeCombo;
            opt.textContent = `${nomeCombo} - R$ ${combosServicos[nomeCombo].valorCombo.toFixed(2).replace('.', ',')}`;
            select.appendChild(opt);
        });
    });
}

// ✅ FUNÇÃO DE DESCONTO CORRIGIDA
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

// ✅ FUNÇÃO DE ACRÉSCIMO CORRIGIDA
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
    inputValor.disabled = false;
    
    calcularTotal();
}

// ✅ CÁLCULO TOTAL 100% CORRIGIDO
function calcularTotal() {
    let subtotal = 0;
    document.querySelectorAll('.servico-item').forEach(s => {
        const val = parseFloat(s.querySelector('.valorServico').value.replace(',', '.'));
        if (!isNaN(val)) subtotal += val;
    });

    let desconto = 0;
    const tipoDesc = document.querySelector('input[name="tipoDesconto"]:checked').value;
    if (tipoDesc === 'valor') desconto = parseFloat(document.getElementById('descontoValor').value) || 0;
    if (tipoDesc === 'porcentagem') {
        const porc = parseFloat(document.getElementById('descontoPorc').value) || 0;
        desconto = subtotal * (porc / 100);
    }

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
    tel.addEventListener('input, keydown, keyup', (e) => {
        let v = e.target.value.replace(/\D/g, '');
        v = v.replace(/^(\d{2})(\d)/g, '($1) $2');
        v = v.replace(/(\d)(\d{4})$/, '$1-$2');
        e.target.value = v;
    });
}

// ✅ GERAÇÃO DE PDF COM GARANTIA DE 90 DIAS POR LEI - TEXTO COMPLETO
function gerarOrcamento(ehFaturaAprovada = false, dadosDoHistorico = null) {
    let dados;
    if (dadosDoHistorico) {
        dados = dadosDoHistorico;
    } else {
        const nome = document.getElementById('nomeCliente').value.trim();
        const cpf = document.getElementById('cpfCliente').value.trim();
        const email = document.getElementById('emailCliente').value.trim();
        const telefone = document.getElementById('telefoneCliente').value.trim();
        const observacao = document.getElementById('observacaoGeral').value.trim();
        const status = ehFaturaAprovada ? 'APROVADO' : 'PENDENTE';
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

        let nomeArquivo = ehFaturaAprovada ? `FATURA_APROVADA_` : `ORCAMENTO_`;
        if (nome) nomeArquivo += `${nome.replace(/\s/g, '_')}_`;
        nomeArquivo += `${dataFormatada}.pdf`;

        const servicos = [];
        document.querySelectorAll('.servico-item').forEach(s => {
            servicos.push({
                tipo: s.querySelector('.tipoServico').value || 'Serviço Personalizado',
                descricao: s.querySelector('.descricaoServico').value || 'Sem descrição',
                valor: s.querySelector('.valorServico').value
            });
        });

        if (servicos.every(s => !s.valor || parseFloat(s.valor) === 0)) {
            alert('Adicione pelo menos um serviço com valor!');
            return;
        }

        dados = {
            nomeArquivo, dataHora, dataValidadeTexto,
            dadosCliente: { nome, cpf, email, telefone },
            observacao, status,
            servicos,
            valores: { subtotal, descontoTexto, acrescimoTexto, total },
            ajustes: { tipoDesconto, valorDesconto, porcDesconto, tipoAcrescimo, valorAcrescimo, porcAcrescimo }
        };
        salvarNoHistorico(dados);
    }

    const doc = new jsPDF();
    const titulo = ehFaturaAprovada ? "FATURA DE SERVIÇOS - APROVADA" : "ORÇAMENTO DE SERVIÇOS DE INFORMÁTICA";
    const corStatus = dados.status === 'APROVADO' ? [39, 174, 96] : [241, 196, 15];

    doc.setFillColor(44, 62, 80);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('bold');
    doc.text(titulo, 105, 25, { align: 'center' });
    
    doc.setFillColor(...corStatus);
    doc.roundedRect(140, 42, 50, 12, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text(dados.status, 165, 50, { align: 'center' });

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont('normal');
    doc.text(`Data/Hora: ${new Date(dados.dataHora).toLocaleString('pt-BR')}`, 20, 50);
    doc.text(`Válido até: ${dados.dataValidadeTexto}`, 110, 50);

    let y = 60;
    if (dados.dadosCliente.nome) { doc.text(`Cliente: ${dados.dadosCliente.nome}`, 20, y); y += 8; }
    if (dados.dadosCliente.cpf) { doc.text(`CPF: ${dados.dadosCliente.cpf}`, 20, y); y += 8; }
    if (dados.dadosCliente.email) { doc.text(`E-mail: ${dados.dadosCliente.email}`, 20, y); y += 8; }
    if (dados.dadosCliente.telefone) { doc.text(`Telefone: ${dados.dadosCliente.telefone}`, 20, y); y += 12; }

    if (dados.observacao) {
        doc.setFont('bold');
        doc.text("📝 Observações:", 20, y);
        doc.setFont('normal');
        doc.text(dados.observacao, 20, y + 8, { maxWidth: 170 });
        y += 15;
    }

    doc.setFont('bold');
    doc.text('SERVIÇOS PRESTADOS:', 20, y);
    doc.setFont('normal');
    y += 10;
    dados.servicos.forEach(s => {
        let texto = s.tipo;
        if (s.descricao) texto += ` | ${s.descricao}`;
        if (s.valor) texto += ` - R$ ${s.valor}`;
        doc.text(`• ${texto}`, 22, y);
        y += 8;
    });

    y += 5;
    doc.text(`Subtotal: R$ ${dados.valores.subtotal}`, 20, y);
    
    if (dados.valores.descontoTexto !== '0,00') {
        doc.setTextColor(192, 57, 43);
        doc.text(`Desconto: - R$ ${dados.valores.descontoTexto}`, 20, y + 8);
        doc.setTextColor(0, 0, 0);
        y += 8;
    }

    if (dados.valores.acrescimoTexto !== '0,00') {
        doc.setTextColor(41, 128, 185);
        doc.text(`Acréscimo: + R$ ${dados.valores.acrescimoTexto}`, 20, y + 8);
        doc.setTextColor(0, 0, 0);
        y += 8;
    }

    doc.setFillColor(234, 250, 241);
    doc.rect(15, y + 5, 180, 20, 'F');
    doc.setFontSize(14);
    doc.setFont('bold');
    doc.text(`VALOR FINAL: R$ ${dados.valores.total}`, 20, y + 18);

    // ✅ GARANTIA DE 90 DIAS CONFORME LEI 8.078/90 (CDC) - TEXTO COMPLETO
    y += 28;
    doc.setFillColor(255, 250, 205);
    doc.rect(15, y, 180, 32, 'F');
    doc.setTextColor(156, 101, 0);
    doc.setFontSize(11);
    doc.setFont('bold');
    doc.text("✅ GARANTIA LEGAL DE 90 DIAS (CDC - LEI Nº 8.078/90)", 105, y + 8, { align: 'center' });
    doc.setFont('normal');
    doc.text("Garantia contra defeitos técnicos no serviço prestado, válida por 90 dias corridos a partir da execução.", 105, y + 16, { align: 'center', maxWidth: 170 });
    doc.text("Após este prazo, extingue-se a responsabilidade legal por vícios ou defeitos.", 105, y + 24, { align: 'center', maxWidth: 170 });
    doc.setTextColor(0, 0, 0);

    // ✅ SEÇÃO DE PAGAMENTO
    y += 40;
    doc.setFillColor(240, 240, 240);
    doc.rect(15, y, 180, 40, 'F');
    doc.setFontSize(12);
    doc.setFont('bold');
    doc.text("💳 FORMAS DE PAGAMENTO", 105, y + 8, { align: 'center' });
    doc.setFont('normal');
    doc.setFontSize(10);
    doc.text("Aceitamos Pix, Cartão de Crédito/Débito e Transferência.", 105, y + 16, { align: 'center' });
    doc.text(`Link para pagamento: ${DADOS_PAGAMENTO.linkPrincipal}`, 105, y + 24, { align: 'center' });
    doc.text("Pagamento à vista ou condições combinadas previamente.", 105, y + 32, { align: 'center' });

    // ✅ ASSINATURAS
    y += 50;
    doc.line(20, y, 80, y);
    doc.text("Assinatura do Cliente", 30, y + 8);

    doc.line(120, y, 180, y);
    doc.text("Assinatura Responsável Técnico", 125, y + 8);

    doc.setFontSize(8);
    doc.text("RDTech - Soluções em Informática | CNPJ: 00.000.000/0001-00 | contato@rdtech.com.br", 105, 285, { align: 'center' });

    doc.save(dados.nomeArquivo);
}

function salvarNoHistorico(dados) {
    let historico = JSON.parse(localStorage.getItem('orcamentos_historico')) || [];
    historico.unshift(dados);
    localStorage.setItem('orcamentos_historico', JSON.stringify(historico));
    carregarHistorico();
}

function carregarHistorico() {
    const lista = document.getElementById('listaHistorico');
    const vazio = document.getElementById('vazioHistorico');
    lista.innerHTML = '';
    lista.appendChild(vazio);

    const historico = JSON.parse(localStorage.getItem('orcamentos_historico')) || [];

    if (historico.length === 0) {
        vazio.style.display = 'block';
        return;
    }
    vazio.style.display = 'none';

    historico.forEach((item, index) => {
        const li = document.createElement('li');
        li.className = 'p-3 bg-gray-50 rounded border border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2';

        const statusColor = item.status === 'APROVADO' ? 'text-green-600 font-medium' : 'text-yellow-600 font-medium';

        li.innerHTML = `
            <div>
                <p class="font-semibold">${item.dadosCliente.nome || 'Cliente não informado'}</p>
                <p class="text-sm text-gray-600">${new Date(item.dataHora).toLocaleString('pt-BR')} | Total: R$ ${item.valores.total}</p>
                <p class="text-sm ${statusColor}">Status: ${item.status}</p>
            </div>
            <div class="flex gap-2 w-full sm:w-auto">
                <button class="visualizar-btn text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200" data-index="${index}">👁️ Ver</button>
                <button class="baixar-btn text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200" data-index="${index}">📄 Baixar</button>
                <button class="excluir-btn text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200" data-index="${index}">🗑️</button>
            </div>
        `;
        lista.appendChild(li);
    });

    document.querySelectorAll('.visualizar-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = parseInt(e.target.getAttribute('data-index'));
            visualizarOrcamento(historico[idx]);
        });
    });

    document.querySelectorAll('.baixar-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = parseInt(e.target.getAttribute('data-index'));
            gerarOrcamento(historico[idx].status === 'APROVADO', historico[idx]);
        });
    });

    document.querySelectorAll('.excluir-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = parseInt(e.target.getAttribute('data-index'));
            excluirDoHistorico(idx);
        });
    });
}

function excluirDoHistorico(indice) {
    let historico = JSON.parse(localStorage.getItem('orcamentos_historico')) || [];
    historico.splice(indice, 1);
    localStorage.setItem('orcamentos_historico', JSON.stringify(historico));
    carregarHistorico();
}

function visualizarOrcamento(dados) {
    let conteudo = `=== ORÇAMENTO ===\n`;
    conteudo += `Data: ${new Date(dados.dataHora).toLocaleString('pt-BR')}\nStatus: ${dados.status}\n`;
    conteudo += `Cliente: ${dados.dadosCliente.nome || 'Não informado'}\nCPF: ${dados.dadosCliente.cpf || 'Não informado'}\n`;
    conteudo += `\n--- Serviços ---\n`;
    dados.servicos.forEach(s => {
        conteudo += `${s.tipo} - R$ ${s.valor}\n`;
        if (s.descricao) conteudo += `   Obs: ${s.descricao}\n`;
    });
    conteudo += `\n--- Valores ---\nSubtotal: R$ ${dados.valores.subtotal}\nDesconto: R$ ${dados.valores.descontoTexto}\nAcréscimo: R$ ${dados.valores.acrescimoTexto}\nTOTAL: R$ ${dados.valores.total}`;

    alert(conteudo);
}

function exportarHistorico() {
    const historico = localStorage.getItem('orcamentos_historico') || '[]';
    const blob = new Blob([historico], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `historico_orcamentos_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

function importarHistorico(e) {
    const arquivo = e.target.files[0];
    if (!arquivo) return;

    const leitor = new FileReader();
    leitor.onload = function(evt) {
        try {
            const dados = JSON.parse(evt.target.result);
            if (Array.isArray(dados)) {
                localStorage.setItem('orcamentos_historico', JSON.stringify(dados));
                carregarHistorico();
                alert('Histórico importado com sucesso!');
            } else {
                alert('Arquivo inválido.');
            }
        } catch (erro) {
            alert('Erro ao ler o arquivo.');
        }
    };
    leitor.readAsText(arquivo);
    };
}

