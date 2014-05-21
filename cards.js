module.exports = function () {

	require('./jsexpansion');

	var cards = [];

	(4).times(function(color) {
		(13).times(function(value) {
			cards.push({color: color, value: value+2});
		});
	});

	// jollyk
	cards.push({color: 4, value: 15},{color: 4, value: 15},{color: 4, value: 15});
	return cards;
}();