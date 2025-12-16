// Отримання товарів з JSON файлу
async function getProducts() {
    try {
        const response = await fetch('products.json')
        const products = await response.json()
        return products
    } catch (error) {
        console.error('Помилка завантаження товарів:', error)
        return []
    }
}

// Функція для створення HTML картки товару
function getCardHTML(product) {
    return `
        <div class="col-md-4 mb-4">
            <div class="card h-100 product-card">
                <img src="img/${product.image}" class="card-img-top" alt="${product.title}" 
                     onerror="this.src='https://via.placeholder.com/300x200?text=Немає+зображення'">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${product.title}</h5>
                    <p class="card-text text-muted">${product.description}</p>
                    <div class="mt-auto">
                        <p class="h5 text-primary mb-3">${product.price} грн</p>
                        <div class="d-flex gap-2">
                            <button class="btn btn-primary flex-grow-1 add-to-cart-btn" 
                                    data-product='${JSON.stringify(product)}'>
                                <i class="bi bi-cart-plus"></i> Купити
                            </button>
                            <a href="product.html?id=${product.id}" class="btn btn-outline-primary">
                                <i class="bi bi-eye"></i>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
}

// Функція додавання товару до кошика
function addToCart(event) {
    const productData = event.target.getAttribute('data-product')
    const product = JSON.parse(productData)
    cart.addItem(product)
}

// Відображення товарів на головній сторінці (тільки перші 6)
getProducts().then(function(products) {
    const productsList = document.querySelector('#products-list')
    if (productsList) {
        // Сортуємо за числовою ціною (спадання) і показуємо перші 6
        products.sort((a, b) => (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0))
        const featuredProducts = products.slice(0, 6)

        featuredProducts.forEach(function(product) {
            productsList.innerHTML += getCardHTML(product)
        })

        // Делегований обробник для кнопок "Купити" (працює коли клікають по іконці/тексту)
        productsList.addEventListener('click', function(e) {
            const btn = e.target.closest('.add-to-cart-btn')
            if (!btn) return
            const productData = btn.getAttribute('data-product')
            if (!productData) return
            let product
            try { product = JSON.parse(productData) } catch (err) { console.error('parse product', err); return }
            if (typeof cart !== 'undefined' && cart && typeof cart.addItem === 'function') {
                cart.addItem(product)
            } else {
                const stored = JSON.parse(localStorage.getItem('cart_fallback') || '{}')
                if (stored[product.id]) stored[product.id].quantity += 1
                else stored[product.id] = { ...product, quantity: 1 }
                localStorage.setItem('cart_fallback', JSON.stringify(stored))
                // non-blocking toast
                const t = document.createElement('div')
                t.className = 'pl-toast'
                t.textContent = 'Товар додано до кошика (локально).'
                document.body.appendChild(t)
                setTimeout(() => t.remove(), 2200)
            }
        })
    }
})