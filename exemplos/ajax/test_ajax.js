module('Enviando um nome via AJAX', {
	setup: function() {
		$('#qunit-fixture').append('<div id="resultado"></div>');
	},
	tearDown: function() {
		//tearDown
	}
});

test('test_nome_marcio_deve_ser_enviado_via_ajax', function() {
	testeAjax = new TesteAjax();
	
	$mock = new Chameleon($);
	$fnMock = new Chameleon($.fn);
	
	$fnMock.expects('find').withArguments('input#nome').andReturn($.fn);
	$fnMock.expects('val').andReturn('marcio');
	
	$mock.expects('ajax').withArguments({
		url: '/teste/envia_nome',
		data: {nome: 'marcio'}
	});
	
	testeAjax.enviaNome();
	
	equals($('#resultado').html(), 'Nome enviado com sucesso.', 'Deve enviar o nome marcio com sucesso');
	
	$mock.verify();
	$mock.reset();
	
	$fnMock.verify();
	$fnMock.reset();
});
