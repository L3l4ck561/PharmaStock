from flask import Flask, render_template, request, redirect, url_for, make_response, jsonify, session, flash
import resources.database_connection as database_connection
from functools import wraps
from werkzeug.security import generate_password_hash, check_password_hash
import ast,json
from datetime import date, timedelta,datetime
from functools import reduce

# Carrega a função para consulta do banco de dados 
conectBD = database_connection.consultaBD

# funções de tempo
def semana_atual_seg_sex():
    hoje = date.today()
    dia_semana = hoje.weekday()
    segunda = hoje - timedelta(days=dia_semana)
    sexta = segunda + timedelta(days=4)
    return [segunda, sexta]

def validade(val):
    return True if date.today() > val else False

def serializar(obj):
    if isinstance(obj, (date, datetime)):
        return obj.isoformat()
    return obj

# configurando flask
app = Flask(__name__)
app.secret_key = "uma_chave_secreta_qualquer_tipo_1234567890_ou_sls_vc_q_decide_mas_acho_bom_tirar_a_roupa_do_varal_antes_da_chuva_chegar_slk"

# Decorator para proteger rotas
def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if 'usuario' not in session:
            flash(["Faça login primeiro!",'login'])
            return redirect(url_for('auth'))
        return f(*args, **kwargs)
    return decorated

@app.route("/", methods=["GET", "POST"])
def auth():
    if "usuario" in session:
        return redirect(url_for("home"))

    if request.method == "POST":
        email = request.form['email']
        senha = request.form['password']
        nome = request.form['nome']
        senhaConf = request.form['confirmPassword']

        if nome or senhaConf:
            if senhaConf != senha:
                flash(["As senhas precisam ser iguais.",'login'])
                return redirect(url_for("auth"))
            
            hashed_password = generate_password_hash(senha)
            conectBD(f'INSERT INTO users (nome,senha,email) VALUES ("{nome}","{hashed_password}","{email}");')
            
        user = conectBD(f'SELECT id,nome,email,senha FROM users WHERE ativo=1 AND email="{email}";',1)

        if user and check_password_hash(user[3], senha):
            session.permanent = True
            session['usuario'] = [user[1],user[2],user[0]]
            resp = make_response(redirect(url_for("home")))
            return resp

        flash(["Usuário ou senha incorretos.",'login'])
        return redirect(url_for('auth'))

    return render_template("login.html")

@app.route("/logout")
@login_required
def logout():
    session.clear()
    resp = make_response(redirect(url_for("auth")))
    flash(["Você saiu.",'login'])
    return resp

@app.route("/home", methods=["GET", "POST"])
@login_required
def home():
    user = session['usuario']
    if request.method == "POST":
        email = request.form['email']
        senha = request.form['password']
        nome = request.form['nome']
        senhaConf = request.form['confirmPassword']

        hashed_password = False
        if senha !='' or senhaConf != '':
            if senhaConf != senha:
                flash(["As senhas precisam ser iguais.",'loginEdit'])
                return redirect(url_for("auth"))
        
            hashed_password = generate_password_hash(senha)
        
        if hashed_password:
            conectBD(f'UPDATE users SET nome="{nome}", email="{email}", senha="{hashed_password}" WHERE id={user[2]};')
        else:
            conectBD(f'UPDATE users SET nome="{nome}", email="{email}" WHERE id={user[2]};')

        user = conectBD(f'SELECT id,nome,email,senha FROM users WHERE id = {user[2]};',1)
        session['usuario'] = [user[1],user[2],user[0]]
        flash(["Auterações salvas com sucesso!.",'loginEdit2'])
        return redirect(url_for("home"))
            

    return render_template("index.html",user=user)

