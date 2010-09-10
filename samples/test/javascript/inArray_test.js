//Verificar valor em um array, caso positivo retornar indice, caso negativo retornar -1

module("testes inArray");
test('Retorna indice do valor passado.', function() {
	var arr = ['felipe', 'marcio', 'qcon'];

	equals( inArray(arr, 'marcio'), 1, 'A string "marcio" esta no indice 1' );
});
