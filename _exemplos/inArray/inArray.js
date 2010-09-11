function inArray(arr, item) {
	for (var i=0; i < arr.length; i++) {
		if (item === arr[i]) {
			return i;
		}
	}
	return -1;
}