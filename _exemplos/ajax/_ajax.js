function TesteAjax() {
	
}

TesteAjax.prototype.enviaNome = function() {
	var self = this;
	var nome = $('#qunit-fixtures').find('input#nome').val();
	
	$.ajax({
		url: '/teste/nome',
		data: {nome: nome},
		success: function(){
			$('#resultado').html('Nome enviado com sucesso');
		}
	});
}