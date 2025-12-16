// Отримання ID товару з URL
function getProductIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search)
    return parseInt(urlParams.get('id'))
}

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

// Пошук товару за ID
function findProductById(products, id) {
    return products.find(product => product.id === id)
}

// Відображення деталей товару
function displayProductDetails(product) {
    const productDetails = document.querySelector('#product-details')
    const breadcrumbTitle = document.querySelector('#breadcrumb-title')
    
    if (!product) {
        productDetails.innerHTML = `
            <div class="col-12 text-center py-5">
                <h3>Товар не знайдено</h3>
                <a href="products.html" class="btn btn-primary mt-3">Повернутися до каталогу</a>
            </div>
        `
        return
    }

    // Оновлюємо заголовок breadcrumb
    if (breadcrumbTitle) {
        breadcrumbTitle.textContent = product.title
    }

    // Оновлюємо title сторінки
    document.title = `${product.title} - PizzaLite`

    // Відображаємо деталі товару (чистий markup для красивого відображення)
    function fmtPrice(v){
        const n = Number(v) || 0
        return n.toLocaleString('uk-UA', {maximumFractionDigits:0}) + ' грн'
    }

    productDetails.innerHTML = `
        <div class="col-12">
            <div class="product-detail">
                <div class="product-image">
                    <img src="img/${product.image}" alt="${product.title}" onerror="this.src='https://via.placeholder.com/700x500?text=Немає+зображення'">
                </div>
                <div class="product-info">
                    <h1>${product.title}</h1>
                    <div class="meta"><i class="bi bi-tag"></i> ${product.category || 'Без категорії'}</div>
                    <p class="lead">${product.fullDescription || product.description}</p>

                    <div class="price-card">
                        <div class="d-flex align-items-center justify-content-between">
                            <div>
                                <div class="muted-block">Ціна</div>
                                <div class="price-large">${fmtPrice(product.price)}</div>
                            </div>
                            <div class="price-actions">
                                <button class="btn btn-primary btn-lg" id="add-to-cart-btn" data-product='${JSON.stringify(product)}'>
                                    <i class="bi bi-cart-plus"></i> Додати до кошика
                                </button>
                                <a href="products.html" class="btn btn-outline-secondary ms-2"> <i class="bi bi-arrow-left"></i> Повернутися</a>
                            </div>
                        </div>
                    </div>

                    <div class="characteristics">
                        <div class="card">
                            <div class="card-body">
                                <h5 class="card-title">Характеристики</h5>
                                <ul class="list-unstyled mb-0">
                                    <li><i class="bi bi-check-circle text-success"></i> Офіційна гарантія</li>
                                    <li><i class="bi bi-check-circle text-success"></i> Безкоштовна доставка</li>
                                    <li><i class="bi bi-check-circle text-success"></i> Обмін та повернення</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `

    // Додаємо обробник для кнопки "Додати до кошика"
    const addToCartBtn = document.querySelector('#add-to-cart-btn')
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', function(event) {
            const productData = event.target.getAttribute('data-product')
            const product = JSON.parse(productData)
            cart.addItem(product)
        })
    }
}

// Ініціалізація сторінки товару
const productId = getProductIdFromURL()

if (productId) {
    getProducts().then(function(products) {
        const product = findProductById(products, productId)
        displayProductDetails(product)
    })
} else {
    // Якщо ID не вказано, показуємо помилку
    const productDetails = document.querySelector('#product-details')
    productDetails.innerHTML = `
        <div class="col-12 text-center py-5">
            <h3>Товар не знайдено</h3>
            <a href="products.html" class="btn btn-primary mt-3">Повернутися до каталогу</a>
        </div>
    `
}