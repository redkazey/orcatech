const { jsPDF } = window.jspdf;

// ✅ MUITOS MAIS SERVIÇOS ADICIONADOS
const valoresMercado = {
    // ORIGINAIS
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
    // NOVOS ADICIONADOS
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
    "teste de cabeamento": 50
};

// ✅ COMBOS DE SERVIÇOS COM DESCONTO
const combosServicos = {
    "Combo Manutenção Completa (Limpeza + Troca Pasta + Otimização)": {
        servicos: ["limpeza interna", "troca de pasta térmica", "otimização de desempenho"],
        valorOriginal: 290,
        valorCombo: 240, // Desconto de R$50
        desconto: 50
    },
    "Combo Segurança (Remoção Vírus + Backup + Antivírus)": {
        servicos: ["remover vírus", "backup", "instalação de antivírus"],
        valorOriginal: 245,
        valorCombo: 195, // Desconto de R$50
        desconto: 50
    },
    "Combo Rede Completa (Wi-Fi + Cabeada + Configuração)": {
        servicos: ["rede wi-fi", "rede cabeada", "configuração de roteador"],
        valorOriginal: 400,
        valorCombo: 330, // Desconto de R$70
        desconto: 70
    },
    "Combo Formatação Completa (Formatar + Instalar Programas + Drivers)": {
        servicos: ["formatação", "instalação de programa", "instalação de sistema operacional"],
        valorOriginal: 335,
        valorCombo: 270, // Desconto de R$65
        desconto: 65
    },
    "Combo Upgrade PC (Memória + SSD + Instalação + Configuração)": {
        servicos: ["instalação de memória ram", "instalação de hd/ssd", "otimização de desempenho"],
        valorOriginal: 180,
        valorCombo: 145, // Desconto de R$35
        desconto: 35
    },
    "Combo Suporte Empresarial (Atendimento + Rede + Servidor)": {
        servicos: ["atendimento empresarial", "rede cabeada", "servidor"],
        valorOriginal: 530,
        valorCombo: 450, // Desconto de R$80
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
            
            // ✅ LIBERAR EDIÇÃO DO VALOR SEMPRE
            novo.querySelector('.valorServico').disabled = false;
            
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
                
                // Se for um combo, preenche valor mas DEIXA EDITÁVEL
                if (combosServicos[valorSelecionado]) {
                    const combo = combosServicos[valorSelecionado];
                    novo.querySelector('.descricaoServico').value = `${valorSelecionado} | Economia de R$ ${combo.desconto.toFixed(2).replace('.', ',')}`;
                    inputValor.value = combo.valorCombo.toFixed(2);
                    novo.querySelector('.valor-sugerido').textContent = `Valor do Combo: R$ ${combo.valorCombo.toFixed(2).replace('.', ',')}`;
                    novo.querySelector('.valor-sugerido').style.display = 'inline-block';
                }
                // Se for serviço normal, preenche valor mas DEIXA EDITÁVEL
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
            
            // ✅ RECALCULAR QUANDO EDITAR VALOR MANUALMENTE
            novo.querySelector('.valorServico').addEventListener('input', calcularTotal);
        });
    }

    document.querySelector('.removerServico').addEventListener('click', function() {
        if (document.querySelectorAll('.servico-item').length > 1) {
            this.parentElement.remove();
            calcularTotal();
        }
    });

    document.querySelector('.btn-buscar').addEventListener('click', () => buscarValor(document.querySelector('.servico-item')));
    
    // ✅ RECALCULAR QUANDO EDITAR VALOR DO PRIMEIRO ITEM
    document.querySelector('.valorServico').addEventListener('input', calcularTotal);

    // ✅ NOVOS BOTÕES
    document.getElementById('gerarOrcamento').addEventListener('click', gerarOrcamento);
    document.getElementById('gerarFaturaAprovada').addEventListener('click', () => gerarOrcamento(true));

    document.getElementById('exportarHistorico').addEventListener('click', exportarHistorico);
    document.getElementById('importarHistorico').addEventListener('click', () => document.getElementById('inputImportar').click());
    document.getElementById('inputImportar').addEventListener('change', importarHistorico);
});

