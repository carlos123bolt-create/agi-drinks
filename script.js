let produtosDados = [];
let carrinho = [];
const WHATSAPP_NUMERO = "5511954357092"; // <-- COLOQUE SEU TELEFONE COM DDD AQUI (Ex: 5511912345678)

window.addEventListener('DOMContentLoaded', () => {
    verificarHorarioFuncionamento();
    setInterval(verificarHorarioFuncionamento, 60000); // Atualiza o status a cada 1 minuto
    carregarProdutos();
});

// Sistema Inteligente de Horário
function verificarHorarioFuncionamento() {
    const agora = new Date();
    const diaSemana = agora.getDay(); // 0 = Domingo, 1 = Segunda, 2 = Terça...
    const hora = agora.getHours();
    const minuto = agora.getMinutes();
    const tempoAtualEmMinutos = (hora * 60) + minuto;
    
    const inicioMinutos = 16 * 60; // 16:00
    const fimMinutos = 23 * 60;   // 23:00

    const bola = document.getElementById('status-bola');
    const texto = document.getElementById('status-texto');

    // Terça-feira não abre (diaSemana === 2)
    if (diaSemana === 2) {
        bola.className = "status-bola fechado";
        texto.innerText = "Fechado no momento";
        return;
    }

    // Verifica se está dentro da janela de horário
    if (tempoAtualEmMinutos >= inicioMinutos && tempoAtualEmMinutos < fimMinutos) {
        bola.className = "status-bola aberto";
        texto.innerText = "Aberto - Faça seu Pedido";
    } else {
        bola.className = "status-bola fechado";
        texto.innerText = "Fechado no momento";
    }
}

// Carregar catálogo via JSON
function carregarProdutos() {
    fetch('produtos.json')
        .then(response => response.json())
        .then(data => {
            produtosDados = data;
            renderizarProdutos(produtosDados);
        })
        .catch(err => console.error("Erro ao carregar catálogo de produtos:", err));
}

function renderizarProdutos(lista) {
    const vitrine = document.getElementById('vitrine-produtos');
    vitrine.innerHTML = "";

    lista.forEach(prod => {
        const itemHtml = document.createElement('div');
        itemHtml.className = "produto-card";
        
        // Verifica se possui o botão de mídia para o Drink
        let botaoMidia = "";
        if(prod.categoria === "Drinks da Casa") {
            botaoMidia = `<button class="btn-midia-drink" onclick="abrirMidiaModal('${prod.nome}')"><i class="fas fa-play-circle"></i> Ver Preparo</button>`;
        }

        itemHtml.innerHTML = `
            <div class="produto-info-bloco">
                <h3 class="produto-nome">${prod.nome}</h3>
                <p class="produto-desc">${prod.descricao || ''}</p>
                <div class="produto-meta">
                    <span class="produto-preco">R$ ${prod.preco.toFixed(2).replace('.',',')}</span>
                    ${botaoMidia}
                </div>
            </div>
            <button class="btn-adicionar" onclick="adicionarAoCarrinho(${prod.id})"><i class="fas fa-plus"></i> Adicionar</button>
        `;
        vitrine.appendChild(itemHtml);
    });
}

function filtrarCategoria(cat) {
    // Altera classe ativa dos botões
    const botoes = document.querySelectorAll('.nav-btn');
    botoes.forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');

    if(cat === 'Todos') {
        renderizarProdutos(produtosDados);
    } else {
       const filtrados = produtosDados.filter(p => p.categoria.trim().toLowerCase() === cat.trim().toLowerCase());
        renderizarProdutos(filtrados);
    }
}

// Manipulação do Carrinho
function adicionarAoCarrinho(id) {
    const produto = produtosDados.find(p => p.id === id);
    const existente = carrinho.find(item => item.id === id);

    if(existente) {
        existente.quantidade++;
    } else {
        carrinho.push({ ...produto, quantidade: 1 });
    }
    atualizarInterfaceCarrinho();
}

function alterarQuantidade(id, mudanca) {
    const item = carrinho.find(i => i.id === id);
    if(item) {
        item.quantidade += mudanca;
        if(item.quantidade <= 0) {
            carrinho = carrinho.filter(i => i.id !== id);
        }
    }
    atualizarInterfaceCarrinho();
    renderizarItensCarrinhoModal();
}

