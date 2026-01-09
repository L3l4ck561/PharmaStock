const btnAside = document.getElementsByClassName('checkbox')[0]
const sidebar = document.getElementsByClassName('sidebar')[0]
const checkbox = document.getElementById('checkbox')
let state = true

btnAside.addEventListener('click', () => {
    if (state) {
        if (checkbox.checked) {
            sidebar.classList.add('abrir-aside')
            sidebar.classList.remove('fechar-aside')
            return
        }
        sidebar.classList.add('fechar-aside')
        sidebar.classList.remove('abrir-aside')
    } else {
        check.classList.remove('toggle')
        check.classList.add('burger')
        state = true
        cadatroF()
    }
})

const check = document.getElementsByClassName('checkbox')[0]

const boxModal = document.getElementsByClassName('modal-box')[0]
let ativo = false
function modal() {
    ativo = !ativo
    if (ativo) {
        boxModal.classList.remove('fechar-modal')
        boxModal.classList.add('abrir-modal')
        return
    }
    boxModal.classList.remove('abrir-modal')
    boxModal.classList.add('fechar-modal')
}

// tela de cadastro dos farmacos
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const header = document.querySelector('header')
const footer = document.querySelector('footer')
const main = document.querySelector('main')
const container = document.querySelector('.container')
const cadastro = document.querySelector('.formulario')

let ativo2 = false
async function cadatroF() {
    ativo2 = !ativo2
    if (ativo2) {
        check.classList.add('toggle')
        check.classList.remove('burger')
        state = false

        sidebar.classList.add('fechar-aside')
        sidebar.classList.remove('abrir-aside')
        header.style.transform = 'translateY(-100%)'
        footer.style.transform = 'translateY(110%)'
        await delay(100)
        container.style.transform = 'translateX(-120%)'
        await delay(100)
        cadastro.style.display = 'block'
        await delay(100)
        cadastro.style.opacity = 1
        cadastro.style.transform = 'translateX(0)'
        await delay(500)
        container.style.opacity = 0
        container.style.display = 'none'
        footer.style.display = 'none'
        return
    } else {
        header.style.transform = 'translateY(0)'

        await delay(100)
        cadastro.style.transform = 'translateX(90vw)'
        container.style.opacity = 1
        container.style.display = 'block'
        await delay(100)
        container.style.transform = 'translateX(0)'
        await delay(500)
        footer.style.display = 'block'
        cadastro.style.opacity = 0
        cadastro.style.display = 'none'
        await delay(500)
        footer.style.transform = 'translateY(0)'
    }
}

//dados do banco

let bdPharma = []
let bdStock = []

// formulário

const input = document.getElementsByClassName('inputText')
const msgFC = document.getElementById('msgFC')//mensagem de busca do farmaco
const btnEdit = document.getElementsByClassName('Btn')[0]
const editAtivo = document.getElementById('editAtivo')
const inputGroup = document.querySelectorAll('.input-group')
const none = document.querySelectorAll('.none')

const buttonGroup = document.getElementsByClassName('button-group')

btnEdit.addEventListener('click', () => {
    editAtivo.value = 1
    builder([])
    btnEdit.style.display = 'none'
    for (let i = 3; i <= 8; i++) {
        inputGroup[i].classList.add('none')
    }
    none[0].style.display = 'block'
    none[1].style.display = 'block'
    none[2].style.display = 'block'

    buttonGroup[0].style.display = 'none'
    buttonGroup[1].style.display = 'flex'
})
function celEdit() {
    input[0].value = ''
    editAtivo.value = 0
    for (let i = 3; i <= 8; i++) {
        inputGroup[i].classList.remove('none')
    }
    buttonGroup[1].style.display = 'none'
    buttonGroup[0].style.display = 'flex'
    builder(bdPharma)
    zero()
}

