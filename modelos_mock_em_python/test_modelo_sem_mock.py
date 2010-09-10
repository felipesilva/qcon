class Candidato(models.Candidato):
    def __init__(self, votos):
        self.nome = 'Candidato 1'
	self.votos = votos
	self.cargo = 'presidente'
	self.turno = 1
	self.abrangencia = 'BR'

    class Meta:
	abstract = True

    class objects:
	@classmethod
	def filter(cls, cargo, abrangencia):
	    class ComVotos:
		def __init__(self, votos):
		    self.votos = votos
	    assert cargo == 'presidente'
	    assert abrangencia == 'BR'
	    return [ComVotos(234788), ComVotos(382606), ComVotos(382606)]

def test_obter_percentual_de_voto():
    old_candidato = models.Candidato
    models.Candidato = Candidato

    candidato = models.Candidato(234788)
    percentual = candidato.obter_percentual_decimal()

    assert percentual == 23.48, percentual
    models.Candidato = old_candidato
