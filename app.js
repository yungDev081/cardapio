const products = [{
        id: 'heineken',
        name: 'Heineken',
        type: 'Cerveja',
        category: 'cerveja',
        description: 'Lata · 350 ml',
        price: 7.00,
        art: 'beer',
        tag: 'BEM GELADA',
        drink: 'lager',
        label: 'H',
        image: 'https://www.extrabom.com.br/uploads/produtos/original/5130_20210921120127_thumb_7896045523412_2.png'
    },
    {
        id: 'budweiser',
        name: 'Budweiser',
        type: 'Cerveja',
        category: 'cerveja',
        description: 'Lata · 350 ml',
        price: 6.00,
        art: 'beer',
        tag: 'BEM GELADA',
        drink: 'lager',
        label: 'B',
        image: 'https://www.castelao.com.br/media/catalog/product/cache/1/image/1800x/040ec09b1e35df139433887a97daa66f/b/u/budweiser-lata-unid-350-ml.jpg'
    },
    {
        id: 'sprite',
        name: 'Sprite',
        type: 'Refrigerante',
        category: 'refrigerante',
        description: 'Lata · 350 ml',
        price: 5.00,
        art: 'soda',
        tag: 'REFRESCANTE',
        drink: 'soda',
        label: 'S',
        image: 'https://acdn-us.mitiendanube.com/stores/001/165/503/products/sprite1-0f9d8cb090f7558d6916192135780529-480-0.webp'
    },
    {
        id: 'coca-cola',
        name: 'Coca-Cola',
        type: 'Refrigerante',
        category: 'refrigerante',
        description: 'Lata · 350 ml',
        price: 6.50,
        art: 'soda',
        tag: 'CLÁSSICA',
        drink: 'soda',
        label: 'C',
        image: 'https://emporioiguacu.com.br/cdn/shop/products/9809ce5be613bd50b9082e86dc750765.png?v=1628008457'
    },
    {
        id: 'water-350',
        name: 'Água mineral',
        type: 'Água mineral',
        category: 'agua',
        description: 'Garrafa · 350 ml',
        price: 3.00,
        art: 'water',
        tag: 'LEVE & FRESCA',
        drink: 'water',
        label: 'H₂O',
        image: 'https://paguemenos.vtexassets.com/arquivos/ids/690862/agua-mineral-crystal-s-gas-350ml-principal.jpg'
    },
    {
        id: 'water-1l',
        name: 'Água mineral',
        type: 'Água mineral',
        category: 'agua',
        description: 'Garrafa · 1 L',
        price: 5.00,
        art: 'water',
        tag: 'TAMANHO FAMÍLIA',
        drink: 'water',
        label: 'H₂O',
        image: 'https://imgs.extra.com.br/1505923632/1xg.jpg?imwidth=1000'
    },
];
const $ = s => document.querySelector(s),
    money = n => n.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
let cart = JSON.parse(localStorage.getItem('dh-cart') || '{}');
let activeCategory = 'todos',
    searchQuery = '',
    selectedQty = {};
const PIX_KEY = '69940061000135';
let selectedPaymentMethod = 'pix';
let selectedCardMethod = '';

function saveCart() {
    localStorage.setItem('dh-cart', JSON.stringify(cart));
    renderCart()
}

function productArt(p, mini = false) {
    return `<div class="${mini ? 'mini-art' : 'product-art'} ${p.art}">${mini ? '' : `<span class="product-tag">${p.tag}</span>`}<img class="product-photo" src="${p.image}" alt="${p.name} ${p.description}" loading="lazy" onload="this.nextElementSibling.hidden=true" onerror="this.hidden=true"><div class="drink ${p.drink}">${p.label}</div></div>`
}

function renderProducts() {
    const shown = products.filter(p => (activeCategory === 'todos' || p.category === activeCategory) && `${p.name} ${p.type} ${p.description}`.toLocaleLowerCase('pt-BR').includes(searchQuery));
    $('#product-grid').innerHTML = shown.map(p => {
        const qty = selectedQty[p.id] || 1;
        return `<article class="product-card">${productArt(p)}<div class="product-info"><span class="product-type">${p.type}</span><h3>${p.name}</h3><p class="product-description">${p.description}</p><div class="product-bottom"><span class="price">${money(p.price)} <small>/ un.</small></span></div><div class="product-order-controls"><div class="qty-picker" aria-label="Quantidade de ${p.name}"><button data-select="${p.id}" data-delta="-1" aria-label="Diminuir quantidade" ${qty <= 1 ? 'disabled' : ''}>−</button><span aria-live="polite">${qty}</span><button data-select="${p.id}" data-delta="1" aria-label="Aumentar quantidade">+</button></div><button class="add-button" data-add="${p.id}">Adicionar</button></div></div></article>`
    }).join('');
    $('#no-results').hidden = shown.length > 0
}

