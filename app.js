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
let cart = JSON.parse(localStorage.getItem('dh-cart') || '{}'),
    pix = {
        ...(JSON.parse(localStorage.getItem('dh-pix') || 'null') || {}),
        key: '10974139424',
        name: 'DEV HOUSE',
        city: 'RECIFE'
    },
    payload = '';
let activeCategory = 'todos',
    searchQuery = '',
    selectedQty = {};

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
    const message = ['Olá! Gostaria de fazer este pedido na Dev. House:', ...lines, `Total: ${money(total)}`].join('\n');
    $('#whatsapp-order').href = `https://wa.me/5581985483142?text=${encodeURIComponent(message)}`
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

function crc16(s) {
    let crc = 0xFFFF;
    for (let i = 0; i < s.length; i++) {
        crc ^= s.charCodeAt(i) << 8;
        for (let j = 0; j < 8; j++) crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
        crc &= 0xFFFF
    }
    return crc.toString(16).toUpperCase().padStart(4, '0')
}

function field(id, value) {
    return id + String(value.length).padStart(2, '0') + value
}

function makePayload(total) {
    const merchant = `${field('00', 'BR.GOV.BCB.PIX')}${field('01', pix.key.trim())}`;
    const additional = field('05', '***');
    let s = field('00', '01') + field('26', merchant) + field('52', '0000') + field('53', '986') + field('54', total.toFixed(2)) + field('58', 'BR') + field('59', pix.name.trim().toUpperCase()) + field('60', pix.city.trim().toUpperCase()) + field('62', additional) + '6304';
    return s + crc16(s)
}
async function refreshPix() {
    const total = products.reduce((s, p) => s + (cart[p.id] || 0) * p.price, 0),
        status = $('#pix-status'),
        canvas = $('#qr-canvas'),
        placeholder = $('#qr-placeholder'),
        copy = $('#copy-pix');
    $('#payment-total').textContent = money(total);
    if (!pix?.key || !pix?.name || !pix?.city) {
        status.textContent = 'Chave Pix não configurada';
        placeholder.hidden = false;
        canvas.hidden = true;
        copy.disabled = true;
        return
    }
    payload = makePayload(total);
    try {
        if (!window.QRCode) throw Error('QR indisponível');
        await QRCode.toCanvas(canvas, payload, {
            width: 340,
            margin: 1,
            color: {
                dark: '#4b2038',
                light: '#ffffff'
            }
        });
        canvas.hidden = false;
        placeholder.hidden = true;
        copy.disabled = false;
        status.textContent = 'Aponte a câmera do seu banco para o QR Code.'
    } catch (e) {
        status.textContent = 'Não foi possível gerar o QR Code. Confira sua conexão.';
        copy.disabled = true
    }
}
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
    refreshPix()
};
$('#close-payment').onclick = () => closeOverlay('#payment-modal');
$('#payment-modal').onclick = e => {
    if (e.target === $('#payment-modal')) closeOverlay('#payment-modal')
};
$('#copy-pix').onclick = async () => {
    if (!payload) return;
    try {
        await navigator.clipboard.writeText(payload);
        toast('Código Pix copiado')
    } catch {
        toast('Não foi possível copiar. Selecione o código Pix')
    }
};
document.querySelectorAll('.category-tab').forEach(tab => tab.setAttribute('aria-pressed', tab.classList.contains('active')));
renderProducts();
renderCart();
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));