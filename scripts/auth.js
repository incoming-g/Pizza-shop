// Simple client-side auth demo (localStorage)
// WARNING: This is for demo/UI only — not secure for real apps.

const AUTH_KEY = 'pizzalite_users'
const AUTH_SESSION = 'pizzalite_session'

function loadUsers() {
    try {
        return JSON.parse(localStorage.getItem(AUTH_KEY) || '{}')
    } catch (e) {
        return {}
    }
}

function saveUsers(users) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(users))
}

function showToast(msg) {
    const t = document.createElement('div')
    t.className = 'pl-toast'
    t.textContent = msg
    document.body.appendChild(t)
    setTimeout(() => t.remove(), 2200)
}

function registerUser(ev) {
    ev.preventDefault()
    const form = ev.target
    const name = form.querySelector('#reg-name').value.trim()
    const email = form.querySelector('#reg-email').value.trim().toLowerCase()
    const pass = form.querySelector('#reg-pass').value
    if (!name || !email || !pass) {
        showToast('Заповніть всі поля')
        return
    }
    const users = loadUsers()
    if (users[email]) {
        showToast('Користувач вже існує')
        return
    }
    // simple obfuscation for demo: base64
    users[email] = { name: name, pass: btoa(pass) }
    saveUsers(users)
    showToast('Реєстрація успішна')
    const modalEl = document.getElementById('registerModal')
    const bs = bootstrap.Modal.getInstance(modalEl)
    bs.hide()
}

function loginUser(ev) {
    ev.preventDefault()
    const form = ev.target
    const email = form.querySelector('#login-email').value.trim().toLowerCase()
    const pass = form.querySelector('#login-pass').value
    if (!email || !pass) {
        showToast('Заповніть всі поля')
        return
    }
    const users = loadUsers()
    const user = users[email]
    if (!user || user.pass !== btoa(pass)) {
        showToast('Невірний email або пароль')
        return
    }
    // save session
    localStorage.setItem(AUTH_SESSION, JSON.stringify({ email: email, name: user.name }))
    showToast('Вхід успішний')
    const modalEl = document.getElementById('loginModal')
    const bs = bootstrap.Modal.getInstance(modalEl)
    bs.hide()
    updateNavbarAuth()
}

function logoutUser() {
    localStorage.removeItem(AUTH_SESSION)
    showToast('Ви вийшли')
    updateNavbarAuth()
}

function getSession() {
    try { return JSON.parse(localStorage.getItem(AUTH_SESSION) || 'null') } catch(e) { return null }
}

function updateNavbarAuth() {
    const sess = getSession()
    const loginBtn = document.querySelectorAll('.nav-login')
    const regBtn = document.querySelectorAll('.nav-register')
    const userWrap = document.querySelectorAll('.nav-user')
    if (sess) {
        loginBtn.forEach(el => el.style.display = 'none')
        regBtn.forEach(el => el.style.display = 'none')
        userWrap.forEach(el => {
            el.style.display = 'inline-flex'
            el.querySelector('.user-name').textContent = sess.name
        })
    } else {
        loginBtn.forEach(el => el.style.display = 'inline-flex')
        regBtn.forEach(el => el.style.display = 'inline-flex')
        userWrap.forEach(el => el.style.display = 'none')
    }
}

// Attach events on DOM ready
document.addEventListener('DOMContentLoaded', function(){
    // bind forms if present
    const regForm = document.getElementById('register-form')
    if (regForm) regForm.addEventListener('submit', registerUser)
    const loginForm = document.getElementById('login-form')
    if (loginForm) loginForm.addEventListener('submit', loginUser)

    // bind logout buttons
    document.querySelectorAll('.nav-logout').forEach(btn => btn.addEventListener('click', logoutUser))

    // bind navbar buttons to open modals
    document.querySelectorAll('.nav-login').forEach(btn => btn.addEventListener('click', function(){
        const modal = new bootstrap.Modal(document.getElementById('loginModal'))
        modal.show()
    }))
    document.querySelectorAll('.nav-register').forEach(btn => btn.addEventListener('click', function(){
        const modal = new bootstrap.Modal(document.getElementById('registerModal'))
        modal.show()
    }))

    updateNavbarAuth()
})