@app.route("/register", methods=["GET", "POST"])
@login_required
def register():
    if request.method == "POST":
        edit = request.form['edit']
        idPharma = request.form['idPharma']
        cor = request.form['cor']
        nome = request.form['nome']
        tipo = request.form['tipo']
        quant = request.form['quant']
        alertQuant = request.form['alertQuant']
        lote = request.form['lote']
        unid = request.form['unid']
        fornecedor = request.form['fornecedor']
        Validade = request.form['Validade']
        obs = request.form['obs']
        recebido = request.form['recebido']

        if f'{edit}' == '0':
            if idPharma == '':
                valor = [cor,nome,tipo,alertQuant]
                idPharma = conectBD('INSERT INTO pharma (cor,nome,tipo,quantAlert) VALUES (%s,%s,%s,%s);',3,valor)

            valor = [idPharma,quant,lote,unid,fornecedor,Validade,obs,recebido]
            conectBD('INSERT INTO stock (id_pharma,quant,lote,unid,fornecedor,validade,obs,recebido) VALUES (%s,%s,%s,%s,%s,%s,%s,%s);',0,valor)
        else:
            conectBD(f'UPDATE pharma SET cor="{cor}",nome="{nome}",tipo="{tipo}", quantAlert = {alertQuant}  WHERE id = {idPharma};')

    return redirect(url_for("home"))

@app.route("/control", methods=["GET", "POST"])
@login_required
def control():
    user = session['usuario']
    if request.method == "POST":
        dados = request.form['dados']
        lista = lista = ast.literal_eval(dados)

        estado = request.form.get('inpLock')
        if not estado: # para data editada
            semana = request.form['opsemana']
            inicio, fim = semana.split(",")
        else:
            inicio, fim = semana_atual_seg_sex()

        for e in lista:
            #data de criação do pedido
            dt = datetime.strptime(e['data'], "%d/%m/%Y, %H:%M:%S")

            #dias que foram usados na semana
            diasSemana = [0,0,0,0,0]
            for i, valor in enumerate(e["semana"]):
                diasSemana[i] += valor

            #conta quantos vencerão na semana
            totalVencidos = reduce(lambda a,b: a+b,list(map(lambda x:x[0],conectBD('SELECT quant FROM stock WHERE validade <= %s - INTERVAL 1 DAY;',2,[fim])))) - reduce(lambda a,b: a+b,diasSemana)

            #total disponivel
            totalDisponivel = reduce(lambda a,b: a+b,list(map(lambda x:x[0],conectBD('SELECT quant FROM stock WHERE id_pharma=%s AND validade <= %s + INTERVAL 1 DAY;',2,(e['id_pharma'],fim)))))

            #total recebido na semana
            totalRecebido = reduce(lambda a,b: a+b,list(map(lambda x:x,conectBD("SELECT quant FROM stock WHERE recebido BETWEEN %s - INTERVAL 1 DAY AND %s + INTERVAL 1 DAY;",1,(inicio,fim)))))
            
            #total usado na semana
            totalUsados = reduce(lambda a,b: a+b,diasSemana)

            #resultado
            valor = (json.dumps(diasSemana),inicio,fim,e['id_pharma'],totalDisponivel,totalVencidos,totalRecebido,totalUsados)

            existe = conectBD('SELECT id,dia FROM control WHERE id_pharma=%s AND seg = %s AND sex = %s;',1,(e['id_pharma'],inicio,fim))
            if existe: #verifica se está criando ou atualizando

                dias = json.loads(existe[1])
                for i, valor in enumerate(dias):
                   diasSemana[i] += valor

                totalVencidos = reduce(lambda a,b: a+b,list(map(lambda x:x[0],conectBD('SELECT quant FROM stock WHERE validade <= %s - INTERVAL 1 DAY;',2,[fim])))) - reduce(lambda a,b: a+b,diasSemana)
                totalUsados = reduce(lambda a,b: a+b,diasSemana)
                
                conectBD('UPDATE control SET dia=%s,totalDisponivel=%s,totalPrazo=%s,totalRecebidos=%s,totalUsados=%s WHERE id=%s;',0,(json.dumps(diasSemana),totalDisponivel,totalVencidos,totalRecebido,totalUsados,existe[0]))
            else:
                conectBD('INSERT INTO control (dia,seg,sex,id_pharma,totalDisponivel,totalPrazo,totalRecebidos,totalUsados) VALUES (%s,%s,%s,%s,%s,%s,%s,%s);',0,valor)

            for lote in e['lote']: # salva a quantidade usada de cada lote no dia
                conectBD('INSERT INTO saida (id_stock,usados,criado,semana) VALUES (%s,%s,%s,%s);',0,(lote[0][0],lote[1],dt,fim))

        flash([1,'msgError'])
        return redirect(url_for("control"))

    return render_template("control.html",user=user)

