// CONFIGURAÇÃO DO WHATSAPP DA ADEGA (Coloque o seu número com DDD aqui)
const WHATSAPP_NUMERO = "5511954357092"; 

let carrinho = [];
let produtosDados = [];
let tipoEntrega = "entrega"; // 'entrega' ou 'retirada'
const TAXA_FRETE = 5.00;
const PEDIDO_MINIMO_ENTREGA = 15.00;

document.addEventListener("DOMContentLoaded", () => {
    verificarHorarioFuncionamento();
    setInterval(verificarHorarioFuncionamento, 30000); // Atualiza o status a cada 30 segundos
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
    const texto = document.getElementById('status-text');

    // Terça-feira adega fechada
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
            renderizarCatalogo();
        })
        .catch(err => console.error("Erro ao carregar os produtos do JSON:", err));
}

function renderizarCatalogo() {
    const container = document.getElementById('categorias-container');
    container.innerHTML = "";

    for (const categoria in produtosDados) {
        const divCategoria = document.createElement('div');
        divCategoria.className = 'categoria-secao';

        const titulo = document.createElement('h2');
        titulo.className = 'categoria-titulo';
        titulo.innerText = categoria;
        divCategoria.appendChild(titulo);

        const listaProdutos = document.createElement('div');
        listaProdutos.className = 'produtos-lista';

        produtosDados[categoria].forEach(prod => {
            const card = document.createElement('div');
            card.className = 'produto-card';
            card.innerHTML = `
                <div class="produto-detalhes">
                    <h3>${prod.nome}</h3>
                    <p class="produto-preco">R$ ${prod.preco.toFixed(2).replace('.', ',')}</p>
                </div>
                <button class="add-to-cart-btn" onclick="adicionarAoCarrinho('${prod.nome}', ${prod.preco})">
                    <i class="fas fa-plus"></i> Adicionar
                </button>
            `;
            listaProdutos.appendChild(card);
        });

        divCategoria.appendChild(listaProdutos);
        container.appendChild(divCategoria);
    }
}

function adicionarAoCarrinho(nome, preco) {
    const itemExistente = carrinho.find(item => item.nome === nome);

    if (itemExistente) {
        itemExistente.quantidade += 1;
    } else {
        carrinho.push({ nome, preco, quantidade: 1 });
    }
    atualizarInterfaceCarrinho();
}

function atualizarInterfaceCarrinho() {
    const totalItens = carrinho.reduce((acc, item) => acc + item.quantidade, 0);
    document.getElementById('carrinho-quantidade').innerText = totalItens;

    const subtotal = carrinho.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
    document.getElementById('carrinho-total-barra').innerText = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;

    const barra = document.getElementById('barra-carrinho');
    if (totalItens > 0) {
        barra.classList.remove('hidden');
    } else {
        barra.classList.add('hidden');
        fecharModalCarrinho();
    }
    
    atualizarValoresModal();
}

function abrirModalCarrinho() {
    document.getElementById('modal-carrinho').classList.remove('hidden');
    renderizarItensModal();
}

function fecharModalCarrinho() {
    document.getElementById('modal-carrinho').classList.add('hidden');
}

function renderizarItensModal() {
    const container = document.getElementById('itens-carrinho');
    container.innerHTML = "";

    carrinho.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'item-carrinho-linha';
        itemDiv.innerHTML = `
            <div class="item-info">
                <span class="item-nome-modal">${item.nome}</span>
                <span class="item-preco-modal">R$ ${(item.preco * item.quantidade).toFixed(2).replace('.', ',')}</span>
            </div>
            <div class="item-controles">
                <button onclick="alterarQuantidade(${index}, -1)">-</button>
                <span>${item.quantidade}</span>
                <button onclick="alterarQuantidade(${index}, 1)">+</button>
            </div>
        `;
        container.appendChild(itemDiv);
    });
}

function alterarQuantidade(index, valor) {
    carrinho[index].quantidade += valor;
    if (carrinho[index].quantidade <= 0) {
        carrinho.splice(index, 1);
    }
    renderizarItensModal();
    atualizarInterfaceCarrinho();
}

function alterarTipoEntrega(tipo) {
    tipoEntrega = tipo;
    const secaoEndereco = document.getElementById('secao-endereco');
    const txtFreteLinha = document.getElementById('txt-frete-linha');

    if (tipo === 'entrega') {
        secaoEndereco.classList.remove('hidden');
        txtFreteLinha.style.display = 'block';
    } else {
        secaoEndereco.classList.add('hidden');
        txtFreteLinha.style.display = 'none';
    }
    atualizarValoresModal();
}

