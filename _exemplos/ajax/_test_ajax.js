//POST formulario

module('Teste envio de dados de um formulario via ajax');

test('Teste dependencias', function(){
	ok($, 'jQuery foi carregado');
});

test('Envio do campo "nome" por ajax', function() {
	var testeAjax = new TesteAjax();
	
	fnMock = new Chameleon($.fn);
	fnMock.expects('find').withArguments('input#nome').andReturn($.fn);
	fnMock.expects('val').andReturn('marcio');
	
	$mock = new Chameleon($);
	$mock.expects('ajax').withArguments({
		url:'/teste/nome',
		data: {nome: 'marcio'},
		success: function(){
			$('#resultado').html('Nome enviado com sucesso');
		}
	});
	
	testeAjax.enviaNome();
	
	fnMock.verify();
	fnMock.reset();
	
	$mock.verify();
	$mock.reset();
});