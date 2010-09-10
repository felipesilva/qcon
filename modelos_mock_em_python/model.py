
class Candidato(models.Model):
    #método testado:
    def obter_percentual_decimal(self):
        total = float(sum([int(c.votos) for c in Candidato.objects.filter(cargo=self.cargo, abrangencia=self.abrangencia)]))
        numero = (self.votos * 100) / total
        return float(numero)