function builder(data) {
    tags.innerHTML = ''
    data.forEach(e => {

        // Remove o #
        let hex = e[1].replace("#", "");

        // Converte para RGB
        let r = parseInt(hex.substring(0, 2), 16);
        let g = parseInt(hex.substring(2, 4), 16);
        let b = parseInt(hex.substring(4, 6), 16);

        // Fórmula de luminância (percepção humana)
        let luz = (0.299 * r + 0.587 * g + 0.114 * b);

        tags.innerHTML += `<button value="${e[0]}" style='background-color:${e[1]};color:${luz > 140 ? "black" : "white"};border:none;border-bottom:2px solid #555;' class="tagItem" type='button'><b>${e[2]}</b></button>`
    });
    const tagItens = document.querySelectorAll('.tagItem')
    tagItens.forEach(item => item.addEventListener('click', () => {
        zero()
        const produto = data.find(p => p[0] == item.value);
        inputText[0].value = produto[2]
        document.getElementById('idPharma').value = item.value
        btnEdit.style.display = 'flex'

        none[0].value = produto[1]
        action.value = produto[3]
        inputText[1].value = produto[4]
    }))
}
const action = document.getElementById('action')
input[0].addEventListener('blur', () => {
    if (editAtivo.value == 0) {
        const termo = input[0].value.toLowerCase();
        if (termo.trim()) {
            const resultados = bdPharma.filter(e =>
                e[2].toLowerCase().includes(termo)
            );
            if (resultados.length) {
                btnEdit.style.display = 'flex'
                inputText[0].value = resultados[0][2]
                document.getElementById('idPharma').value = resultados[0][0]

                none[0].value = resultados[0][1]
                action.value = resultados[0][3]
                inputText[1].value = resultados[0][4]

            } else {
                document.getElementById('idPharma').value = ''
                none[0].value = '#42ffff'
                action.value = 'diagnóstico'
                inputText[1].value = 1
            }
        }
    }
})

input[0].addEventListener('input', () => {
    if (editAtivo.value == 0) {
        const termo = input[0].value.toLowerCase();
        if (termo.trim()) {
            const resultados = bdPharma.filter(e =>
                e[2].toLowerCase().includes(termo)
            );
            if (resultados.length) {
                zero()
                builder(resultados)
            } else {
                btnEdit.style.display = 'none'
                none.forEach(e => e.style.display = 'block')
                msgFC.textContent = 'Fármaco novo! nos informe as novas informações junto com o cadastro.'
                builder([])
            }
        } else {
            zero()
            builder(bdPharma)
        }
    }
})

function zero() {
    btnEdit.style.display = 'none'
    const none = document.querySelectorAll('.none')
    none.forEach(e => e.style.display = 'none')
    msgFC.textContent = ''
    none[0].value = '#42ffff'
    action.value = 'diagnóstico'
    inputText[1].value = 1
}

// puxando os dados no backend

let ini = true
const tags = document.getElementsByClassName('tags')[0]

async function atualizarDados() {
    try {
        const resPharma = await fetch('/get-pharma');
        bdPharma = await resPharma.json();
        if (ini) { ini = false; builder(bdPharma) }

        const resStock = await fetch('/get-stock');
        bdStock = await resStock.json();

        lista()
    } catch (err) {
        console.error('Erro:', err);
    }
}

//iniciando sistema
//setInterval(atualizarDados, 2000);
atualizarDados();

