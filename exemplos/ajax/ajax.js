function TesteAjax() {}

TesteAjax.prototype.enviaNome = function() {
	var nome = $('#umFomr').find('input#nome').val();
	$.ajax({
		url: '/teste/envia_nome',
		data: {nome: 'marcio'}
	});
	$('#resultado').html('Nome enviado com sucesso.');
}