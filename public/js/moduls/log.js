define([], function () {
	var ERROR = 1;
	var SIGNAL = 2;
	var TEST = 3;
	var INFO = 4;
	var ALL = 5;
	
	var levelSzint = SIGNAL;

	var log = function(data, level){
		var level = level || INFO;
		if(level <= levelSzint)
			console.log(data);
	};
	return log;
});