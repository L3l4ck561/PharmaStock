from datetime import datetime

def validade(val):
    agora = datetime.now()
    val = datetime.strptime(val, "%Y-%m-%d")
    #val = datetime.strptime(val, "%Y-%m-%d %H:%M:%S")
    return 1 if datetime.now() > val else 0

print(validade('2027-01-04'))