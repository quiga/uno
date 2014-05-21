define([], function () {

// Returns the index of given object in the array of objects. Otherwise -1
Array.prototype.MindexOfObjectWithCustomEquals = function (obj, eq) {

	eq = eq || function(a,b){
		var it = true;
		for (var prop in b) {
			if (a[prop] != b[prop]) {
				it = false;
				break;
			}
		}
		for (var prop in a) {
			if (a[prop] != b[prop]) {
				it = false;
				break;
			}
		}
		if (it) return true;
		return false;
	}

	for (var i = this.length - 1; i >= 0; i--) {
		if( eq(obj, this[i]) ) 
			return i;
	};
	return -1;
};

Array.prototype.MgetObjectWithCustomEquals = function (obj, eq) {

	eq = eq || function(a,b){
		var it = true;
		for (var prop in b) {
			if (a[prop] != b[prop]) {
				it = false;
				break;
			}
		}
		for (var prop in a) {
			if (a[prop] != b[prop]) {
				it = false;
				break;
			}
		}
		if (it) return true;
		return false;
	}

	for (var i = this.length - 1; i >= 0; i--) {
		if( eq(obj, this[i]) ) 
			return this[i];
	};
	return null;
};


// Returns the first value of the Array. If the array is empty, it will be undefinded.
Array.prototype.Mfirst = function () {
	return this[0];
};


// Returns the last value of the Array. If the array is empty, it will be undefinded.
Array.prototype.Mlast = function () {
	if (this.length === 0) {return undefined;};
	return this[this.length-1];
};

});