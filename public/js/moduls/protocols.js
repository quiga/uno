define([], function () {
	
	var Player = function(obj, index){
		obj.card = 0;
		obj.active = false;
		obj.dignity = "";
		obj.order = index;
		obj.tribute = 0;
		obj.isTributeHigh = function(num){
			return this.order < num;
		};
		obj.isTributeLow = function(num){
			return this.order >= num;	
		};
		obj.isTributeAd = function(){
			return this.order == 0;
		};
		obj.toLowerCardsNum = function(num){
			if(this.card - num >= 0)
				this.card -= num;
		};
		obj.setCardNums = function(num){
			this.card = num;
		};
		obj.getHtmlClass = function(){
			if(this.order < 2) return "player-left-" + this.order;
			else if(this.order < 10) return "player-center-" + this.order;
			else return "player-right-" + this.order;
		};
		return obj;
	};

	var CardGroup = function(){
		var colors = [];
		var values = [];
		var isLargestCard = function(){
			var magas = true;
			for (var i = 0; i < values.length; i++) {
				if(values[i] != 15 && values[i] != 2){
					magas = false;
					break;
				}
			};
			return magas;
		};
		return {
			values: values,
			colors: colors,
			isActive: false,
			isLargestCard: isLargestCard
		};
	};

	return {
		Player: Player,
		CardGroup: CardGroup
	};
});