// Adiciona os combos na lista de seleção
function preencherCombosNoSelect() {
    const selects = document.querySelectorAll('.tipoServico');
    selects.forEach(select => {
        // Adiciona um separador
        const separador = document.createElement('optgroup');
        separador.label = '--- 🎁 COMBOS COM DESCONTO ---';
        select.appendChild(separador);

        // Adiciona cada combo
        Object.keys(combosServicos).forEach(nomeCombo => {
            const opt = document.createElement('option');
            opt.value = nomeCombo;
            opt.textContent = `${nomeCombo} - R$ ${combosServicos[nomeCombo].valorCombo.toFixed(2).replace('.', ',')}`;
            select.appendChild(opt);
        });
    });
}

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
    let nomeServicoEncontrado = '';
    for (const [chave, valor] of Object.entries(valoresMercado)) {
        if (descricao.includes(chave)) {
            valorEncontrado = valor;
            nomeServicoEncontrado = chave;
            break;
        }
    }

    if (!valorEncontrado) valorEncontrado = 90;

    elementoValor.textContent = valorEncontrado.toFixed(2).replace('.', ',');
    elementoDisplay.style.display = 'inline-block';
    inputValor.value = valorEncontrado.toFixed(2);
    // ✅ CAMPO SEMPRE EDITÁVEL
    inputValor.disabled = false;
    
    calcularTotal();
}

