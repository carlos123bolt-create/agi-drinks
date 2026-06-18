document.getElementById('form-produto').addEventListener('submit', function(e) {
    e.preventDefault();

    const nome = document.getElementById('nome').value;
    const preco = parseFloat(document.getElementById('preco').value);
    const categoria = document.getElementById('categoria').value;
    const imagem = document.getElementById('imagem').value;

    // Pega os produtos atuais existentes
    let produtos = JSON.parse(localStorage.getItem('AGI_DRINKS_PRODUCOS')) || [];

    // Cria novo ID incremental
    const novoId = produtos.length > 0 ? produtos[produtos.length - 1].id + 1 : 1;

    const novoProduto = {
        id: novoId,
        nome: nome,
        preco: preco,
        categoria: categoria,
        imagem: imagem
    };

    produtos.push(novoProduto);
    localStorage.setItem('AGI_DRINKS_PRODUCOS', JSON.stringify(produtos));

    alert('Produto cadastrado com sucesso na vitrine!');
    document.getElementById('form-produto').reset();
});