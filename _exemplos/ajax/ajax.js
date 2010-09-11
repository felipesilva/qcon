function TesteAjax() {}

TesteAjax.prototype.enviaNome = function() {
	$.ajax({
		url: '/teste/envia_nome'
	});
	$('#resultado').html('Nome enviado com sucesso.');
}