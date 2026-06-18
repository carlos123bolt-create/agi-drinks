let produtos = [];
let carrinho = JSON.parse(localStorage.getItem('AGI_DRINKS_CART')) || [];

// Carregar Produtos (Busca do JSON ou LocalStorage do Admin)
async function inicializar() {
    const localProds = localStorage.getItem('AGI_DRINKS_PRODUCOS');
    if (localProds) {
        produtos = JSON.parse(localProds);
    } else {
        const response = await fetch('produtos.json');
        produtos = await response.json();
        localStorage.setItem('AGI_DRINKS_PRODUCOS', JSON.stringify(produtos));
    }
    renderizarProdutos(produtos);
    atualizarInterfaceCarrinho();
}

// Renderizar Catálogo
function renderizarProdutos(lista) {
    const container = document.getElementById('products-container');
    container.innerHTML = '';

    if(lista.length === 0) {
        container.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color: #aaa;">Nenhum produto encontrado.</p>';
        return;
    }

    lista.forEach(prod => {
        container.innerHTML += `
            <div class="product-card">
                <img src="${prod.imagem}" alt="${prod.nome}" class="product-img">
                <div class="product-info">
                    <h3 class="product-title">${prod.nome}</h3>
                    <p class="product-price">R$ ${prod.preco.toFixed(2).replace('.', ',')}</p>
                    <button class="add-to-cart" onclick="adicionarAoCarrinho(${prod.id})">Adicionar</button>
                </div>
            </div>
        `;
    });
}

// Sincronizar e Atualizar Carrinho
function atualizarInterfaceCarrinho() {
    localStorage.setItem('AGI_DRINKS_CART', JSON.stringify(carrinho));
    
    // Atualiza Contador
    const totalItens = carrinho.reduce((acc, item) => acc + item.qtd, 0);
    document.getElementById('cart-count').innerText = totalItens;

    // Atualiza Lista Lateral
    const containerItens = document.getElementById('cart-items');
    containerItens.innerHTML = '';
    
    let precoTotal = 0;

    carrinho.forEach(item => {
        precoTotal += item.preco * item.qtd;
        containerItens.innerHTML += `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h4>${item.nome}</h4>
                    <span>${item.qtd}x R$ ${item.preco.toFixed(2)}</span>
                </div>
                <button class="remove-btn" onclick="removerDoCarrinho(${item.id})"><i class="fas fa-trash"></i></button>
            </div>
        `;
    });

    document.getElementById('cart-total-val').innerText = `R$ ${precoTotal.toFixed(2).replace('.', ',')}`;
}

function adicionarAoCarrinho(id) {
    const produto = produtos.find(p => p.id === id);
    const itemNoCarrinho = carrinho.find(item => item.id === id);

    if (itemNoCarrinho) {
        itemNoCarrinho.qtd++;
    } else {
        carrinho.push({ ...produto, qtd: 1 });
    }
    atualizarInterfaceCarrinho();
    openCart();
}

function removerDoCarrinho(id) {
    carrinho = carrinho.filter(item => item.id !== id);
    atualizarInterfaceCarrinho();
}

// Funções de abrir/fechar Carrinho
function toggleCart() {
    document.getElementById('cart-sidebar').classList.toggle('open');
}
function openCart() {
    document.getElementById('cart-sidebar').classList.add('open');
}

// Filtro de Categorias
function filterCategory(cat) {
    document.querySelectorAll('.cat-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    if (cat === 'todos') {
        renderizarProdutos(produtos);
    } else {
        const filtrados = produtos.filter(p => p.categoria === cat);
        renderizarProdutos(filtrados);
    }
}

// Barra de Pesquisa
document.getElementById('search-input').addEventListener('input', (e) => {
    const termo = e.target.value.toLowerCase();
    const filtrados = produtos.filter(p => p.nome.toLowerCase().includes(termo));
    renderizarProdutos(filtrados);
});

// Checkout via WhatsApp
function checkoutWhatsApp() {
    if (carrinho.length === 0) {
        alert("Seu carrinho está vazio!");
        return;
    }

    let numeroTelefone = "5511954357092"; // << Insira o número da adega aqui (Com DDD)
    let mensagem = "*Novo Pedido - AGI DRINKS*\n\n";

    let total = 0;
    carrinho.forEach(item => {
        mensagem += `• ${item.qtd}x ${item.nome} - R$ ${(item.preco * item.qtd).toFixed(2)}\n`;
        total += item.preco * item.qtd;
    });

    mensagem += `\n*Total:* R$ ${total.toFixed(2)}`;
    
    const url = `https://api.whatsapp.com/send?phone=${numeroTelefone}&text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
}

window.onload = inicializar;