function verificarTroco(opcao) {
    const secaoTroco = document.getElementById('secao-troco');
    if (opcao === 'Dinheiro') {
        secaoTroco.classList.remove('hidden');
    } else {
        secaoTroco.classList.add('hidden');
    }
}

function atualizarValoresModal() {
    const subtotal = carrinho.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
    document.getElementById('resumo-subtotal').innerText = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;

    const freteAtual = (tipoEntrega === 'entrega') ? TAXA_FRETE : 0.00;
    document.getElementById('resumo-frete').innerText = `R$ ${freteAtual.toFixed(2).replace('.', ',')}`;

    const totalGeral = subtotal + freteAtual;
    document.getElementById('resumo-total-geral').innerText = `R$ ${totalGeral.toFixed(2).replace('.', ',')}`;

    const avisoMinimo = document.getElementById('aviso-minimo');
    const btnFinalizar = document.getElementById('btn-finalizar');

    if (tipoEntrega === 'entrega' && subtotal < PEDIDO_MINIMO_ENTREGA) {
        avisoMinimo.classList.remove('hidden');
        btnFinalizar.disabled = true;
        btnFinalizar.style.opacity = "0.5";
    } else {
        avisoMinimo.classList.add('hidden');
        btnFinalizar.disabled = false;
        btnFinalizar.style.opacity = "1";
    }
}

// FUNÇÃO DE ENVIO COM VALIDAÇÃO DO NOME DO CLIENTE
function enviarPedidoAoWhatsApp() {
    const nomeCliente = document.getElementById('cliente-nome').value.trim();

    if (nomeCliente === "") {
        alert("Por favor, preencha o seu Nome Completo antes de enviar o pedido!");
        document.getElementById('cliente-nome').focus();
        return;
    }

    if (carrinho.length === 0) return;

    let mensagem = `*Novo Pedido - AGI Drinks* 🦁\n\n`;
    mensagem += `*Cliente:* ${nomeCliente}\n`;
    mensagem += `*Tipo:* ${tipoEntrega === 'entrega' ? '🛵 Entrega em Casa' : '🏪 Retirar na Adega'}\n`;
    mensagem += `----------------------------------------\n\n`;

    carrinho.forEach(item => {
        mensagem += `*${item.quantidade}x* ${item.nome}\n`;
        mensagem += `👉 _R$ ${item.preco.toFixed(2).replace('.', ',')} cada_\n\n`;
    });

    mensagem += `----------------------------------------\n`;
    const subtotal = carrinho.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
    mensagem += `*Subtotal:* R$ ${subtotal.toFixed(2).replace('.', ',')}\n`;

    if (tipoEntrega === 'entrega') {
        mensagem += `*Frete:* R$ ${TAXA_FRETE.toFixed(2).replace('.', ',')}\n`;
        mensagem += `*Total Geral:* R$ ${(subtotal + TAXA_FRETE).toFixed(2).replace('.', ',')}\n\n`;

        const rua = document.getElementById('end-rua').value.trim();
        const num = document.getElementById('end-numero').value.trim();
        const bairro = document.getElementById('end-bairro').value.trim();
        const ref = document.getElementById('end-referencia').value.trim();

        if (!rua || !num || !bairro) {
            alert("Por favor, preencha os campos obrigatórios do endereço de entrega!");
            return;
        }

        mensagem += `*📍 Endereço de Entrega:*\n`;
        mensagem += `${rua}, Nº ${num}\n`;
        mensagem += `Bairro: ${bairro}\n`;
        if (ref) mensagem += `Ref: ${ref}\n`;
    } else {
        mensagem += `*Total Geral:* R$ ${subtotal.toFixed(2).replace('.', ',')}\n\n`;
        mensagem += `📌 _O cliente irá retirar o pedido diretamente no balcão da adega._\n`;
    }

    const formaPagto = document.getElementById('forma-pagamento').value;
    mensagem += `\n*💳 Forma de Pagamento:* ${formaPagto}`;

    if (formaPagto === 'Dinheiro') {
        const troco = document.getElementById('valor-troco').value.trim();
        if (troco) mensagem += ` (Troco para: R$ ${troco})`;
    }

    const mensagemFormatada = encodeURIComponent(mensagem);
    window.open(`https://api.whatsapp.com/send?phone=${WHATSAPP_NUMERO}&text=${mensagemFormatada}`, '_blank');
}
