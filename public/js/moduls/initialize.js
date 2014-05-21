define(["jquery", "ko"], function ($, ko) {
	/*
	*	saját bindingHandler-ek létrehozása, vissza nem ad semmit sem
	*/
	var switchColor = function(color){
		switch(color){
			case 0: return "treff-";
			case 1: return "karo-";
			case 2: return "kor-";
			case 3: return "pikk-";
		};
		return "";
	};

	var switchValue = function(value){
		switch(value){
			case 2:
			case 3:
			case 4:
			case 5:
			case 6:
			case 7:
			case 8:
			case 9:
			case 10: return value;
			case 11: return "J";
			case 12: return "Q";
			case 13: return "K";
			case 14: return "asz";
			case 15: return "joker";
		};
		return 0;
	};

    ko.bindingHandlers.cardBindings = {
        init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        	var card = valueAccessor(), allBindings = allBindingsAccessor();             
        	var cardIndex = ko.utils.unwrapObservable( allBindings.cardIndex );
        	var eltolas =  -1 * cardIndex * 100;
        	var theCard = "card-" + switchColor(card.color) + switchValue(card.value);

        	$(element).attr({class: theCard});
          	$(element).css("left", cardIndex * 50);	
			$(element).bind('contextmenu', function(event){
     			return false;
			});
        	$(element).click(function(event){
           		card.isSelected = !card.isSelected;
				var osztaly = $(element).attr('class');

        		if(card.isSelected){
	       			osztaly = "selected-" + osztaly;
        		}
        		else{
        			var splitted = osztaly.split("-");
        			if(splitted[0]==="selected"){
	        			splitted.splice(0,1);
        				osztaly = splitted.join("-");
        			}
        		}
        		$(element).attr({class: osztaly});
        	});
   
     		if(card.isSelected){
        		$(element).addClass("selected");
        	}
        },
        update: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        	var card = valueAccessor();
         	if(card.isSelected)	$(element).addClass("selected");
    	}
    };

    ko.bindingHandlers.cardsDepositedBindings = {
        init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
			var card = valueAccessor(), allBindings = allBindingsAccessor();       
        	var cardIndex = ko.utils.unwrapObservable( allBindings.cardIndex );
			
			if(typeof card != "undefined"){
			var cardCount =  card.values.length;
			
			for(var i=cardCount-1;i>=0;i--){
				var theCard = "de-card-" + switchColor(card.colors[i]) + switchValue(card.values[i]);
				var elem = $(document.createElement('span'));
					elem.attr({
						class: (theCard + "_" + (cardCount - i - 1))
					});
				$(element).append(elem);
			}
		}
        },
        update: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        }
    };




});