function atualizarInterfaceCarrinho() {
    const qtdTotal = carrinho.reduce((acc, item) => acc + item.quantidade, 0);
    const valorTotal = carrinho.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);

    document.getElementById('carrinho-qtd').innerText = `${qtdTotal} ${qtdTotal === 1 ? 'item' : 'itens'}`;
    document.getElementById('carrinho-total-topo').innerText = `R$ ${valorTotal.toFixed(2).replace('.',',')}`;

    const barra = document.getElementById('barra-carrinho');
    if(carrinho.length > 0) {
        barra.classList.add('active');
    } else {
        barra.classList.remove('active');
    }
}

// Modais do Sistema
function abrirCheckoutModal() {
    document.getElementById('checkout-modal').classList.add('active');
    renderizarItensCarrinhoModal();
}

function fecharCheckoutModal() {
    document.getElementById('checkout-modal').classList.remove('active');
}

function abrirMidiaModal(nomeDrink) {
    document.getElementById('midia-titulo').innerText = `Preparo - ${nomeDrink}`;
    const player = document.getElementById('video-player');
    
    // Caminho relativo ao vídeo enviado no repositório do github
   // player.src = "public/manifest.json" ? "public/manifest.json" : ""; 
    // Como demonstração prática, se você subir o vídeo na raiz com o nome 'preparar.mp4':
    player.src = "preparo.mp4";
    player.load();
    
    document.getElementById('midia-modal').classList.add('active');
    player.play().catch(() => {});
}

function fecharMidiaModal() {
    const player = document.getElementById('video-player');
    player.pause();
    document.getElementById('midia-modal').classList.remove('active');
}

function renderizarItensCarrinhoModal() {
    const container = document.getElementById('itens-carrinho-lista');
    container.innerHTML = "";

    if(carrinho.length === 0) {
        container.innerHTML = `<p class="carrinho-vazio-texto">Seu carrinho está vazio.</p>`;
        calcularTotalFinal();
        return;
    }

    carrinho.forEach(item => {
        const itemLinha = document.createElement('div');
        itemLinha.className = "item-carrinho-linha";
        itemLinha.innerHTML = `
            <div class="item-carrinho-infos">
                <h4>${item.nome}</h4>
                <span>R$ ${(item.preco * item.quantidade).toFixed(2).replace('.',',')}</span>
            </div>
            <div class="item-carrinho-controles">
                <button onclick="alterarQuantidade(${item.id}, -1)">-</button>
                <span>${item.quantidade}</span>
                <button onclick="alterarQuantidade(${item.id}, 1)">+</button>
            </div>
        `;
        container.appendChild(itemLinha);
    });

    calcularTotalFinal();
}

function atualizarLogistica() {
    const tipo = document.querySelector('input[name="tipo_entrega"]:checked').value;
    const campoCliente = document.getElementById('campo-endereco-cliente');
    const campoAdega = document.getElementById('campo-endereco-adega');
    const linhaFrete = document.getElementById('txt-frete-linha');

    if(tipo === 'entrega') {
        campoCliente.classList.remove('hidden');
        campoAdega.classList.add('hidden');
        linhaFrete.style.display = "block";
    } else {
        campoCliente.classList.add('hidden');
        campoAdega.classList.remove('hidden');
        linhaFrete.style.display = "none";
    }
    calcularTotalFinal();
}

