let diasSemana = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];

let datenow = new Date()

diasSemana = diasSemana.filter(e => diasSemana.indexOf(e) + 1 <= datenow.getDay())

const msgerro = document.getElementById('msgerro')
const input = document.getElementById('busca')
const postItens = document.getElementById('dados')
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

let bdPharma = [], bdStock = []

async function atualizarDados() {
    try {
        const resPharma = await fetch('/get-pharma');
        bdPharma = await resPharma.json();

        const resStock = await fetch('/get-stock');
        bdStock = await resStock.json();

        bilder()
        pedidoCard()
    } catch (err) {
        console.error('Erro:', err);
    }
}

atualizarDados();

function bilder(result = bdPharma) {
    storage = JSON.parse(localStorage.getItem("controleLotesDB")) || []
    if (storage.length) {
        let ids_stock = storage.map(e => e.lote[0][0][0])

        let ids_pharma = bdStock.filter(item => ids_stock.includes(item[0])).map(e => e[1]);
        result = result.filter(item => !ids_pharma.includes(item[0]))
    }

    result = result.filter(item => {
        let stock = bdStock.filter(e => e[1] === item[0]).filter(e => e[2] > 0)
        if (stock.length) { return item }
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


let currentModalControllers = null; // Guarda os controladores atuais

function cardItem(cod) {
    // === 1. Abre o modal e troca aba (mesmo de antes) ===
    opbox[0].checked = true;
    opbox[1].checked = false;
    tabelaT[0].classList.add('animar');
    tabelaT[1].classList.remove('animar');
    tabelaT[1].style.display = 'none';
    tabelaT[0].style.display = 'block';

    modalBox.classList.remove('animar4');
    modal.classList.remove('animar6');
    modalBox.style.display = 'flex';
    modalBox.classList.add('animar3');
    modal.style.display = 'block';
    modal.classList.add('animar5');

    // === 2. Busca dados do pharma e stock ===
    const pharma = bdPharma.find(i => i[0] === cod);
    if (!pharma) return;

    const stock = bdStock.filter(e => e[1] === cod);
    document.getElementById('nomeP').textContent = pharma[2];
    document.getElementsByClassName('noselect')[0].value = pharma[0];

    const lista = stock.map(e => [[e[0], e[3]], e[2]]); // [[id_lote, nome_lote], quantidade_disponivel]

    // === 3. Limpa tabelas ===
    const tbody1 = document.querySelector("#tabela tbody");
    const tbody2 = document.querySelector("#tabela2 tbody");
    tbody1.innerHTML = '';
    tbody2.innerHTML = '';

    // Totais
    const totalDisponivelEl = document.getElementById("total-disponivel");
    const totalUsadoEl = document.getElementById("total-usado");
    const totalRestanteEl = document.getElementById("total-restante");
    const totalADistribuirEl = document.getElementById("total-distr");

    const totalDisponivel = lista.reduce((acc, item) => acc + item[1], 0);
    totalDisponivelEl.textContent = totalDisponivel;

    let totalUsado = 0;
    let totalDistribuido = 0;
    const inputsSemana = [];

    // === 4. Busca salvamento existente no localStorage ===
    let storage = JSON.parse(localStorage.getItem("controleLotesDB") || "[]");
    const salvamentoExistente = storage.find(s => s.id_pharma === cod);
    const isEditMode = !!salvamentoExistente;

    // Muda texto do botão
    const processBtn = document.getElementById('processBtn');
    if (processBtn) {
        processBtn.textContent = isEditMode ? 'Atualizar' : 'Processar';
        processBtn.style.display = 'none'; // será mostrado só quando distribuição completa
        document.getElementsByClassName('noselect')[0].style.display = isEditMode ? 'flex' : 'none'
    }

    // === FUNÇÃO CENTRAL DE ATUALIZAÇÃO ===
    const atualizarTotaisEDistribuicao = () => {
        totalUsado = 0;
        document.querySelectorAll(".numero").forEach(input => {
            totalUsado += Number(input.value || 0);
        });

        totalDistribuido = 0;
        document.querySelectorAll(".numero2").forEach(input => {
            totalDistribuido += Number(input.value || 0);
        });

        totalUsadoEl.textContent = totalUsado;
        totalRestanteEl.textContent = totalDisponivel - totalUsado;
        totalADistribuirEl.textContent = totalUsado - totalDistribuido;

        // Atualiza max e corrige valores excessivos nos inputs da semana
        inputsSemana.forEach(input => {
            input.max = totalUsado;
            if (Number(input.value) > totalUsado) input.value = totalUsado;
        });

        // Atualiza barras de progresso da semana
        document.querySelectorAll(".progress-bar-semana").forEach(bar => {
            const input = bar.closest("td").querySelector(".numero2");
            const percent = totalUsado > 0 ? (Number(input.value || 0) / totalUsado) * 100 : 0;
            bar.style.width = `${percent}%`;
        });

        // Atualiza texto "total necessário"
        document.querySelectorAll(".total-necessario").forEach(td => {
            td.textContent = totalUsado;
        });

        // Mostra botão só quando distribuição está completa
        if (processBtn) {
            processBtn.style.display = (totalUsado > 0 && totalUsado === totalDistribuido) ? 'flex' : 'none';
        }

        if (totalUsado == 0 && totalDistribuido != 0) {
            totalADistribuirEl.textContent = 0
        }
    };

    // === 5. Cria tabela de lotes (com preenchimento se edição) ===
    lista.forEach((item, index) => {
        const [loteInfo, quantidade] = item;
        const loteId = loteInfo[0]; // id do lote no stock
        const loteNome = loteInfo[1];

        const tr = document.createElement("tr");

        const tdLote = document.createElement("td");
        tdLote.textContent = loteNome;
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

        const atualizarBarraLote = () => {
            const percent = quantidade > 0 ? (Number(input.value) / quantidade) * 100 : 0;
            progressBar.style.width = `${percent}%`;
        };

        btnMais.onclick = () => {
            if (Number(input.value) < quantidade) {
                input.value = Number(input.value) + 1;
                atualizarBarraLote();
                atualizarTotaisEDistribuicao();
            }
        };

        btnMenos.onclick = () => {
            if (Number(input.value) > 0) {
                input.value = Number(input.value) - 1;
                atualizarBarraLote();
                atualizarTotaisEDistribuicao();
            }
        };

        btnReset.onclick = () => {
            input.value = 0;
            atualizarBarraLote();
            atualizarTotaisEDistribuicao();
        };

        // === PREENCHE SE FOR EDIÇÃO ===
        if (isEditMode) {
            const loteSalvo = salvamentoExistente.lote.find(l => l[0][0] === loteId);
            if (loteSalvo) {
                input.value = loteSalvo[1]; // quantidade usada salva
                atualizarBarraLote();
            }
        }

        contador.append(btnMenos, input, btnMais);
        tdUsado.append(contador, btnReset, progressContainer);

        const tdQuantidade = document.createElement("td");
        tdQuantidade.textContent = quantidade;
        tdQuantidade.style.fontWeight = "600";

        tr.append(tdLote, tdUsado, tdQuantidade);
        tbody1.appendChild(tr);
    });

    // === 6. Cria tabela semanal (com preenchimento se edição) ===


    diasSemana.forEach((dia, index) => {
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
        input.max = 0; // será atualizado dinamicamente
        input.className = "numero2";
        input.readOnly = true;

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

        const atualizarBarraSemana = () => {
            const percent = totalUsado > 0 ? (Number(input.value || 0) / totalUsado) * 100 : 0;
            progressBar.style.width = `${percent}%`;
        };

        btnMais.onclick = () => {
            if (Number(input.value) < totalUsado && totalUsado > totalDistribuido) {
                input.value = Number(input.value) + 1;
                atualizarBarraSemana();
                atualizarTotaisEDistribuicao();
            }
        };

        btnMenos.onclick = () => {
            if (Number(input.value) > 0) {
                input.value = Number(input.value) - 1;
                atualizarBarraSemana();
                atualizarTotaisEDistribuicao();
            }
        };

        btnReset.onclick = () => {
            input.value = 0;
            atualizarBarraSemana();
            atualizarTotaisEDistribuicao();
        };

        // === PREENCHE DISTRIBUIÇÃO SEMANAL SE FOR EDIÇÃO ===
        if (isEditMode && salvamentoExistente.semana[index] !== undefined) {
            input.value = salvamentoExistente.semana[index];
            atualizarBarraSemana();
        }

        contador.append(btnMenos, input, btnMais);
        tdDistribuir.append(contador, btnReset, progressContainer);

        const tdTotalNecessario = document.createElement("td");
        tdTotalNecessario.className = "total-necessario";
        tdTotalNecessario.style.fontWeight = "600";
        tdTotalNecessario.textContent = totalUsado;

        tr.append(tdDia, tdDistribuir);
        tbody2.appendChild(tr);
    });

    // === 7. Remove listeners antigos ===
    if (currentModalControllers) {
        processBtn?.removeEventListener("click", currentModalControllers.salvarOuAtualizar);
        document.getElementById("clearBtn")?.removeEventListener("click", currentModalControllers.zerar);
    }

    // === 8. Funções de zerar e salvar/atualizar ===
    const zerarTudo = () => {
        document.querySelectorAll(".numero, .numero2").forEach(i => i.value = 0);
        document.querySelectorAll(".progress-bar, .progress-bar-semana").forEach(b => b.style.width = "0%");
        atualizarTotaisEDistribuicao();

        modalBox.classList.remove('animar3');
        modal.classList.remove('animar5');
        modalBox.classList.add('animar4');
        modal.classList.add('animar6');
    };

    const salvarOuAtualizar = () => {
        const loteUsado = [];
        document.querySelectorAll("#tabela .numero").forEach((input, index) => {
            const loteInfo = lista[index][0];
            loteUsado.push([loteInfo, Number(input.value)]);
        });

        const semana = [];
        document.querySelectorAll("#tabela2 .numero2").forEach(input => {
            semana.push(Number(input.value));
        });

        const novoEstado = {
            id_pharma: cod,
            lote: loteUsado,
            semana: semana,
            data: new Date().toLocaleString('pt-BR')
        };

        let storage = JSON.parse(localStorage.getItem("controleLotesDB") || "[]");

        if (isEditMode) {
            // Atualiza o existente
            const index = storage.findIndex(s => s.id_pharma === cod);
            if (index !== -1) storage[index] = novoEstado;
        } else {
            // Adiciona novo
            storage.push(novoEstado);
        }

        localStorage.setItem("controleLotesDB", JSON.stringify(storage));
        console.log(isEditMode ? "Atualizado:" : "Salvo:", novoEstado);

        zerarTudo();
        bilder(); // atualiza lista/visual
        pedidoCard()
    };

    function deletar() {
        let storage = JSON.parse(localStorage.getItem("controleLotesDB") || "[]")
        if (storage.length) {
            storage = storage.filter(i => i.id_pharma != document.getElementsByClassName('noselect')[0].value)
            localStorage.setItem("controleLotesDB", JSON.stringify(storage));
        }
        document.getElementsByClassName('pedidoList')[0].innerHTML = '';
        zerarTudo();
        bilder();
        pedidoCard()

    }

    // === 9. Adiciona listeners ===
    processBtn?.addEventListener("click", salvarOuAtualizar);
    document.getElementById("clearBtn")?.addEventListener("click", zerarTudo);
    document.getElementsByClassName('noselect')[0]?.addEventListener("click", deletar)

    currentModalControllers = {
        salvarOuAtualizar,
        zerar: zerarTudo
    };

    // === 10. Atualização inicial ===
    atualizarTotaisEDistribuicao();
}

function limparLocalStorage() {
    const confirmar = confirm(
        `Tem certeza que deseja apagar os dados dessa página?`
    );

    if (confirmar) { limparPage() }
}

function limparPage() {
    localStorage.removeItem("controleLotesDB");
    bilder();
    document.getElementsByClassName('pedidoList')[0].innerHTML = '';
}

function pedidoCard() {
    storage = JSON.parse(localStorage.getItem("controleLotesDB")) || []
    if (storage.length) {
        storage = storage.reverse()
        const ul3 = document.getElementsByClassName('pedidoList')[0];
        ul3.innerHTML = '';

        storage.forEach(e => {
            let pharma = bdPharma.find(p => p[0] === bdStock.find(s => s[0] == e.lote[0][0][0])[1])
            let ids_stock = e.lote.map(s => s[0][0])
            let stock = bdStock.filter(item => ids_stock.includes(item[0])).map(i => {
                const dataVal = new Date(i[6])
                const dia = String(dataVal.getUTCDate()).padStart(2, "0");
                const mes = String(dataVal.getUTCMonth() + 1).padStart(2, "0");
                const ano = dataVal.getUTCFullYear();
                return [i[3], i[2], `${dia}/${mes}/${ano}`, i[0]]
            })
            const disponivel = stock.map(l => l[1]).reduce((acc, num) => acc + num, 0)
            const usados = e.semana.reduce((acc, num) => acc + num, 0)


            const li = document.createElement("li");

            li.innerHTML = `
    <div class="master-container">
                    <div class="card cart">
                        <label class="title">Fármaco</label>
                        <div class="products">
                            <div class="product">
                                <div class="corP" style='background-color:${pharma[1]}';></div>
                                <div>
                                    <span>${pharma[2]}</span>
                                    <p>Extra Spicy</p>
                                    <p>No mayo</p>
                                </div>
                                <div class="quantity">
                                <div style="display: flex;align-items: center;justify-content: center;">
                                        <svg fill="none" viewBox="0 0 24 24" height="14" width="14"
                                            xmlns="http://www.w3.org/2000/svg">
                                            <path stroke-linejoin="round" stroke-linecap="round" stroke-width="2.5"
                                                stroke="#47484b" d="M20 12L4 12"></path>
                                        </svg>
                                </div>
                                    <label>${usados}</label>
                                </div>
                                <label class="price small">${disponivel}</label>
                            </div>
                        </div>
                    </div>

                    <div class="card checkout">
                        <label class="title">Lotes</label>
                        <div class="details" id='${pharma[0]}'>
                            <span>L001 | 20/05/2025</span>
                            <span>5</span>
                        </div>
                    </div>

                    <div class="card checkout">
                        <label class="title">Usados</label>
                        <div class="details" id='${pharma[1]}'>
                            <span>Segunda:</span>
                            <span>5</span>
                            <span>Terça:</span>
                            <span>3</span>
                            <span>Quinta:</span>
                            <span>2</span>
                        </div>
                        <div class="checkout--footer">
                            <label class="price"><sup>SUB Total</sup> ${disponivel - usados}</label>
                        <button class="Btn" onclick='cardItem(${pharma[0]})' type="button">
                            <div class="sign">
                                <svg class="icon" viewBox="0 0 1024 1024" version="1.1"
                                    xmlns="http://www.w3.org/2000/svg" width="20" height="20">
                                    <path
                                        d="M603.733333 181.333333L386.133333 401.066667c-6.4 6.4-10.666667 14.933333-12.8 25.6l-51.2 211.2c-8.533333 38.4 23.466667 74.666667 61.866667 64l200.533333-53.333334c8.533333-2.133333 17.066667-6.4 23.466667-14.933333l234.666667-236.8V853.333333c0 40.533333-32 72.533333-70.4 74.666667H170.666667c-40.533333 0-74.666667-34.133333-74.666667-74.666667V256c0-40.533333 34.133333-74.666667 74.666667-74.666667h433.066666z"
                                        fill="#ffffff"></path>
                                    <path
                                        d="M738.133333 147.2L435.2 448c-4.266667 4.266667-6.4 8.533333-8.533333 14.933333l-32 125.866667c-6.4 23.466667 14.933333 44.8 38.4 38.4l128-29.866667c6.4-2.133333 10.666667-4.266667 14.933333-8.533333l300.8-302.933333c38.4-38.4 38.4-102.4 0-140.8s-100.266667-38.4-138.666667 2.133333z"
                                        fill="#ffffff"></path>
                                </svg>
                            </div>

                            <div class="comment">
                                Edit
                            </div>
                        </button>
                        </div>
                    </div>
                </div>
            `
            ul3.appendChild(li);

            let usadoL = e.lote.map(l => [l[0][0], l[1]])

            const itensLote = document.getElementById(`${pharma[0]}`)
            itensLote.innerHTML = ''
            stock.forEach(s => { if (usadoL.find(e => e[0] === s[3])[1] != 0) { itensLote.innerHTML += `<span>${s[0]} | ${s[2]}</span><span>${usadoL.find(e => e[0] === s[3])[1]} / ${s[1]}</span>` } })
            const itensSemana = document.getElementById(`${pharma[1]}`)
            itensSemana.innerHTML = ''

            diasSemana.forEach((dia, i) => { if (e.semana[i] != 0) { itensSemana.innerHTML += `<span>${dia}</span><span>${e.semana[i]}</span>` } })
        });
    }
}

document.getElementById("enviarP").addEventListener("submit", function (event) {
    event.preventDefault();

    if (!(localStorage.getItem("controleLotesDB") || []).length) {
        alert('Tente adicionar um item primeiro.')
        return
    }
    postsave();

    this.submit();
});

function postsave() {
    ativarLoad()
    postItens.value = localStorage.getItem("controleLotesDB") || []
}

if (msgError) {
    document.getElementById('toggler-1').checked = msgError == 1
    if (msgError == 1) { limparPage() }
    document.getElementsByClassName('resultado')[0].style.display = 'flex'
}

// referente a semana

const formSemana = document.getElementsByClassName('form-container')[0]
const inpLock = document.getElementById('inpLock')
const semana = document.querySelectorAll('.semana')
inpLock.addEventListener('input', () => {
    if (inpLock.checked) {
        semana.forEach(s => s.style.display = 'block')
        formSemana.style.display = 'none'
        diasSemana = diasSemana.filter(e => diasSemana.indexOf(e) + 1 <= datenow.getDay())
    } else {
        semana.forEach(s => s.style.display = 'none')
        formSemana.style.display = 'flex'
        diasSemana = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"]
    }
    const ativo = !inpLock.checked;

    alternarObrigatoriedade(ativo);
})

const inputAno = document.getElementById("inputAno");
const selectMes = document.getElementById("selectMes");
const selectSemana = document.getElementById("selectSemana");

// inicia com o ano atual
const anoAtual = new Date().getFullYear();
inputAno.value = anoAtual;

inputAno.addEventListener("change", atualizar);
selectMes.addEventListener("change", atualizar);

function atualizar() {
    const ano = Number(inputAno.value);
    const mes = Number(selectMes.value);

    if (!ano || !mes) {
        selectSemana.innerHTML = `<option value="">Selecione a semana</option>`;
        selectSemana.disabled = true;
        return;
    }

    gerarSemanas(mes, ano);
}

function gerarSemanas(mes, ano) {
    selectSemana.innerHTML = `<option value="">Selecione a semana</option>`;
    selectSemana.disabled = false;

    const primeiroDiaMes = new Date(ano, mes - 1, 1);
    const ultimoDiaMes = new Date(ano, mes, 0);

    let data = new Date(primeiroDiaMes);

    // primeira segunda-feira
    while (data.getDay() !== 1) {
        data.setDate(data.getDate() + 1);
    }

    while (data <= ultimoDiaMes) {
        const segunda = new Date(data);
        const sexta = new Date(data);
        sexta.setDate(segunda.getDate() + 4);

        if (sexta.getMonth() !== mes - 1) break;

        const option = document.createElement("option");
        option.value = [formatar(segunda), formatar(sexta)];
        option.textContent = `${formatar(segunda)} a ${formatar(sexta)}`;

        selectSemana.appendChild(option);

        data.setDate(data.getDate() + 7);
    }
}

function formatar(data) {
    const d = String(data.getDate()).padStart(2, "0");
    const m = String(data.getMonth() + 1).padStart(2, "0");
    const a = data.getFullYear();
    return `${d}/${m}/${a}`;
}

window.addEventListener("DOMContentLoaded", () => {
    const inputInicio = document.getElementById("dataInicio");
    const inputFim = document.getElementById("dataFim");

    const hoje = new Date();

    // getDay(): 0 = domingo, 1 = segunda, ..., 6 = sábado
    const diaSemana = hoje.getDay();

    // calcula segunda-feira
    const segunda = new Date(hoje);
    const diffSegunda = diaSemana === 0 ? -6 : 1 - diaSemana;
    segunda.setDate(hoje.getDate() + diffSegunda);

    // calcula sexta-feira
    const sexta = new Date(segunda);
    sexta.setDate(segunda.getDate() + 4);

    inputInicio.value = formatarISO(segunda);
    inputFim.value = formatarISO(sexta);
});

function formatarISO(data) {
    return data.toISOString().split("T")[0];
}

function alternarObrigatoriedade(ativo) {
    inputAno.required = ativo;
    selectMes.required = ativo;
    selectSemana.required = ativo;

    // UX extra: habilita/desabilita semana
    selectSemana.disabled = ativo;

    // opcional: limpa campos ao desativar
    if (!ativo) {
        // inputAno.value = "";
        selectMes.value = "";
        selectSemana.innerHTML = `<option value="">Selecione a semana</option>`;
    }
}