define(["socket.io"], function (io) {
	
	var socket;
	var connectToServer = function(url){
		socket = io.connect(url);
	};
	var registerSignal = function(signal, cb){
		socket.on(signal, cb);
	};
	var sendData = function(signal, data){
		if(socket==null) return null;
		socket.emit(signal, data);
		return true;
	};

	return {
		connectToServer: connectToServer,
		registerSignal: registerSignal,
		sendData: sendData
	};
	
});