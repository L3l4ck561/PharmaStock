const auth = document.querySelectorAll('.auth')

let login = false
function register() {
    login = !login
    if (login) {
        auth[0].textContent = 'Login'
        for (let i = 1; i < 3; i++) {
            auth[i].style.display = 'none'
            auth[i].value = ''
            auth[i].required = false
        }
        auth[3].innerHTML='Criar uma conta? <u><a id="register" onclick="register()">logup</a></u>'
        auth[4].textContent='Log in'
        return
    }
    auth[0].textContent = 'Logup'
    for (let i = 1; i < 3; i++) {
        auth[i].style.display = 'block'
        auth[i].required = true
    }
    auth[3].innerHTML='Já tem uma conta? <u><a id="register" onclick="register()">login</a></u>'
    auth[4].textContent='Log un'
}
register()


