define(["jquery", "connection", "model", "protocols"], 
	function ($, bridge, model, protocols) {
	
	return function(){

  		var cardsSortByValue = function(a, b){
  			if(a.value == 2 || b.value == 2){
  				if(a.value == 2 && b.value != 2) return  1;
  				if(a.value != 2 && b.value == 2) return -1;
  				if(a.value == 2 && b.value == 2) {
	  				if(a.color <  b.color) return -1;
  					if(a.color >  b.color) return  1;
  					if(a.color == b.color) return  0;
  				}
  			}
  			else{
	  			if(a.value <  b.value) return -1;
  				if(a.value >  b.value) return  1;
  				if(a.value == b.value){
	  				if(a.color <  b.color) return -1;
  					if(a.color >  b.color) return  1;
  					if(a.color == b.color) return  0;
   				}
   			}
   			return 0;
  		};

  		var playersSortByOrder = function(a, b){
			if(a.order == b.order) 
				return 0;
			else if(a.order < b.order) 
				return -1;
			return 1;
		};

	/* Adatok küldése a szervernek */  		

		var sendUserName = function(){
  			bridge.sendData('myname', model.UserName.get());	
  		};
  		var sendAi = function(){
  			bridge.sendData('startgame', model.aiNumbers());	
  		};
  		var sendCards = function(){		// INFO [{color: 0, value: 8}, {color: x, value: y}...]
			bridge.sendData("put", model.SelectedCards.get());
			model.Message.set(false);
  		};
  		var sendPassz = function(){
  			bridge.sendData("put", []);
  			model.Message.set(false);
  		};
  		var sendTribute = function(){
  			bridge.sendData('tributeback', model.SelectedCards.get());
  			model.Message.set(false);
  		};
  		var sendTributeAd = function(){
			bridge.sendData('tributes', model.TributeAd.get());
			model.Message.set(false);
			model.TributeState.set(false);	// bár lehetne "T" is
  		};
  	
  	/* Adatok fogadása a szervertől */

    	var __accessdenied = function(){
    		model.Message.set("ACCESSDENIED");
    	};
  		var __badname = function(data){
  			if(data.state)
  				model.Message.set(data.message);
  			else {
  				model.Message.set(false); 
	  			model.UserName.set(data.name);
				model.UserId.set(data.id);
				model.State.next();
			  }
  		};
  		var __badcards = function(){
  			model.Cards.deselect();
  			model.Cards.refresh();
  			model.Message.set("BADCARDS");
  		};
  		var __cardnums = function(data){

            var elemek = model.Players.get().splice(0);
            
  			for (var i = 0; i < data.length; i++) {
  				var obj = elemek.MgetObjectWithCustomEquals(i, function(a, b){
  					if(a == b.id) return true;
  					return false;
  				});
  				obj.setCardNums(data[i]);
  			};
  			model.Players.set(elemek);
  		};
  		var __mycards = function(data){

  			for (var i = 0; i < data.length; i++) {
  				data[i].isSelected = false;
  			}

  			data.sort(cardsSortByValue);
  			model.Cards.set(data);
  			bridge.sendData("cardnums", null);
  		};
  		var __newplayer = function (data) {
  			var lista = [];
			for (var i = 0; i < data.length; i++) {
				lista.push(protocols.Player(data[i], i));
    		}
    		model.Players.set(lista);
  		};
		var __next = function(data){
			model.Message.set(false);
			model.Message.set("NEXT", [data]);
			model.ActivePlayer.set(data);
			model.Players.refresh();

			var hossz = model.DepositedCards.get().length;
			if(model.DepositedCards.get()[hossz-1].isLargestCard()) // INFO ha legfelül 2/joker van autopassz
				sendPassz();
		};
		var __newround = function(data){
			model.DepositedCards.empty();

			var lista = model.Players.get();
			for (var i = 0; i < data.order.length; i++) {
				var item = lista.MgetObjectWithCustomEquals(data.order[i], function(a,b){
  					if(a == b.id)
	  					return true;
  					return false;
  				});
  				if(item){
  					item.order = i;
	  				item.dignity = data.ranks[i];
  				}
			};
			lista.sort(playersSortByOrder);
			model.Players.set(lista);

			bridge.sendData('mycards', null);
			if(data.democratic)	bridge.sendData('ready', null);
			else if(lista[0].id == model.UserId.get()) //	INFO itt nincs semmiképpen sem ready
			{
				model.TributeState.set("AD");
				model.Message.set("TRIBUTEAD");
			}
            model.State.set(2);
		};
  		var __nextcircle = function(data){
  			model.DepositedCards.empty(); // INFO játéktér ürítése
  			model.Message.set(false);
  			model.Message.set("NEXT", [data]);
  			model.ActivePlayer.set(data); // INFO data id játékos jön	
  			model.Players.refresh();// INFO játékosok frissítése
  		};
 		var __put = function (data) {

 			var cardGroup = protocols.CardGroup();

 			if(model.UserId.get() == data.from){
 				model.Cards.deselect();			
 				for (var i = 0 ; i < data.cards.length; i++) {
 					var index = model.Cards.get().MindexOfObjectWithCustomEquals(data.cards[i], function(a,b){
 						if(a.color == b.color && a.value == b.value)
 							return true;
 						return false;
 					});
	 				if (index>-1) {
	 					var kartya = model.Cards.get()[index];
	 					cardGroup.values.push(kartya.value);
	 					cardGroup.colors.push(kartya.color);
	 					cardGroup.isActive = true;
	 					model.Cards.get().splice(index, 1);}
 				};		
 				model.Cards.refresh();
 			}
 			else{
 				data.cards.forEach(function(act){
 					cardGroup.values.push(act.value);
	 				cardGroup.colors.push(act.color);
	 				cardGroup.isActive = true;

 				});
 			}

 			if (cardGroup.isActive)
 					model.DepositedCards.add(cardGroup);
			
			model.DepositedCards.refresh();
 			model.Players.refresh(); 			
 			model.UserObject.get(data.from).toLowerCardsNum(data.cards.length);
 			
  			bridge.sendData('ready', null);
  		};
  		var __serverdown = function(){
  			model.Players.empty();
  			model.Cards.empty();
  			model.DepositedCards.empty();

  			model.init();
  		};
		var __tributes = function(data){
			bridge.sendData('mycards', null);
			bridge.sendData('cardnums', null);

			var myObject = model.UserObject.get();
			// INFO rang ellenőrzése (felső vagy alsó n-ben)
			if(myObject.isTributeHigh(data.length)) // INFO felső ha order 0, 1, 2 ...
			{
				model.TributeState.set("T");
				model.Message.set("TRIBUTEBACK", [data[myObject.order]]);
				// TODO ennyi lapot kell visszaadnom
				// INFO ha felső, akkor felület, mit adjunk vissza
			}
			else if(myObject.isTributeLow(players().length - data.length)){ // INFO alsó ha n-1, n-2, n-3 ...
				// INFO ha alsó, akkor csak rendezés
				cards.sort(cardsSortByValue);
			}
		};
		var __tributeback = function(data){

			if(data){
				model.TributeState.set(false);
				model.SelectedCards.remove(); 
			}
			else
				model.Message.set("BADTRIBUTEBACK");
		};

		var __tributeready = function(){
			bridge.sendData('mycards', null);
			bridge.sendData('cardnums', null);
			bridge.sendData('ready', null);
		};

		var init = function(){
			bridge.registerSignal('accessdenied', 	__accessdenied);
			bridge.registerSignal('serverdown', 	__serverdown);
			bridge.registerSignal('newplayer',		__newplayer);
			bridge.registerSignal('badname', 		__badname);
			bridge.registerSignal('badcards', 		__badcards);
			bridge.registerSignal('newround', 		__newround);
			bridge.registerSignal('mycards', 		__mycards);
			bridge.registerSignal('cardnums', 		__cardnums);
			bridge.registerSignal('tributes', 		__tributes);
			bridge.registerSignal('tributeback', 	__tributeback);
			bridge.registerSignal('tributeready',	__tributeready);
			bridge.registerSignal('nextcircle', 	__nextcircle);
			bridge.registerSignal('put', 			__put);
			bridge.registerSignal('next', 			__next);
        };

		var connectToServer = function(){
			bridge.connectToServer('http://mocsar.azurewebsites.net/');
		};

		connectToServer();
		init();
		
		return {
			userName: 			model.userName,
			badname: 			model.badname,
			aiNumbers: 			model.aiNumbers,

			isLogin: 			model.isLogin,
			isError: 			model.isError,
			isSettings: 		model.isSettings,
			isAdmin: 			model.isAdmin,
			isInit: 	   		model.isInit,
			isGameStarted: 		model.isGameStarted,
			isYourNext: 		model.isYourNext,
			isTributeStateAD: 	model.isTributeStateAD,
			isTributeStateT: 	model.isTributeStateT,

			//	tömbök elérése
			getPlayers: 		model.Players.get,
			getCards: 			model.Cards.get,
			getDepositedCards: 	model.DepositedCards.get,
			
			sendUserName: 		sendUserName,
			sendPassz: 			sendPassz,
			sendCards: 			sendCards,
			sendAi: 			sendAi,
			sendTribute: 		sendTribute,
			sendTributeAd: 		sendTributeAd,
			
			getMessage: 		model.getMessage,
			getMessageToUser: 	model.Message.get,
			isDevelopment: 		false

		};
	};
});
