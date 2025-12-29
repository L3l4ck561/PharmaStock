const msgerro = document.getElementById('msgerro')
const input = document.getElementById('busca')
let storage = JSON.parse(localStorage.getItem("controleLotesDB")) || []

input.addEventListener('blur', () => {
    const termo = input.value.toLowerCase();
    if (termo.trim()) {
        const resultados = bdPharma.filter(e =>
            e[2].toLowerCase().includes(termo)
        );

        if (resultados.length) {
            input.value = ''
            cardItem(resultados[0][0])
            msgerro.style.display = 'none'
        } else {
            msgerro.style.display = 'block'
        }
    } else {
        msgerro.style.display = 'none'
    }

})

input.addEventListener('input', () => {
    const termo = input.value.toLowerCase();
    if (termo.trim()) {
        const resultados = bdPharma.filter(e =>
            e[2].toLowerCase().includes(termo)
        );

        if (resultados.length) {
            console.log('oi')
            bilder(resultados)
        } else { bilder() }
    }
})

const opbox = document.querySelectorAll('.valueradio')
const tabelaT = document.getElementsByClassName('tabela')
opbox.forEach(e => e.addEventListener('input', () => {
    if (e.value == 'value-1') {
        tabelaT[0].classList.add('animar')
        tabelaT[1].classList.remove('animar')
        tabelaT[1].style.display = 'none'
        tabelaT[0].style.display = 'block'
    } else {
        tabelaT[1].classList.add('animar')
        tabelaT[0].classList.remove('animar')
        tabelaT[1].style.display = 'block'
        tabelaT[0].style.display = 'none'
    }
}))


let bdPharma, bdStock

async function atualizarDados() {
    try {
        const resPharma = await fetch('/get-pharma');
        bdPharma = await resPharma.json();

        const resStock = await fetch('/get-stock');
        bdStock = await resStock.json();

        bilder()
    } catch (err) {
        console.error('Erro:', err);
    }
}

atualizarDados();

function bilder(result = bdPharma) {
    const ul = document.getElementsByClassName('lista-horizontal')[0]
    ul.innerHTML = ''

    bdPharma.forEach(e => {
        const li = document.createElement("li");

        li.innerHTML = `${e[2]}`;

        ul.appendChild(li);

    })

    storage = JSON.parse(localStorage.getItem("controleLotesDB")) || []

    if(storage.length){
        let ids = storage.map(e=>e.lote)[0].map(e=>e[1])
        result = result.filter(item => !ids.includes(item[0]));
        console.log(ids)
    }

    result = result.filter(item => {
        let stock = bdStock.filter(e=>e[1]===item[0]).filter(e=>e[2]>0)
        if(stock.length){return item}
    })

    const ul2 = document.getElementsByClassName('opcao')[0];
    ul2.innerHTML = '';

    result.forEach(e => {
        const li = document.createElement("li");

        li.textContent = e[2];
        li.className = "px-2 py-2 cursor-pointer text-sm rounded-lg hover:bg-green-100";

        li.addEventListener('mousedown', (i) => {
            input.value = e[2];
        });

        ul2.appendChild(li);
    });
}

const modalBox = document.getElementsByClassName('modal-box')[0]
const modal = document.getElementsByClassName('modal')[0]

