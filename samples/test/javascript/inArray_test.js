//Verificar valor em um array, caso positivo retornar indice, caso negativo retornar -1

module("testes inArray");
test('Retorna indice do valor passado.', function() {
	var arr = ['felipe', 'marcio', 'qcon'];

	equals( inArray(arr, 'marcio'), 1, 'A string "marcio" esta no indice 1' );
});

test('Retorna -1 casso valor passado não esteja no array.', function() {
	var arr = ['felipe', 'marcio', 'qcon'];

	equals( inArray(arr, 'hanoi'), -1, 'A string "hanoi" nao esta no array' );
});