function renderCart() {
    const rows = products.filter(p => cart[p.id]);
    const count = rows.reduce((s, p) => s + cart[p.id], 0),
        total = rows.reduce((s, p) => s + p.price * cart[p.id], 0);
    $('#cart-count').textContent = count;
    $('#cart-total').textContent = money(total);
    $('#payment-total').textContent = money(total);
    $('#mobile-cart-count').textContent = count;
    $('#mobile-cart-total').textContent = money(total);
    $('#mobile-cart').hidden = count === 0;
    $('#empty-cart').hidden = rows.length > 0;
    $('#drawer-bottom').hidden = rows.length === 0;
    $('#cart-items').innerHTML = rows.map(p => `<div class="cart-row">${productArt(p, true)}<div><div class="cart-name">${p.name}</div><div class="cart-price">${money(p.price)} / un.</div></div><div class="quantity"><button data-qty="${p.id}" data-delta="-1" aria-label="Remover uma unidade">−</button><span>${cart[p.id]}</span><button data-qty="${p.id}" data-delta="1" aria-label="Adicionar uma unidade">+</button></div></div>`).join('');
    const lines = rows.map(p => `• ${cart[p.id]}x ${p.name} — ${money(p.price)} cada (${money(p.price * cart[p.id])})`);
    updateWhatsAppOrder(lines, total)
}

function updateWhatsAppOrder(lines, total) {
    const paymentLabel = selectedPaymentMethod === 'card'
        ? (selectedCardMethod === 'debit' ? 'Cartão de débito' : selectedCardMethod === 'credit' ? 'Cartão de crédito' : 'Cartão (selecione crédito ou débito)')
        : 'Pix';
    const message = [
        'Olá! Gostaria de fazer este pedido na Dev. House:',
        ...lines,
        `Total: ${money(total)}`,
        `Forma de pagamento escolhida: ${paymentLabel}`
    ].join('\n');
    const whatsapp = $('#whatsapp-order');
    const cardChoiceMissing = selectedPaymentMethod === 'card' && !selectedCardMethod;
    whatsapp.href = cardChoiceMissing ? '#' : `https://wa.me/5581985483142?text=${encodeURIComponent(message)}`;
    whatsapp.setAttribute('aria-disabled', String(cardChoiceMissing));
    whatsapp.classList.toggle('disabled', cardChoiceMissing);
    $('#whatsapp-order').lastChild.textContent = selectedPaymentMethod === 'card'
        ? ' Enviar pedido com forma de pagamento'
        : ' Enviar pedido pelo WhatsApp'
}

function toast(message) {
    const el = $('#toast');
    el.textContent = message;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 2200)
}

function openOverlay(id) {
    $(id).hidden = false;
    document.body.style.overflow = 'hidden'
}

function closeOverlay(id) {
    $(id).hidden = true;
    if ($('#overlay').hidden && $('#payment-modal').hidden) document.body.style.overflow = ''
}

function crc16(payload) {
    let crc = 0xFFFF;
    for (let i = 0; i < payload.length; i++) {
        crc ^= payload.charCodeAt(i) << 8;
        for (let bit = 0; bit < 8; bit++) crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
        crc &= 0xFFFF
    }
    return crc.toString(16).toUpperCase().padStart(4, '0')
}

function pixField(id, value) {
    return `${id}${String(value.length).padStart(2, '0')}${value}`
}

function makePixPayload(amount) {
    const merchantAccount = pixField('00', 'BR.GOV.BCB.PIX') + pixField('01', PIX_KEY);
    const additionalData = pixField('05', '***');
    const fields = [
        pixField('00', '01'),
        pixField('01', '12'),
        pixField('26', merchantAccount),
        pixField('52', '0000'),
        pixField('53', '986'),
        pixField('54', amount.toFixed(2)),
        pixField('58', 'BR'),
        pixField('59', 'DEV HOUSE'),
        pixField('60', 'RECIFE'),
        pixField('62', additionalData),
        '6304'
    ].join('');
    return fields + crc16(fields)
}

function refreshPix() {
    const total = products.reduce((sum, p) => sum + p.price * (cart[p.id] || 0), 0);
    $('#payment-total').textContent = money(total);
    if (selectedPaymentMethod !== 'pix' || total <= 0) return;
    $('#pix-qr-code').replaceChildren();
    $('#pix-code').value = makePixPayload(total);
    if (window.QRCode) {
        new QRCode($('#pix-qr-code'), { text: $('#pix-code').value, width: 184, height: 184, correctLevel: QRCode.CorrectLevel.M });
    } else {
        $('#pix-qr-code').textContent = 'Não foi possível carregar o QR Code. Copie o código Pix.'
    }
}