function cardItem(cod) {
    opbox[0].checked = true
    opbox[1].checked = false
    tabelaT[0].classList.add('animar')
    tabelaT[1].classList.remove('animar')
    tabelaT[1].style.display = 'none'
    tabelaT[0].style.display = 'block'

    modalBox.classList.remove('animar4')
    modal.classList.remove('animar6')
    modalBox.style.display = 'flex'
    modalBox.classList.add('animar3')
    modal.style.display = 'block'
    modal.classList.add('animar5')

    const pharma = bdPharma.find(i => i[0] === cod)
    const stock = bdStock.filter(e => e[1] === cod)
    document.getElementById('nomeP').textContent = pharma[2]

    let lista = stock.map(e => {
        return [[e[0], e[3]], e[2]]
    })

    const tbody1 = document.querySelector("#tabela tbody");     // Primeira tabela (lotes)
    const tbody2 = document.querySelector("#tabela2 tbody");    // Segunda tabela (semana)
    tbody1.innerHTML = ''
    tbody2.innerHTML = ''

    // Elementos dos totais
    const totalDisponivelEl = document.getElementById("total-disponivel");
    const totalUsadoEl = document.getElementById("total-usado");
    const totalRestanteEl = document.getElementById("total-restante");
    const totalADistribuirEl = document.getElementById("total-distr"); // Renomeei para clareza

    let totalDisponivel = 0;
    let totalUsado = 0;
    let totalDistribuido = 0;

    // Calcula total disponível
    lista.forEach(item => totalDisponivel += item[1]);
    totalDisponivelEl.textContent = totalDisponivel;

    // Array para guardar os inputs da semana (para atualizar max depois)
    let inputsSemana = [];

    // === FUNÇÃO PRINCIPAL: Atualiza todos os totais e limites ===
    function atualizarTotaisEDistribuicao() {
        // Recalcula total usado
        totalUsado = 0;
        document.querySelectorAll(".numero").forEach(input => {
            totalUsado += Number(input.value);
        });

        // Recalcula total distribuído na semana
        totalDistribuido = 0
        document.querySelectorAll(".numero2").forEach(input => {
            totalDistribuido += Number(input.value);
        });

        // Atualiza os textos
        totalUsadoEl.textContent = totalUsado;
        totalRestanteEl.textContent = totalDisponivel - totalUsado;
        totalADistribuirEl.textContent = totalUsado - totalDistribuido;

        // Atualiza o atributo max de todos os inputs da semana
        inputsSemana.forEach(input => {
            input.max = totalUsado; // O máximo agora é o total usado atual

            // Se o valor atual for maior que o novo max, ajusta para o max
            if (Number(input.value) > totalUsado) {
                input.value = totalUsado;
            }
        });

        // Atualiza todas as barras de progresso da semana
        document.querySelectorAll(".progress-bar-semana").forEach(bar => {
            const input = bar.closest("td").querySelector(".numero2");
            const percent = totalUsado > 0 ? (Number(input.value) / totalUsado) * 100 : 0;
            bar.style.width = percent + "%";
        });

        if (totalUsado > 0 && totalUsado - totalDistribuido == 0) {
            document.getElementById('processBtn').style.display = 'flex'
        } else {
            document.getElementById('processBtn').style.display = 'none'
        }
    }

    // === CRIA A PRIMEIRA TABELA (LOTES) ===
    lista.forEach((item) => {
        const [lote, quantidade] = item;

        const tr = document.createElement("tr");

        const tdLote = document.createElement("td");
        tdLote.textContent = lote[1];
        tdLote.style.fontWeight = "600";

        const tdUsado = document.createElement("td");
        const contador = document.createElement("div");
        contador.className = "contador";

        const btnMenos = document.createElement("button");
        btnMenos.textContent = "−";
        btnMenos.className = "menos";

        const input = document.createElement("input");
        input.type = "number";
        input.value = 0;
        input.min = 0;
        input.max = quantidade;
        input.className = "numero";
        input.readOnly = true;

        const btnMais = document.createElement("button");
        btnMais.textContent = "+";
        btnMais.className = "mais";

        const btnReset = document.createElement("button");
        btnReset.textContent = "Reset";
        btnReset.className = "reset";

        const progressContainer = document.createElement("div");
        progressContainer.className = "progress-container";

        const progressBar = document.createElement("div");
        progressBar.className = "progress-bar";
        progressContainer.appendChild(progressBar);

        const atualizarProgresso = () => {
            const percent = (Number(input.value) / quantidade) * 100;
            progressBar.style.width = percent + "%";
        };

        btnMais.onclick = () => { if (input.value < quantidade) { input.value++; atualizarProgresso(); atualizarTotaisEDistribuicao(); } };
        btnMenos.onclick = () => { if (input.value > 0) { input.value--; atualizarProgresso(); atualizarTotaisEDistribuicao(); } };
        btnReset.onclick = () => { input.value = 0; atualizarProgresso(); atualizarTotaisEDistribuicao(); };

        contador.append(btnMenos, input, btnMais);
        tdUsado.append(contador, btnReset, progressContainer);

        const tdQuantidade = document.createElement("td");
        tdQuantidade.textContent = quantidade;
        tdQuantidade.style.fontWeight = "600";

        tr.append(tdLote, tdUsado, tdQuantidade);
        tbody1.appendChild(tr);

        atualizarProgresso();
    });

    // === CRIA A SEGUNDA TABELA (DISTRIBUIÇÃO SEMANAL) ===
    const diasSemana = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];

    diasSemana.forEach(dia => {
        const tr = document.createElement("tr");

        const tdDia = document.createElement("td");
        tdDia.textContent = dia;
        tdDia.style.fontWeight = "600";

        const tdDistribuir = document.createElement("td");

        const contador = document.createElement("div");
        contador.className = "contador";

        const btnMenos = document.createElement("button");
        btnMenos.textContent = "−";
        btnMenos.className = "menos";

        const input = document.createElement("input");
        input.type = "number";
        input.value = 0;
        input.min = 0;
        input.max = totalUsado; // será atualizado dinamicamente
        input.className = "numero2";
        input.readOnly = true;

        // Guarda referência para atualizar max depois
        inputsSemana.push(input);

        const btnMais = document.createElement("button");
        btnMais.textContent = "+";
        btnMais.className = "mais";

        const btnReset = document.createElement("button");
        btnReset.textContent = "Reset";
        btnReset.className = "reset";

        const progressContainer = document.createElement("div");
        progressContainer.className = "progress-container";

        const progressBar = document.createElement("div");
        progressBar.className = "progress-bar progress-bar-semana";
        progressContainer.appendChild(progressBar);

        const atualizarProgressoSemana = () => {
            const percent = totalUsado > 0 ? (Number(input.value) / totalUsado) * 100 : 0;
            progressBar.style.width = percent + "%";
        };

        btnMais.onclick = () => {
            if (Number(input.value) < totalUsado && totalUsado - totalDistribuido != 0) {
                input.value++;
                atualizarProgressoSemana();
                atualizarTotaisEDistribuicao();
            }
        };

        btnMenos.onclick = () => {
            if (input.value > 0) {
                input.value--;
                atualizarProgressoSemana();
                atualizarTotaisEDistribuicao();
            }
        };

        btnReset.onclick = () => {
            input.value = 0;
            atualizarProgressoSemana();
            atualizarTotaisEDistribuicao();
        };

        contador.append(btnMenos, input, btnMais);
        tdDistribuir.append(contador, btnReset, progressContainer);

        const tdTotalNecessario = document.createElement("td");
        tdTotalNecessario.textContent = totalUsado; // será atualizado via função
        tdTotalNecessario.className = "total-necessario";
        tdTotalNecessario.style.fontWeight = "600";

        tr.append(tdDia, tdDistribuir);
        tbody2.appendChild(tr);

        atualizarProgressoSemana();
    });

    // Atualização final dos textos "total necessário por dia"
    function atualizarTextoTotalNecessario() {
        document.querySelectorAll(".total-necessario").forEach(td => {
            td.textContent = totalUsado;
        });
    }

    // Chama tudo no final
    atualizarTotaisEDistribuicao();
    atualizarTextoTotalNecessario();

    // === FUNÇÃO PARA ZERAR TUDO ===
    function zerarTudo() {
        // 1. Zera todos os inputs da primeira tabela (lotes usados)
        document.querySelectorAll(".numero").forEach(input => {
            input.value = 0;
        });

        // 2. Zera todos os inputs da segunda tabela (distribuição semanal)
        document.querySelectorAll(".numero2").forEach(input => {
            input.value = 0;
        });

        // 3. Atualiza todas as barras de progresso dos lotes
        document.querySelectorAll("#tabela .progress-bar").forEach(bar => {
            bar.style.width = "0%";
        });

        // 4. Atualiza todas as barras de progresso da semana
        document.querySelectorAll("#tabela2 .progress-bar-semana").forEach(bar => {
            bar.style.width = "0%";
        });

        // 5. Atualiza todos os totais e limites
        atualizarTotaisEDistribuicao();
        modalBox.classList.remove('animar3')
        modal.classList.remove('animar5')
        modalBox.classList.add('animar4')
        modal.classList.add('animar6')
    }

    // === FUNÇÃO PARA SALVAR NO LOCALSTORAGE ===
    function salvarEstado() {
        // 1. Coleta os valores usados dos lotes
        const loteUsado = [];
        document.querySelectorAll("#tabela .numero").forEach((input, index) => {
            const loteNome = lista[index][0][0]; // Pega o nome do lote na posição correta
            loteUsado.push([loteNome, Number(input.value)])
        });

        // 2. Coleta a distribuição semanal (na ordem: Segunda → Sexta)
        const semana = [];
        document.querySelectorAll("#tabela2 .numero2").forEach(input => {
            semana.push(Number(input.value));
        });

        // 3. Cria o objeto do salvamento atual
        const novoSalvamento = {
            id_pharma: cod,
            lote: loteUsado,
            semana: semana,
            data: new Date().toLocaleString('pt-BR') // Opcional: salva data/hora do salvamento
        };

        // 4. Carrega o banco existente (ou cria novo)
        let dataBase = JSON.parse(localStorage.getItem("controleLotesDB")) || [];

        // 5. Adiciona o novo salvamento
        dataBase.push(novoSalvamento);
        console.log(novoSalvamento)
        // 6. Salva de volta no localStorage
        localStorage.setItem("controleLotesDB", JSON.stringify(dataBase));

        // // Feedback visual
        // const btn = document.getElementById("btn-salvar");
        // const textoOriginal = btn.innerHTML;
        // btn.innerHTML = "✔ Salvo!";
        // btn.style.background = "#10b981"; // verde sucesso
        // setTimeout(() => {
        //     btn.innerHTML = textoOriginal;
        //     btn.style.background = "";
        // }, 2000);
        zerarTudo()
        bilder()
    }
}
document.getElementById("processBtn").addEventListener("click", salvarEstado);
document.getElementById("clearBtn").addEventListener("click", zerarTudo);
function pedidoCard() {
    //     const ul3 = document.getElementsByClassName('pedidoList')[0];
    //     ul3.innerHTML = '';

    //     [1, 1, 1, 1, 1, 1].forEach(e => {
    //         const li = document.createElement("li");

    //         li.innerHTML = `
    // <div class="master-container">
    //                 <div class="card cart">
    //                     <label class="title">Your cart</label>
    //                     <div class="products">
    //                         <div class="product">
    //                             <div class="corP"></div>
    //                             <div>
    //                                 <span>Cheese Burger</span>
    //                                 <p>Extra Spicy</p>
    //                                 <p>No mayo</p>
    //                             </div>
    //                             <div class="quantity">
    //                                 <button>
    //                                     <svg fill="none" viewBox="0 0 24 24" height="14" width="14"
    //                                         xmlns="http://www.w3.org/2000/svg">
    //                                         <path stroke-linejoin="round" stroke-linecap="round" stroke-width="2.5"
    //                                             stroke="#47484b" d="M20 12L4 12"></path>
    //                                     </svg>
    //                                 </button>
    //                                 <label>2</label>
    //                                 <button>
    //                                     <svg fill="none" viewBox="0 0 24 24" height="14" width="14"
    //                                         xmlns="http://www.w3.org/2000/svg">
    //                                         <path stroke-linejoin="round" stroke-linecap="round" stroke-width="2.5"
    //                                             stroke="#47484b" d="M12 4V20M20 12H4"></path>
    //                                     </svg>
    //                                 </button>
    //                             </div>
    //                             <label class="price small">$23.99</label>
    //                         </div>
    //                     </div>
    //                 </div>

    //                 <div class="card coupons">
    //                     <label class="title">Apply coupons</label>
    //                     <form class="form">
    //                         <input type="text" placeholder="Apply your coupons here" class="input_field">
    //                         <button>Apply</button>
    //                     </form>
    //                 </div>

    //                 <div class="card checkout">
    //                     <label class="title">Checkout</label>
    //                     <div class="details">
    //                         <span>Your cart subtotal:</span>
    //                         <span>47.99$</span>
    //                         <span>Discount through applied coupons:</span>
    //                         <span>3.99$</span>
    //                         <span>Shipping fees:</span>
    //                         <span>4.99$</span>
    //                     </div>
    //                     <div class="checkout--footer">
    //                         <label class="price"><sup>$</sup>57.99</label>
    //                         <button class="checkout-btn">Checkout</button>
    //                     </div>
    //                 </div>
    //             </div>
    //         `



    //         ul3.appendChild(li);
    //     });
}