function calcularTotalFinal() {
    const subtotal = carrinho.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
    const tipoEntrega = document.querySelector('input[name="tipo_entrega"]:checked').value;
    
    let frete = 0;
    if(tipoEntrega === 'entrega') {
        frete = parseFloat(document.querySelector('input[name="taxa_frete"]:checked').value);
    }

    const totalGeral = subtotal + frete;

    document.getElementById('resumo-subtotal').innerText = `R$ ${subtotal.toFixed(2).replace('.',',')}`;
    document.getElementById('resumo-frete').innerText = `R$ ${frete.toFixed(2).replace('.',',')}`;
    document.getElementById('resumo-total-geral').innerText = `R$ ${totalGeral.toFixed(2).replace('.',',')}`;

    // Validar pedido mínimo de 15 reais para entrega
    const avisoMinimo = document.getElementById('aviso-minimo');
    const btnFinalizar = document.getElementById('btn-finalizar');

    if(tipoEntrega === 'entrega' && subtotal < 15.00 && carrinho.length > 0) {
        avisoMinimo.classList.remove('hidden');
        btnFinalizar.disabled = true;
        btnFinalizar.style.opacity = "0.5";
    } else {
        avisoMinimo.classList.add('hidden');
        btnFinalizar.disabled = false;
        btnFinalizar.style.opacity = "1";
    }
}

// Formatar e enviar para o WhatsApp
function enviarPedidoWhatsApp() {
    if(carrinho.length === 0) {
        alert("Adicione itens ao carrinho antes de finalizar!");
        return;
    }

    // Captura dos novos campos e dados do formulário
    const nomeCliente = document.getElementById('nome-cliente')?.value || "Não informado";
    const tipoEntrega = document.querySelector('input[name="tipo_entrega"]:checked')?.value;
    const formaPagamento = document.getElementById('forma-pagamento').value;
    const observacoes = document.getElementById('observacoes').value;
    
    const subtotal = carrinho.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
    let frete = 0;
    if(tipoEntrega === 'entrega') {
        frete = parseFloat(document.querySelector('input[name="taxa_frete"]:checked')?.value || 0);
    }
    const totalGeral = subtotal + frete;

    // Cabeçalho da Mensagem
    let textoMsg = *Novo Pedido - AGI DRINKS* 🍹\n;
    textoMsg += -----------------------------------\n\n;
    
    // Dados do Cliente
    textoMsg += *Cliente:* ${nomeCliente}\n\n;

    // Itens do Pedido
    textoMsg += *--- ITENS DO PEDIDO ---*\n;
    carrinho.forEach(item => {
        textoMsg += *${item.quantidade}x* ${item.nome}\n;
        textoMsg += `   Preço: R$ ${(item.preco * item.quantidade).toFixed(2).replace('.',',')}\n\n`;
    });
    textoMsg += -----------------------------------\n;

    // Configuração de Entrega / Retirada
    if(tipoEntrega === 'entrega') {
        const rua = document.getElementById('rua').value;
        const numero = document.getElementById('numero')?.value || '';
        const bairro = document.getElementById('bairro')?.value || '';
        const regiao = frete === 5 ? "Diadema" : "Outra Região";

        if(!rua || !numero || !bairro) {
            alert("Por favor, preencha todos os campos do endereço (Rua, Número e Bairro) para a entrega!");
            return;
        }

        textoMsg += *Modo:* 🚀 Entrega em Casa\n;
        textoMsg += *Endereço:* ${rua}, nº ${numero} - ${bairro}\n;
        textoMsg += *Frete (${regiao}):* R$ ${frete.toFixed(2).replace('.',',')}\n\n;
    } else {
        textoMsg += *Modo:* 🏪 Retirada no Local\n;
        textoMsg += *Endereço Adega:* Rua Margarida Maria Alves, 357 - Serraria\n\n;
    }

    // Observações (Se houver)
    if (observacoes.trim() !== "") {
        textoMsg += *Observações:* ${observacoes}\n\n;
    }

    // Fechamento de Valores e Pagamento
    textoMsg += -----------------------------------\n;
    textoMsg += *Subtotal:* R$ ${subtotal.toFixed(2).replace('.',',')}\n;
    if(tipoEntrega === 'entrega') {
        textoMsg += *Frete:* R$ ${frete.toFixed(2).replace('.',',')}\n;
    }
    textoMsg += *Total Geral:* R$ ${totalGeral.toFixed(2).replace('.',',')}\n;
    textoMsg += *Forma de Pagamento:* 💳 ${formaPagamento}\n;

    // Codifica para a URL do WhatsApp e envia
    const urlFinal = https://api.whatsapp.com/send?phone=${WHATSAPP_NUMERO}&text=${encodeURIComponent(textoMsg)};
    window.open(urlFinal, '_blank');
}