const boxcheck = document.getElementById('check')
boxcheck.addEventListener('input', () => { lista() })
const alertBaixa = document.getElementById('alertBaixa')
//grafico
function lista() {
    // preparando os dados
    let contagem = bdPharma.map(e => {
        const itens = bdStock.filter(i => i[1] === e[0]).map(l => l[2])
        const soma = itens.reduce((total, numero) => total + numero, 0);
        return [e[2], soma, e[1], e[4]]
    });

    if (boxcheck.checked) {
        contagem = contagem.filter(e => e[1] <= e[3] && e[1]!=0)
        alertBaixa.style.display = 'block'
    }
    if (contagem.filter(e => e[1] <= e[3] && e[1]!=0).length) {
        alertBaixa.style.display = 'block'
    } else {
        alertBaixa.style.display = 'none'
    }


    //construindo as informações

    //grafico

    const barras = contagem.filter(e => e[1]!=0)
    let coll = [
        {
            'quant': barras.map(e => e[1]),
            'cor': barras.map(e => e[1] > e[3] ? e[2] : 'red'),
        },
    ]

    chart.data.labels = barras.map(e => e[0]);
    chart.data.datasets[0].data = coll[0].quant
    chart.data.datasets[0].backgroundColor = coll[0].cor

    chart.update();

    //lista quant

    const ul = document.getElementsByClassName('listaItens')
    ul[0].innerHTML = ''
    contagem.forEach(e => {
        const li = document.createElement("li");

        li.innerHTML = `<p style='flex:3;${e[1]==0?'color:#a1a1a1ff;':e[1] <= e[3] ? 'color:rgb(255, 0, 0);' : ''}'>${e[0]}</p><p> ➔ ${e[1]} - </p><div style='width: 30px;height: 30px;background-color: ${e[2]};border-radius:10px;margin-left:3px'></div>`;
        if(e[1]==0){
             li.style.background = 'linear-gradient(to right, #e0e0e0ff, white)'
        }else if (e[1] <= e[3]) { li.style.background = 'linear-gradient(to right, rgba(255,0,0,0.2), white)' }

        ul[0].appendChild(li);

    })

    //lista Dt
    bdStock.sort((a, b) => new Date(a[6]) - new Date(b[6]));

    const ulH = document.getElementsByClassName('lista-horizontal')[0]
    ulH.innerHTML = ''
    bdStock.forEach(e => {
        const li = document.createElement("li");
        let pharma = bdPharma.find(p => p[0] === e[1])[2]

        const dataVal = new Date(e[6]);

        const dia = String(dataVal.getUTCDate()).padStart(2, "0");
        const mes = String(dataVal.getUTCMonth() + 1).padStart(2, "0");
        const ano = dataVal.getUTCFullYear();

        const hoje = new Date();

        const { anos, meses, dias } = diferencaData(hoje, dataVal);


        let tempoZero = `${anos} ${anos == 1?'ano':'anos'}`

        if (anos < 0) {
            tempoZero = 'Passou da validade'
            li.style.backgroundColor = '#e0e0e0ff'
            li.style.setProperty("--hover-color", "#a1a1a1ff");
            li.style.setProperty("--hover-shadow", "rgba(199, 199, 199, 0.4)");
        }else if(anos == 0 && meses > 0){
            tempoZero = `${meses} ${meses == 1?'mês':'meses'}`
            li.style.backgroundColor = '#fffbbeff'
            li.style.setProperty("--hover-color", "#c1c423ff");
            li.style.setProperty("--hover-shadow", "rgba(229, 211, 46, 0.4)");
        } else if (anos == 0 && meses == 0 && dias > 0) {
            tempoZero = `${dias} ${dias == 1?'dia':'dias'}`
            li.style.backgroundColor = '#ffe1beff'
            li.style.setProperty("--hover-color", "#c47e23ff");
            li.style.setProperty("--hover-shadow", "rgba(229, 128, 46, 0.4)");
        } else if (meses == 0 && dias == 0 && anos == 0) {
            tempoZero = 'vence hoje!'

            li.style.backgroundColor = '#ffbebeff'
            li.style.setProperty("--hover-color", "#c42323ff");
            li.style.setProperty("--hover-shadow", "rgba(229, 46, 46, 0.4)");
        }

        li.innerHTML = `<h3>${pharma}</h3><p>lote: <i>${e[3]}</i></p><strong>${dia}/${mes}/${ano} | ${tempoZero}</strong>`;

        ulH.appendChild(li);
    })
}


const ctx = document.getElementById('myChart');

const chart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: [],
        datasets: [
            {
                label: 'Estoque',
                data: [],
                backgroundColor: []
            },
            {
                label: 'Usados',
                data: [],
                backgroundColor: '#42f5a1ff'
            }
        ]
    },
    options: {
        indexAxis: 'y',
        responsive: true,
        scales: {
            x: {
                beginAtZero: true,
                grid: { display: false }
            },
            y: {
                grid: { display: true }
            }
        },
        onClick: (event, elements) => {
            if (elements.length > 0) {
                const index = elements[0].index;
                const label = chart.data.labels[index];
                const value = chart.data.datasets[0].data[index];

                alert(`Você clicou em ${label} com valor ${value}`);
            }
        }
    }
});

function diferencaData(dataInicial, dataFinal) {
    let anos = dataFinal.getUTCFullYear() - dataInicial.getUTCFullYear();
    let meses = dataFinal.getUTCMonth() - dataInicial.getUTCMonth();
    let dias = dataFinal.getUTCDate() - dataInicial.getUTCDate();

    if (dias < 0) {
        meses--;
        const ultimoDiaMesAnterior = new Date(Date.UTC(
            dataFinal.getUTCFullYear(),
            dataFinal.getUTCMonth(),
            0
        )).getUTCDate();
        dias += ultimoDiaMesAnterior;
    }

    if (meses < 0) {
        anos--;
        meses += 12;
    }

    return { anos, meses, dias };
}
