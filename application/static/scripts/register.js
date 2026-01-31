// Elementos do DOM
const processBtn = document.getElementById('processBtn');
const clearBtn = document.getElementById('clearBtn');
const saveBtn = document.getElementById('saveBtn')

const resultDiv = document.getElementById('result');
const resultDivError = document.getElementById('resultError');
const resultContainer = document.getElementsByClassName('result-container')[0]

const inputText = document.querySelectorAll('.inputText');
const printResult = document.querySelectorAll('.print-result')
const actionSelect = document.getElementById('action');
const actionValue = document.getElementById('actionValue')
const infoBox = document.getElementsByClassName('info-box')[0]
const obs = document.getElementById('print-obs')

inputText[7].value = new Date().toISOString().split('T')[0]

// Processa o texto quando o botão é clicado
processBtn.addEventListener('click', () => {
    resultContainer.style.display = 'block'
    document.getElementsByClassName('result-container')[0].scrollIntoView()
    let vetor = []
    inputText.forEach((e, i) => {
        if (!e.value.trim() && i != 8) {
            vetor.push(i)
        }
    })
 
    let input = ["Nome do Fármaco","alerta de baixa no estoq. (Quantidade)", "Quantidade", "Lote", "Unidade", "Fornecedor", "Validade","Recebido"]
    
    if (vetor.length) {
        let vazio = vetor.map(i => { return input[i] })
        resultDivError.textContent = `Por favor, preencha os campos corretamente: ${vazio}.`;
        resultDiv.style.display = 'none'
        saveBtn.style.display = 'none'
        return
    }

    resultDiv.style.display = 'block'
    saveBtn.style.display = 'block'
    resultDivError.textContent = '';

    printResult[0].textContent = inputText[0].value
    printResult[1].textContent = inputText[2].value
    printResult[2].textContent = inputText[3].value
    printResult[3].textContent = inputText[4].value
    printResult[4].textContent = inputText[5].value
    printResult[5].textContent = inputText[6].value

    actionValue.innerHTML = actionSelect.value
    if (inputText[8].value.trim()) {
        infoBox.style.display = 'block'
        obs.innerHTML = inputText[8].value
    } else {
        infoBox.style.display = 'none'
    };
});

// Limpa todos os campos
clearBtn.addEventListener('click', () => {
    zero()
    builder(bdPharma)
    actionSelect.value = 'diagnóstico';

    inputText.forEach((item, i) => {
        switch (i) {
            case 1:
                item.value = 5
                break;
            case 3:
                item.value = 'frasco'
                break;
            default:
                item.value = ''
                break;
        }
    })

    resultContainer.style.display = 'none'
    inputText[0].focus();
});