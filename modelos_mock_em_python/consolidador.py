from presidenciais.models import Partido as PresidenciaisPartido
from consolidacao.models import Partido

def atualiza_partidos():
    presidenciais_partidos = PresidenciaisPartido.objects.all()
    for presidenciais_partido in presidenciais_partidos:
        Partido.objects.get_or_create(sigla=presidenciais_partido.sigla, coligacao=presidenciais_partido.coligacao.nome)