function choosePaymentMethod(method) {
    if (method === 'card' && selectedPaymentMethod !== 'card') selectedCardMethod = '';
    selectedPaymentMethod = method;
    document.querySelectorAll('[data-payment-choice]').forEach(button => {
        const active = button.dataset.paymentChoice === method;
        button.classList.toggle('active', active);
        button.setAttribute('aria-pressed', String(active))
    });
    $('#pix-payment-panel').hidden = method !== 'pix';
    $('#card-payment-panel').hidden = method !== 'card';
    document.querySelectorAll('[data-card-method]').forEach(button => {
        const active = method === 'card' && button.dataset.cardMethod === selectedCardMethod;
        button.classList.toggle('active', active);
        button.setAttribute('aria-pressed', String(active))
    });
    const rows = products.filter(product => cart[product.id]);
    const lines = rows.map(product => `• ${cart[product.id]}x ${product.name} — ${money(product.price)} cada (${money(product.price * cart[product.id])})`);
    const total = rows.reduce((sum, product) => sum + product.price * cart[product.id], 0);
    updateWhatsAppOrder(lines, total);
    if (method === 'pix') refreshPix()
}

document.querySelectorAll('[data-payment-choice]').forEach(button => {
    button.addEventListener('click', () => choosePaymentMethod(button.dataset.paymentChoice))
});
document.querySelectorAll('[data-card-method]').forEach(button => {
    button.addEventListener('click', () => {
        selectedCardMethod = button.dataset.cardMethod;
        document.querySelectorAll('[data-card-method]').forEach(option => {
            const active = option === button;
            option.classList.toggle('active', active);
            option.setAttribute('aria-pressed', String(active))
        });
        const rows = products.filter(product => cart[product.id]);
        const lines = rows.map(product => `• ${cart[product.id]}x ${product.name} — ${money(product.price)} cada (${money(product.price * cart[product.id])})`);
        const total = rows.reduce((sum, product) => sum + product.price * cart[product.id], 0);
        updateWhatsAppOrder(lines, total)
    })
});
document.addEventListener('click', e => {
    const select = e.target.closest('[data-select]');
    if (select) {
        const id = select.dataset.select;
        selectedQty[id] = Math.max(1, (selectedQty[id] || 1) + Number(select.dataset.delta));
        renderProducts()
    }
    const add = e.target.closest('[data-add]');
    if (add) {
        const id = add.dataset.add,
            qty = selectedQty[id] || 1;
        cart[id] = (cart[id] || 0) + qty;
        saveCart();
        toast(`${qty} ${qty === 1 ? 'unidade adicionada' : 'unidades adicionadas'} à sacola`)
    }
    const qty = e.target.closest('[data-qty]');
    if (qty) {
        const id = qty.dataset.qty;
        cart[id] += Number(qty.dataset.delta);
        if (cart[id] <= 0) delete cart[id];
        saveCart()
    }
    const category = e.target.closest('[data-category]');
    if (category) {
        activeCategory = category.dataset.category;
        document.querySelectorAll('.category-tab').forEach(tab => {
            tab.classList.toggle('active', tab === category);
            tab.setAttribute('aria-pressed', tab === category)
        });
        renderProducts()
    }
});
$('#product-search').addEventListener('input', e => {
    searchQuery = e.target.value.trim().toLocaleLowerCase('pt-BR');
    renderProducts()
});
$('#product-search').addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        e.target.value = '';
        searchQuery = '';
        renderProducts()
    }
});
document.addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        $('#product-search').focus()
    }
});
$('#cart-trigger').onclick = $('#mobile-cart').onclick = () => {
    renderCart();
    openOverlay('#overlay')
};
$('#close-drawer').onclick = $('#keep-shopping').onclick = () => closeOverlay('#overlay');
$('#overlay').onclick = e => {
    if (e.target === $('#overlay')) closeOverlay('#overlay')
};
$('#checkout').onclick = () => {
    closeOverlay('#overlay');
    openOverlay('#payment-modal');
    selectedCardMethod = '';
    choosePaymentMethod('pix')
};
$('#close-payment').onclick = () => {
    closeOverlay('#payment-modal')
};
$('#payment-modal').onclick = e => {
    if (e.target === $('#payment-modal')) {
        closeOverlay('#payment-modal')
    }
};
$('#copy-pix').onclick = async () => {
    const code = $('#pix-code').value;
    if (!code) return;
    try {
        await navigator.clipboard.writeText(code);
        toast('Código Pix copiado')
    } catch {
        $('#pix-code').focus();
        $('#pix-code').select();
        toast('Código selecionado para copiar')
    }
};
$('#whatsapp-order').addEventListener('click', event => {
    if ($('#whatsapp-order').getAttribute('aria-disabled') === 'true') {
        event.preventDefault();
        toast('Escolha crédito ou débito para continuar')
    }
});
document.querySelectorAll('.category-tab').forEach(tab => tab.setAttribute('aria-pressed', tab.classList.contains('active')));
renderProducts();
renderCart();
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
