// CONFIGURAÇÃO DO WHATSAPP DA ADEGA (Coloque o seu número com DDD aqui)
const WHATSAPP_NUMERO = "5511954357092"; 

let carrinho = [];
let produtosDados = [];
let tipoEntrega = "entrega"; // 'entrega' ou 'retirada'
const TAXA_FRETE = 5.00;
const PEDIDO_MINIMO_ENTREGA = 15.00;

document.addEventListener("DOMContentLoaded", () => {
    verificarHorarioFuncionamento();
    setInterval(verificarHorarioFuncionamento, 30000);
    carregarProdutos();
});

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

    if (diaSemana === 2) { // Terça fechado
        if (bola) bola.className = "status-bola fechado";
        if (texto) texto.innerText = "Fechado no momento";
        return;
    }

    if (tempoAtualEmMinutos >= inicioMinutos && tempoAtualEmMinutos < fimMinutos) {
        if (bola) bola.className = "status-bola aberto";
        if (texto) texto.innerText = "Aberto - Faça seu Pedido";
    } else {
        if (bola) bola.className = "status-bola fechado";
        if (texto) texto.innerText = "Fechado no momento";
    }
}

function carregarProdutos() {
    fetch('produtos.json')
        .then(response => response.json())
        .then(data => {
            produtosDados = data;
            renderizarCatalogo();
        })
        .catch(err => console.error("Erro ao carregar o JSON:", err));
}

function renderizarCatalogo() {
    const container = document.getElementById('categorias-container');
    if (!container) return;
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
                    ${prod.descricao ? `<p style="font-size: 13px; color: #aaa; margin: 5px 0;">${prod.descricao}</p>` : ''}
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
    const campoQtde = document.getElementById('carrinho-quantidade');
    if (campoQtde) campoQtde.innerText = totalItens;

    const subtotal = carrinho.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
    const campoTotalBarra = document.getElementById('carrinho-total-barra');
    if (campoTotalBarra) campoTotalBarra.innerText = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;

    const barra = document.getElementById('barra-carrinho');
    if (barra) {
        if (totalItens > 0) {
            barra.classList.remove('hidden');
        } else {
            barra.classList.add('hidden');
            fecharModalCarrinho();
        }
    }
    atualizarValoresModal();
}

function abrirModalCarrinho() {
    const modal = document.getElementById('modal-carrinho');
    if (modal) modal.classList.remove('hidden');
    renderizarItensModal();
}

// (As funções abaixo mantêm o carrinho funcionando)
function fecharModalCarrinho() { document.getElementById('modal-carrinho').classList.add('hidden'); }
function renderizarItensModal() {
    const container = document.getElementById('itens-carrinho');
    if (!container) return; container.innerHTML = "";
    carrinho.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'item-carrinho-linha';
        itemDiv.innerHTML = `<div class="item-info"><span>${item.nome}</span></div>
        <div class="item-controles"><button onclick="alterarQuantidade(${index}, -1)">-</button><span>${item.amount || item.quantidade}</span><button onclick="alterarQuantidade(${index}, 1)">+</button></div>`;
        container.appendChild(itemDiv);
    });
}
function alterarQuantidade(index, valor) {
    carrinho[index].quantidade += valor;
    if (carrinho[index].quantidade <= 0) { carrinho.splice(index, 1); }
    renderizarItensModal(); atualizarInterfaceCarrinho();
}
function alterarTipoEntrega(tipo) {
    tipoEntrega = tipo;
    const secaoEndereco = document.getElementById('secao-endereco');
    const txtFreteLinha = document.getElementById('txt-frete-linha');
    if (secaoEndereco && txtFreteLinha) {
        if (tipo === 'entrega') { secaoEndereco.classList.remove('hidden'); txtFreteLinha.style.display = 'block'; }
        else { secaoEndereco.classList.add('hidden'); txtFreteLinha.style.display = 'none'; }
    }
    atualizarValoresModal();
}
function verificarTroco(opcao) {
    const secaoTroco = document.getElementById('secao-troco');
    if (secaoTroco) { if (opcao === 'Dinheiro') secaoTroco.classList.remove('hidden'); else secaoTroco.classList.add('hidden'); }
}
function atualizarValoresModal() {
    const subtotal = carrinho.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
    const campoSubtotal = document.getElementById('resumo-subtotal');
    if (campoSubtotal) campoSubtotal.innerText = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
    const freteAtual = (tipoEntrega === 'entrega') ? TAXA_FRETE : 0.00;
    const campoFrete = document.getElementById('resumo-frete');
    if (campoFrete) campoFrete.innerText = `R$ ${freteAtual.toFixed(2).replace('.', ',')}`;
    const totalGeral = subtotal + freteAtual;
    const campoTotalGeral = document.getElementById('resumo-total-geral');
    if (campoTotalGeral) campoTotalGeral.innerText = `R$ ${totalGeral.toFixed(2).replace('.', ',')}`;
    const avisoMinimo = document.getElementById('aviso-minimo');
    const btnFinalizar = document.getElementById('btn-enviar-whats');
    if (avisoMinimo && btnFinalizar) {
        if (tipoEntrega === 'entrega' && subtotal < PEDIDO_MINIMO_ENTREGA) { avisoMinimo.classList.remove('hidden'); btnFinalizar.disabled = true; btnFinalizar.style.opacity = "0.5"; }
        else { avisoMinimo.classList.add('hidden'); btnFinalizar.disabled = false; btnFinalizar.style.opacity = "1"; }
    }
}
function enviarPedidoAoWhatsApp() {
    const campoNome = document.getElementById('cliente-nome');
    const nomeCliente = campoNome ? campoNome.value.trim() : "";
    if (nomeCliente === "") { alert("Por favor, preencha o seu Nome Completo!"); if (campoNome) campoNome.focus(); return; }
    if (carrinho.length === 0) return;
    let mensagem = `*Novo Pedido - AGI Drinks* 🦁\n\n*Cliente:* ${nomeCliente}\n*Tipo:* ${tipoEntrega === 'entrega' ? '🛵 Entrega' : '🏪 Retirada'}\n----------------------------------------\n\n`;
    carrinho.forEach(item => { mensagem += `*${item.quantidade}x* ${item.nome}\n👉 _R$ ${item.preco.toFixed(2).replace('.', ',')} cada_\n\n`; });
    mensagem += `----------------------------------------\n`;
    const subtotal = carrinho.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
    if (tipoEntrega === 'entrega') { mensagem += `*Total Geral:* R$ ${(subtotal + TAXA_FRETE).toFixed(2).replace('.', ',')}\n\n*📍 Endereço:* ${document.getElementById('end-rua').value}, Nº ${document.getElementById('end-numero').value} - ${document.getElementById('end-bairro').value}\n`; }
    else { mensagem += `*Total Geral:* R$ ${subtotal.toFixed(2).replace('.', ',')}\n\n📌 _O cliente vai retirar na adega._\n`; }
    const formaPagto = document.getElementById('forma-pagamento') ? document.getElementById('forma-pagamento').value : "Pix";
    mensagem += `\n*💳 Pagamento:* ${formaPagto}`;
    window.open(`https://api.whatsapp.com/send?phone=${WHATSAPP_NUMERO}&text=${encodeURIComponent(mensagem)}`, '_blank');
}
