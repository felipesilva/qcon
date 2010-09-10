from mox import Mox

import consolidador

class PartidoMock():
    def __init__(self, sigla, coligacao):
        self.sigla = sigla
        self.coligacao = coligacao

def test_consolidador_cria_partidos_caso_nao_existam():
    mox = Mox()
    mox.StubOutWithMock(consolidador, 'PresidenciaisPartido')
    mox.StubOutWithMock(consolidador, 'Partido')

    partidos = [PartidoMock('P1', ColigacaoMock('Coligacao 1')), PartidoMock('P1', ColigacaoMock('Coligacao 1')), PartidoMock('P1', ColigacaoMock('Coligacao 1'))]
    consolidador.PresidenciaisPartido.objects = mox.CreateMockAnything()
    consolidador.PresidenciaisPartido.objects.all().AndReturn(partidos)

    consolidador.Partido.objects = mox.CreateMockAnything()
    for partido in partidos:
        consolidador.Partido.objects.get_or_create(sigla=partido.sigla, coligacao=partido.coligacao.nome).AndReturn(partido)

    mox.ReplayAll()
    try:
        consolidador.atualiza_partidos()
    finally:
        mox.VerifyAll()
        mox.UnsetStubs()