function calcularTotal() {
    let subtotal = 0;
    document.querySelectorAll('.servico-item').forEach(s => {
        // ✅ PEGA SEMPRE O VALOR DIGITADO PELO USUÁRIO (mesmo que seja de combo/serviço)
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
    tel.addEventListener('input', (e) => {
        let v = e.target.value.replace(/\D/g, '');
        v = v.replace(/^(\d{2})(\d)/g, '($1) $2');
        v = v.replace(/(\d)(\d{4})$/, '$1-$2');
        e.target.value = v;
    });
}

// ✅ FUNÇÃO DE GERAR ORÇAMENTO/FATURA ATUALIZADA
function gerarOrcamento(ehFaturaAprovada = false, dadosDoHistorico = null) {
    // Se vier do histórico, usa os dados salvos
    let dados;
    if (dadosDoHistorico) {
        dados = dadosDoHistorico;
    } else {
        // Se for novo preenchimento
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

    // === GERAÇÃO DO PDF ===
    const doc = new jsPDF();
    const titulo = ehFaturaAprovada ? "FATURA DE SERVIÇOS - APROVADA" : "ORÇAMENTO DE SERVIÇOS DE INFORMÁTICA";
    const corStatus = dados.status === 'APROVADO' ? [39, 174, 96] : [241, 196, 15];

    // Cabeçalho
    doc.setFillColor(44, 62, 80);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('bold');
    doc.text(titulo, 105, 25, { align: 'center' });
    
    // Status
    doc.setFillColor(...corStatus);
    doc.roundedRect(140, 42, 50, 12, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text(dados.status, 165, 50, { align: 'center' });

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont('normal');
    doc.text(`Data/Hora: ${new Date(dados.dataHora).toLocaleString('pt-BR')}`, 20, 50);

    let y = 60;
    if (dados.dadosCliente.nome) { doc.text(`Cliente: ${dados.dadosCliente.nome}`, 20, y); y += 8; }
    if (dados.dadosCliente.cpf) { doc.text(`CPF: ${dados.dadosCliente.cpf}`, 20, y); y += 8; }
    if (dados.dadosCliente.email) { doc.text(`E-mail: ${dados.dadosCliente.email}`, 20, y); y += 8; }
    if (dados.dadosCliente.telefone) { doc.text(`Telefone: ${dados.dadosCliente.telefone}`, 20, y); y += 12; }

    // Observação
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

    // ✅ SE FOR FATURA APROVADA: ADICIONA DADOS DE PAGAMENTO
    if (ehFaturaAprovada) {
        y += 30;
        doc.setFillColor(245, 245, 245);
        doc.rect(15, y, 180, 80, 'F');
        doc.setFontSize(16);
        doc.setTextColor(44, 62, 80);
        doc.text("💳 FORMAS DE PAGAMENTO", 105, y + 10, { align: 'center' });
        
        // Link Principal
        doc.setFontSize(11);
        doc.text(`Acesse: ${DADOS_PAGAMENTO.linkPrincipal}`, 105, y + 22, { align: 'center' });
        
        // QR Code e Links
        doc.addImage(DADOS_PAGAMENTO.qrCodePixUrl, 'PNG', 25, y + 30, 40, 40);
        doc.text("Pagamento PIX", 45, y + 78, { align: 'center' });

        doc.text("Ou pague diretamente:", 100, y + 45);
        doc.setTextColor(52,  152, 219);
        doc.textWithLink("🔗 Pagar com PIX", 100, y + 55, { url: DADOS_PAGAMENTO.pixLink });
        doc.textWithLink("🔗 Pagar com Cartão de Crédito", 100, y + 65, { url: DADOS_PAGAMENTO.cartaoLink });
        doc.setTextColor(0,0,0);
    }

    doc.setFontSize(11);
    doc.setTextColor(80, 80, 80);
    doc.text(`Válido até: ${dados.dataValidadeTexto} (3 dias)`, 20, 275);

    doc.setFont('Permanent Marker', 'cursive');
    doc.setFontSize(22);
    doc.setTextColor(44, 62, 80);
    doc.text('RDTech', 160, 285, { align: 'right' });

    doc.save(dados.nomeArquivo);
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
        const nome = (item.dadosCliente && item.dadosCliente.nome) ? `Cliente: ${item.dadosCliente.nome}` : 'Cliente não informado';
        const corStatus = item.status === 'APROVADO' ? '#27ae60' : item.status === 'RECUSADO' ? '#e74c3c' : '#f39c12';
        
        li.innerHTML = `
            <div>
                <strong>${nome}</strong>
                <span style="background:${corStatus}; color:white; padding:2px 6px; border-radius:4px; font-size:11px; margin-left:8px;">${item.status || 'PENDENTE'}</span>
                <br><small>${item.nomeArquivo} | ${new Date(item.dataHora).toLocaleString('pt-BR')}</small>
            </div>
            <div style="margin-top:8px; display:flex; flex-wrap:wrap; gap:4px;">
                <button onclick="reeditarOrcamento(${index})" style="background:#2980b9;color:white;border:none;padding:6px 8px;border-radius:4px;">✏️ Editar</button>
                <button onclick="gerarFaturaDoHistorico(${index})" style="background:#27ae60;color:white;border:none;padding:6px 8px;border-radius:4px;">✅ Gerar Fatura</button>
                <button onclick="marcarComoRecusado(${index})" style="background:#e67e22;color:white;border:none;padding:6px 8px;border-radius:4px;">❌ Recusar</button>
                <button onclick="excluirDoHistorico(${index})" style="background:#e74c3c;color:white;border:none;padding:6px 8px;border-radius:4px;">🗑 Excluir</button>
            </div>
        `;
        lista.appendChild(li);
    });
}

// ✅ FUNÇÕES NOVAS DO HISTÓRICO
function gerarFaturaDoHistorico(index) {
    const historico = JSON.parse(localStorage.getItem('orcamentos')) || [];
    const item = historico[index];
    if (item) {
        item.status = 'APROVADO';
        gerarOrcamento(true, item);
        salvarNoHistorico(item); // Atualiza status
    }
}

function marcarComoRecusado(index) {
    const historico = JSON.parse(localStorage.getItem('orcamentos')) || [];
    if (historico[index]) {
        historico[index].status = 'RECUSADO';
        localStorage.setItem('orcamentos', JSON.stringify(historico));
        carregarHistorico();
    }
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
    document.getElementById('observacaoGeral').value = item.observacao || '';
    
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
                // ✅ LIBERAR EDIÇÃO AO RECARREGAR
                el.querySelector('.valorServico').addEventListener('input', calcularTotal);
            }
            el.querySelector('.tipoServico').value = servico.tipo || '';
            el.querySelector('.descricaoServico').value = servico.descricao || '';
            el.querySelector('.valorServico').value = servico.valor || '';
            el.querySelector('.valorServico').disabled = false; // SEMPRE EDITÁVEL
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

window.excluirDoHistorico = excluirDoHistorico;
window.reeditarOrcamento = reeditarOrcamento;
window.exportarHistorico = exportarHistorico;
window.importarHistorico = importarHistorico;
window.gerarFaturaDoHistorico = gerarFaturaDoHistorico;
window.marcarComoRecusado = marcarComoRecusado;

