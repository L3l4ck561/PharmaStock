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

        let lista = [control[4][1], (control[5] - control[7]), control[7], control[6], control[8], ((control[5] - control[7]) - control[8] + control[7])]

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
        box[0].innerHTML = `
            <div class="farmaco-card ${p[7][1] - p[7][0] == 0 ? 'desligado' : ''}">
                <h3 class="nome-farmaco ${p[7][1] - p[7][0] == 0 ? 'estoque-desligado' : ''}">${p[2]} | <span class="quantidade ${baixa}">${p[7][0]} / ${p[7][1]} unid.</span></h3>
                <div class="lotes" id="lote${p[0]}"></div>
            </div>
        `

        const lote_box = document.getElementById(`lote${p[0]}`)
        lote_box.innerHTML=''
        lotes.forEach(l => {
            baixa = l[2]-l[6]==0? 'estoque-critico':l[2]-l[6]<=l[2]/3? 'estoque-baixo':'estoque-alto'
            lote_box.innerHTML+=`
                <div class="lote-item-box">
                    <div class="lote-item">
                        <span class="lote-numero">${l[3]}</span>
                        <span class="validade">Validade: ${l[4]}</span>
                        <span class="quantidade ${baixa}">${l[6]} / ${l[2]} unid.</span>
                    </div>
                    <div class="lote-item-obs" style="display:none"></div>
                </div>
            `
        })
    })
}
farmacos()