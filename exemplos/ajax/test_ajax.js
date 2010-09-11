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
	
	$mock.expects('ajax').withArguments({
		url: '/teste/envia_nome'
	});
	
	testeAjax.enviaNome();
	
	equals($('#resultado').html(), 'Nome enviado com sucesso.', 'Deve enviar o nome marcio com sucesso');
	
	$mock.verify();
	$mock.reset();
});
