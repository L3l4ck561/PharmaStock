from flask import Flask, render_template, request, redirect, url_for, make_response, jsonify, session, flash
import resources.database_connection as database_connection
from functools import wraps
from werkzeug.security import generate_password_hash, check_password_hash

# Carrega a função para consulta do banco de dados 
conectBD = database_connection.consultaBD

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

        if f'{edit}' == '0':
            if idPharma == '':
                valor = [cor,nome,tipo,alertQuant]
                idPharma = conectBD('INSERT INTO pharma (cor,nome,tipo,quantAlert) VALUES (%s,%s,%s,%s);',3,valor)

            valor = [idPharma,quant,lote,unid,fornecedor,Validade,obs]
            conectBD('INSERT INTO stock (id_pharma,quant,lote,unid,fornecedor,validade,obs) VALUES (%s,%s,%s,%s,%s,%s,%s);',0,valor)
        else:
            conectBD(f'UPDATE pharma SET cor="{cor}",nome="{nome}",tipo="{tipo}", quantAlert = {alertQuant}  WHERE id = {idPharma};')

    return redirect(url_for("home"))

@app.route("/control", methods=["GET", "POST"])
@login_required
def control():
    user = session['usuario']
    if request.method == "POST":
        return redirect(url_for("control"))

    return render_template("control.html",user=user)

@app.route("/get-stock", methods=["GET", "POST"])
@login_required
def getStock():
    stock = conectBD(f'SELECT id,id_pharma,quant,lote,unid,fornecedor,validade,obs FROM stock WHERE ativo = 1;',2)
    return jsonify(stock)

@app.route("/get-pharma", methods=["GET", "POST"])
@login_required
def getPharma():
    pharmas = conectBD(f"SELECT id,cor, nome, tipo, quantAlert FROM pharma WHERE ativo = 1;",2)
    return jsonify(pharmas)

if __name__ == '__main__':
    app.run(debug=True) 