@app.route("/relatorio", methods=["GET", "POST"])
@login_required
def report():
    control = conectBD('SELECT * FROM control WHERE ativo = 1;',2)
    
    semanas = list(map(lambda x: [x[4],x[2],x[3]],control))
    control = [list(x) for x in control]
    for i, valor in enumerate(control): control[i][4] = [valor[4],conectBD(f'SELECT nome FROM pharma WHERE id={valor[4]}',1)[0]]
    
    agrupado = {}
    for id_, segunda, sexta in semanas:
        chave = (segunda, sexta)
    
        if chave not in agrupado:
            agrupado[chave] = []
    
        agrupado[chave].append(id_)

    semanas = [
        [ids, segunda, sexta]
        for (segunda, sexta), ids in agrupado.items()
    ]






    #preparando os lotes
    stock = conectBD(f'SELECT id,id_pharma,quant,lote,validade,obs FROM stock WHERE ativo = 1;',2)
    stock = [list(x) for x in stock]
    for i,e in enumerate(stock):
        lotes = conectBD('SELECT usados FROM saida WHERE id_stock = %s;',2,[e[0]])
        stock[i].append(reduce(lambda a,b: a+b,list(map(lambda x: x[0],lotes))) if lotes else 0) # usados por lote
    #stock = list(filter(lambda x: x[2]-x[6]!=0,stock))

    #construindo o titulo
    pharma = conectBD('SELECT * FROM pharma WHERE ativo=1;',2)
    pharma = [list(x) for x in pharma]
    for i,p in enumerate(pharma):
        Plotes = [ [x[6],x[2]] for x in stock if x[1]==p[0] ]
        usados = reduce(lambda a,b: a+b,list(map(lambda x:x[0],Plotes))) if len(Plotes) else 0
        disponivel = reduce(lambda a,b: a+b,list(map(lambda x:x[1],Plotes))) if len(Plotes) else 0
        pharma[i].append([usados,disponivel])




    control = json.dumps(control, default=serializar)
    pharma = json.dumps(pharma, default=serializar)
    stock = json.dumps(stock, default=serializar)
    return render_template("report.html",control = control,semanas=semanas, stock=stock,pharma=pharma)

@app.route("/get-stock", methods=["GET", "POST"])
@login_required
def getStock():
    stock = conectBD(f'SELECT id,id_pharma,quant,lote,unid,fornecedor,validade,obs FROM stock WHERE ativo = 1;',2)
    stock = [list(x) for x in stock]

    for i,e in enumerate(stock):
        if validade(e[6]):
            stock[i][2]=0
        else:
            lotes = conectBD('SELECT usados FROM saida WHERE id_stock = %s;',2,[e[0]])
            usados = reduce(lambda a,b: a+b,list(map(lambda x: x[0],lotes))) if lotes else 0
            stock[i][2]= e[2]-usados

    stock=list(filter(lambda i: i[2]!=0,stock))

    return jsonify(stock)

@app.route("/get-pharma", methods=["GET", "POST"])
@login_required
def getPharma():
    pharmas = conectBD(f"SELECT id,cor, nome, tipo, quantAlert FROM pharma WHERE ativo = 1;",2)
    return jsonify(pharmas)

if __name__ == '__main__':
    app.run(debug=True) 