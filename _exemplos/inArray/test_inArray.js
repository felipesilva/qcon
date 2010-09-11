/*Dado um array, preciso verificar a presenca de um valor. 
Caso negativo, deve me retornar -1, caso positivo deve me retornar o indice.*/

module('Teste inArray');

test('Item nao existe no array', function(){
	var arr = ['felipe', 'marcio', 'qcon'];
	
	equals( inArray(arr, 'silva'), -1, 'O item "silva", nao esta presente no array.' );
});

test('Item encontrado no array retorna indice', function(){
	var arr = ['felipe', 'marcio', 'qcon'];
	
	equals( inArray(arr, 'marcio'), 1, 'O item "marcio", esta presente no array e tem indice 1.' );
});

