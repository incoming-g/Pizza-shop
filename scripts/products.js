// Глобальні змінні
let allProducts = []
let filteredProducts = []

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

// Відображення товарів на сторінці
function displayProducts(products) {
    const productsList = document.querySelector('#products-list')
    if (!productsList) return

    productsList.innerHTML = ''
    
    if (products.length === 0) {
        productsList.innerHTML = '<div class="col-12 text-center"><p class="text-muted">Товари не знайдено</p></div>'
        return
    }

    products.forEach(function(product) {
        productsList.innerHTML += getCardHTML(product)
    })

    // Додаємо обробники подій для кнопок "Купити"
    const buyButtons = document.querySelectorAll('.add-to-cart-btn')
    buyButtons.forEach(function(button) {
        button.addEventListener('click', addToCart)
    })
}

// Функція додавання товару до кошика
function addToCart(event) {
    const productData = event.target.closest('.add-to-cart-btn').getAttribute('data-product')
    const product = JSON.parse(productData)
    cart.addItem(product)
}

// Отримання унікальних категорій
function getCategories(products) {
    const categories = new Set()
    products.forEach(product => {
        if (product.category) {
            categories.add(product.category)
        }
    })
    return Array.from(categories)
}

// Заповнення фільтра категорій
function populateCategoryFilter(categories) {
    const categoryFilter = document.querySelector('#category-filter')
    if (!categoryFilter) return

    categories.forEach(category => {
        const option = document.createElement('option')
        option.value = category
        option.textContent = category
        categoryFilter.appendChild(option)
    })
}

// Застосування фільтрів
function applyFilters() {
    const categoryFilterEl = document.querySelector('#category-filter')
    const sortFilterEl = document.querySelector('#sort-filter')
    const categoryFilter = categoryFilterEl ? categoryFilterEl.value : 'all'
    const sortFilter = sortFilterEl ? sortFilterEl.value : 'default'

    // Фільтрація за категорією (якщо є елемент)
    filteredProducts = allProducts.filter(product => {
        if (categoryFilter !== 'all' && product.category !== categoryFilter) {
            return false
        }
        return true
    })

    // Пошук за назвою видалено (пошукове поле прибрано)
    // Фільтрація за ціною (якщо вказані min/max)
    const priceMinEl = document.querySelector('#price-min-inline')
    const priceMaxEl = document.querySelector('#price-max-inline')
    const priceMin = priceMinEl && priceMinEl.value !== '' ? parseFloat(priceMinEl.value) : null
    const priceMax = priceMaxEl && priceMaxEl.value !== '' ? parseFloat(priceMaxEl.value) : null

    if (priceMin !== null || priceMax !== null) {
        filteredProducts = filteredProducts.filter(product => {
            const price = parseFloat(product.price) || 0
            if (priceMin !== null && price < priceMin) return false
            if (priceMax !== null && price > priceMax) return false
            return true
        })
    }

    // Сортування (за замовчуванням - від більшої ціни до меншої)
    switch(sortFilter) {
        case 'price-asc':
            filteredProducts.sort((a, b) => (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0))
            break
        case 'price-desc':
            filteredProducts.sort((a, b) => (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0))
            break
        case 'name':
            filteredProducts.sort((a, b) => a.title.localeCompare(b.title))
            break
        default:
            filteredProducts.sort((a, b) => (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0))
            break
    }

    displayProducts(filteredProducts)
}

// Ініціалізація сторінки
getProducts().then(function(products) {
    allProducts = products

    // Сортуємо весь масив товарів за спаданням ціни (щоб дорогі були зверху)
    allProducts.sort((a, b) => (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0))
    filteredProducts = allProducts.slice()

    // Заповнюємо фільтр категорій
    const categories = getCategories(allProducts)
    populateCategoryFilter(categories)

    // Додаємо обробники для фільтрів, якщо елементи існують
    const catEl = document.querySelector('#category-filter')
    if (catEl) catEl.addEventListener('change', applyFilters)
    const sortEl = document.querySelector('#sort-filter')
    if (sortEl) sortEl.addEventListener('change', applyFilters)

    // Инициализация price inputs: подставим минимальную/максимальную цену в placeholder
    const prices = allProducts.map(p => parseFloat(p.price) || 0).filter(v => !isNaN(v))
    const minEl = document.querySelector('#price-min-inline')
    const maxEl = document.querySelector('#price-max-inline')
    if (prices.length) {
        const min = Math.min(...prices)
        const max = Math.max(...prices)
        if (minEl) {
            minEl.placeholder = Math.round(min)
            minEl.min = 0
        }
        if (maxEl) {
            maxEl.placeholder = Math.round(max)
            maxEl.min = 0
        }
    }
    // Привяжем кнопки применения/очистки
    const applyBtn = document.querySelector('#price-apply')
    const clearBtn = document.querySelector('#price-clear')
    if (applyBtn) applyBtn.addEventListener('click', applyFilters)
    if (clearBtn) clearBtn.addEventListener('click', function(){
        if (minEl) minEl.value = ''
        if (maxEl) maxEl.value = ''
        applyFilters()
    })

    // Перший рендер — застосувати фільтри/сортування (за замовчуванням — від більшої ціни до меншої)
    applyFilters()
})