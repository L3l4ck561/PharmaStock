const BTNtitle = document.querySelectorAll('.title')
const content = document.querySelectorAll('.content')
const chec = document.querySelectorAll('.chec')
const container = document.querySelectorAll('.container')

BTNtitle.forEach((e, i) => e.addEventListener('click', () => {
    content.forEach(e => { e.style.height = '0', e.style.overflowY = 'hidden' })

    if (chec[i].checked) {
        content[i].style.height = '0';
        content[i].style.overflowY = 'hidden'
        chec[i].checked = false
    } else {
        content[i].style.height = '450PX';
        content[i].style.overflowY = 'auto'
        chec.forEach(e => e.checked = false)
        chec[i].checked = true
    }
}));

function semanal(seg, sex, id) {
    bilder(1)
    const [ano, mes, dia] = seg.split("-");
    document.getElementById('seg').textContent = `${dia}/${mes}/${ano}`
    const [ano2, mes2, dia2] = sex.split("-");
    document.getElementById('sex').textContent = `${dia2}/${mes2}/${ano2}`
    const tbody = document.querySelector("#tabela tbody");
    tbody.innerHTML = ''
    id.forEach(i => {
        const control = bdControl.find(e => e[4][0] === i)
        console.log(control)
        let lista = [control[4][1], control[5], control[7], control[6], control[8],  (control[5]+control[7])-(control[6]+control[8])]

        const tr = document.createElement("tr");
        lista.forEach(item => {
            const td = document.createElement("td");
            td.textContent = item;
            tr.appendChild(td);
            tbody.appendChild(tr);
        });
    })
}

function bilder(i) {
    container.forEach(e => e.style.display = 'none')
    container[i].style.display = 'flex'
}

const box = document.querySelectorAll('.lista-farmacos')
const farmacos = () => {

    bdPharma.forEach(p => {
        let baixa = p[7][1] - p[7][0] == 0 ? 'estoque-desligado' : p[7][1] - p[7][0] <= p[4] ? 'estoque-baixo' : 'estoque-alto'
        lotes = bdStock.filter(x => x[1] == p[0])
        box[0].innerHTML += `
            <div class="farmaco-card ${p[7][1] - p[7][0] == 0 ? 'desligado' : ''}">
                <div class="nome-farmaco ${p[7][1] - p[7][0] == 0 ? 'estoque-desligado' : ''}">
                <div class="boxCor" style="background-color:${p[1]}"></div>
                <h3 style="flex:3">${p[2]}</h3>
                <span class="quantidade ${baixa}">${p[7][0]} / ${p[7][1]} unid.</span>
                </div>
                <div class="lotes" id="lote${p[0]}"></div>
            </div>
        `

        const lote_box = document.getElementById(`lote${p[0]}`)
        lote_box.innerHTML = ''
        lotes.forEach(l => {
            baixa = l[2] - l[6] == 0 ? 'estoque-critico' : l[2] - l[6] <= l[2] / 3 ? 'estoque-baixo' : 'estoque-alto'

            const [ano, mes, dia] = l[4].split('-');

            lote_box.innerHTML += `
                <div class="lote-item-box ${verificarPrazo(l[4])}">
                    <div class="lote-item">
                        <span class="lote-numero">${l[3]}</span>
                        <span class="validade">Validade: ${dia}/${mes}/${ano}</span>
                        <span class="quantidade ${baixa}">${l[6]} / ${l[2]} unid.</span>
                    </div>
                    <div class="lote-item-obs" style="display:none"></div>
                </div>
            `
        })
    })
}

farmacos()
function verificarPrazo(dataAlvo) {
    // dataAlvo no formato 'yyyy-mm-dd'
    const [ano, mes, dia] = dataAlvo.split('-');
    const data = new Date(ano, mes - 1, dia); // mês começa em 0

    // pega a data atual sem hora (só ano, mês, dia)
    const hoje = new Date();
    const hojeSemHora = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());

    // diferença em dias
    const diffTempo = data - hojeSemHora; // em milissegundos
    const diffDias = Math.ceil(diffTempo / (1000 * 60 * 60 * 24));

    if (diffDias < 0) {
        return 'vencido';
    } else if (diffDias <= 7) { // perto do prazo se faltar até 7 dias
        return 'vencimento-proximo';
    } else {
        return '';
    }
}
verificarPrazo('2026-01-13')