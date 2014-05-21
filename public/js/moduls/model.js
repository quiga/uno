define(["jquery", "ko", "gameMessages"], function ($, ko, getMessage) {

	this.userName       = ko.observable("");
	this.userId         = ko.observable("");
	this.aiNumbers      = ko.observable("5");
	this.players        = ko.observableArray([]);
	this.cards          = ko.observableArray([]);
	this.depositedCards = ko.observableArray([]);
	this.state          = ko.observable(0);
	this.isTributeState = ko.observable(false);
	this.messageCode	= ko.observable(false);

	var messageCodeParam = [];
	
	var initializeModel = function(){
		userName("");     
		userId("");       
		aiNumbers("5");   
		players([]);      
		cards([]);        
		depositedCards([]);
		state(0);
		isTributeState(false);
		messageCode(false);
		messageCodeParam = [];
	};

	var refreshPlayers = function(){
      	var data = players().slice(0);
       	players([]);
       	players(data);
   	};
   	var refreshDepositedCards = function(){
   		var data = depositedCards().slice(0);
       	depositedCards([]);
       	depositedCards(data);	
   	};
   	var refreshCards = function(){
   		var data = cards().slice(0);
       	cards([]);
       	cards(data);	
   	};
   	var getMessageCode = function(){
   		if(messageCode() != false && typeof messageCode() != "undefined")
   			if(getMessage(messageCode())){
   				var back = getMessage(messageCode());
   				if(messageCodeParam.length > 0){
   					for (var i = 0; i < messageCodeParam.length; i++) {
						back = back.replace('%'+i, messageCodeParam[i]);   						
   					};
   				}
   				return back;
   			}
   		return "";
   	};
   	var setMessageCode = function(code, param){
   		messageCodeParam = param || [];
   		messageCode(code);
   	};
	var getUserId = function(){
		return userId();
	};
	var setUserId = function(id){
		userId(id);
	};
   	var getPlayers = function(isTributePlayers){
		var tributeIs = isTributePlayers || false;
		var hossz = players().length;
		if(tributeIs){
			var lista = [];
			for (var i = hossz - 1; i >= 0; i--) {
				if(players()[i].order >= hossz/2)
					lista.push(players()[i]);
			};
			return lista;
		}
		return players();
	};
	var setPlayers = function(player){
		players(player);
		players.valueHasMutated();
		refreshPlayers();
	};
	var getCards = function(){
		return cards();
	};
	var setCards = function(data){
 			cards.removeAll();
 			cards(data);
 			cards.valueHasMutated();
	};
	var getDepositedCards = function(isLast){
		var last = isLast || false;
		if(last){
			var c = [];
			c.push(depositedCards()[depositedCards().length-1]);
			return c;
		}
		return depositedCards();
	};
	var setDepositedCards = function(dpcards){
		depositedCards(dpcards);
	};
	var isLogin = function(){
		return (this.userName() === "" || this.userId() === "") && this.state() == 0;
	};
	var isSettings = function(){
		return (this.userName() !== "" && this.userId() !== "") && this.state() == 1;
	};
	var isAdmin = function(){
		return this.userId() == "0";
	};
	var isInit = function(){
		return isLogin() || isSettings();
	};
	var isError = function(){
		return messageCode() != false;
	};
	var isGameStarted = function(){
		return state() == 2;
	};
	var getUserObject = function(id){
		id = id || userId();
		return players().MgetObjectWithCustomEquals(id, function(a,b){
			if(a == b.id)
				return true;
			return false;
		});
	};
	var isTributeStateT = function(){
   		return isTributeState() == "T";
   	};
   	var isYourNext = function(){
   		if( players().length > 0 )
   		{
   			var userObject = getUserObject();
   			if( userObject )
  					if( typeof userObject.active != "undefined" )
  						return userObject.active;
   		}
   		return false;
   	};
	var setActivePlayer = function(id){
		for (var i = 0; i < players().length; i++) {
			players()[i].active = false;
			if(players()[i].id == id)
				players()[i].active = true;
		};
	};
	var getActivePlayer = function(){
		for (var i = 0; i < players().length; i++) {
			if(players()[i].active)
				return players()[i];
		};
		return null;
	};
	var getSelectedCards = function(){
		var c = [];
		for (var i = 0; i < cards().length; i++) {
			if(cards()[i].isSelected)
				c.push({ color: cards()[i].color, value: cards()[i].value });
			};
		return c;
		};
	var removeSelectedCards = function(){
		for (var i = cards().length - 1; i >= 0; i--) {
			if(cards()[i].isSelected)
				cards().slice(i, 1);
			};
		};
	var getTributeAd = function(){
		var ad = [];
		for (var i = players().length - 1; i >= 0; i--) {
			if(players()[i].tribute > 0)
				ad.push(players()[i].tribute);
		};
		ad.sort(function(a,b){
			if(a == b) return 0;
			if(a >  b) return -1;
			return 1;
		});
		return ad;
  	};
	var setUserName = function(name){
		userName(name);
	};
	var getUserName = function(){
		return userName();
	};
	var nextState = function(){
		state(state()+1);
	};
	var toState = function(st){
		state(st);
	};
	var addDepositedCards = function(element){
		depositedCards.push(element);
	};
	var emptyPlayers = function(){
		players.removeAll();
	};
	var emptyCards = function(){
		cards.removeAll();
	};
	var emptyDepositedCards = function(){
		depositedCards.removeAll();
	};
	var isTributeAd = function(){};

	var getState = function(){return state;};
	var getTributeState = function(){return isTributeState();};
	var setTributeState = function(st){
		isTributeState(st);
	};
	var isTributeStateAD = function(){
		return isTributeState() == "AD";
	};
	var deselectCards = function(){
		for (var i = 0; i < cards().length; i++) {
			cards()[i].isSelected = false;
		}
	};


	return {
/****************************************************************************************************/
/******************** Default-ba kiadott válltozók **************************************************/
		userName: 		userName, 
		aiNumbers: 		aiNumbers,

/****************************************************************************************************/
/******************** Property-k ********************************************************************/
		UserId: 		{ get: getUserId,			set: setUserId },	
		UserName: 		{ get: getUserName,			set: setUserName },	
		Players: 		{ get: getPlayers,			set: setPlayers,		empty: emptyPlayers,			refresh: refreshPlayers },	
		Cards: 			{ get: getCards,			set: setCards,			empty: emptyCards,				refresh: refreshCards, 			deselect: deselectCards },	
		DepositedCards:	{ get: getDepositedCards,	set: setDepositedCards, empty: emptyDepositedCards,		refresh: refreshDepositedCards,	add: addDepositedCards },
		ActivePlayer: 	{ get: getActivePlayer,		set: setActivePlayer },	
		UserObject: 	{ get: getUserObject },
		
		State: 			{ get: getState,			set: toState,			next: nextState },
		SelectedCards: 	{ get: getSelectedCards, 	remove: removeSelectedCards },
		TributeState: 	{ get: getTributeState,		set: setTributeState },
		TributeAd: 		{ get: getTributeAd },
		Message: 		{ get: getMessageCode, 		set: setMessageCode },

/****************************************************************************************************/
/******************** Computed-es függvények ********************************************************/
		isSettings: 		ko.computed(isSettings,	    	this),
		isLogin: 			ko.computed(isLogin,      		this),
		isAdmin: 			ko.computed(isAdmin,      		this),
		isInit: 			ko.computed(isInit,       		this),
		isError: 			ko.computed(isError,      		this),			
		isGameStarted: 		ko.computed(isGameStarted,		this),
		isYourNext: 		ko.computed(isYourNext,			this),
		isTributeStateAD: 	ko.computed(isTributeStateAD,	this),
		isTributeStateT: 	ko.computed(isTributeStateT,	this),

/****************************************************************************************************/
/********************  ********************************************************************/
		getMessage: 	getMessage,
		init: 			initializeModel
	};

});