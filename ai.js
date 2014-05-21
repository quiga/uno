module.exports = function () {
	require('./jsexpansion');
	var db = require('./db.json'),
		fs = require('fs');


	return function () {

		var aiPlayers = [],
		    callbacks,
			stratTree,
			callTree,
			putTree;


		function ID3_build (collection) {

			var node = {};
			var allresults = collection.column(collection[0].length-1);
			var results = allresults.uniq();

			function H (Set) {
				var sm = 0;
				Set.column(Set[0].length-1).uniq().forEach(function (a) {
					var p = Set.column(Set[0].length-1).numberOf(a) / Set.length;
					sm -= p*Math.log2(p);
				});
				return sm;
			}

			function G (Set, AttrIndex) {
				var res = H(Set);
				Set.column(AttrIndex).uniq().forEach(function (v) {
					res -= ( Set.column(AttrIndex).numberOf(v) / Set.length ) * H(Set.filter(function (element) {
						return element[AttrIndex] === v;
					}));
				});
				return res;
			}



			// 1. Highest information gain
			var gains = [];
			(collection[0].length-2).times(function (i) {
				gains.push(G(collection, i));
			});
			node['param'] = gains.maxIndex();

			// 2.
			collection.column(node.param).uniq().forEach(function (ar) {
				node[ar] = null;
			});

			// 3.
			for (var vi in node) {
				if (vi === 'param') continue;
				var filtered = collection.filter(function (e) {e[node.param] === vi;});

				if (filtered.column(collection[0].length-1).uniq().length === 1) {
					node[vi] = collection[0].last();
				} else if (filtered.column(collection[0].length-1).uniq().length === 0) {
					node[vi] = function () {
						var resnums = [];
						results.forEach(function (a) {
							resnums.push(allresults.numberOf(a));
						});
						return results[resnums.maxIndex()];
					}();
				} else {
					node[vi] = ID3_build(filtered);
				}

			}


			return node;
		}


		function ID3_decision (node, datas) {
			var deref = node[datas[node.param]];
			if (typeof deref !== 'object') return deref;
			return ID3_decision(deref, datas);
		}



		////////////////////////////////////////////////////////////////////////////////

		function ChooseStrategy (rank, cardsval, no_of_singles, no_of_pairs, no_of_big_groups, no_of_high) {
			// collection: rank, cardsval, no_of_singles, no_of_high, strategy
			if (db["strategy"].length < 100) {
				return ['finishfirst', 'betterposition', 'keep', 'noswamp'][rndInt(0, 3)];
			};
			if (!stratTree) {
				console.log("------BUILDING STRAT TREE------");
				stratTree = ID3_build(db["strategy"])
			};
				console.log("------USING STRAT TREE------");
			var strat = ID3_decision(stratTree, [rank, cardsval, no_of_singles, no_of_pairs, no_of_big_groups, no_of_high]);
			console.log("STRATEGY choosen:",strat);
			return strat;
		}

		function ChooseCall (strategy, cards_over, cards_under, put_jollies, put_highs, circles, circles_to_my_end) {
			// collection: strategy, cards_over, cards_under, put_jollies, put_highs, circles, circles_to_my_end, call_strat
			if (db["call"].length < 100) {
				return ['lowest', 'most', 'win_the_circle'][rndInt(0, 2)];
			};
			if (!callTree) {
				console.log("------BUILDING CALL TREE------");
				callTree = ID3_build(db["call"])
			};
				console.log("------USING CALL TREE------");
			var cstrat = ID3_decision(callTree, [strategy, cards_over, cards_under, put_jollies, put_highs, circles, circles_to_my_end]);
			console.log("CALL choosen:",cstrat);
			return cstrat;
		}

		function ChoosePut (strategy, cards_over, cards_under, put_jollies, put_highs, circles, circles_to_my_end, val, num) {
			// collection: strategy, cards_over, cards_under, put_jollies, put_highs, circles, circles_to_my_end, val, num, call_strat
			if (db["put"].length < 100) {
				return ['lowest', 'no_bid', 'win_the_circle'][rndInt(0, 2)];
			};
			if (!putTree) {
				console.log("------BUILDING PUT TREE------");
				putTree = ID3_build(db["put"])
			};
				console.log("------USING PUT TREE------");
			var pstrat = ID3_decision(putTree, [strategy, cards_over, cards_under, put_jollies, put_highs, circles, circles_to_my_end, val, num]);
			console.log("PUT choosen:",pstrat);
			return pstrat;
		}

		////////////////////////////////////////////////////////////////////////////////

		function CalcCards (cards) {
			var value = 0;
			var numOfCardValues = [0,0,0,0,0,0,0,0,0,0,0,0,0,0]; //[2,3,4,5,6,7,8,9,10,J,Q,K,A,Y]
			cards.forEach(function (a) {
				numOfCardValues[a.value - 2] += 1;
			});
			numOfCardValues[13] += numOfCardValues[0];
			numOfCardValues.shift();
			numOfCardValues.forEach(function (a, i) {
				var current = i+3;
				if (a > 0) {
						 if (current === 3) {value -= 5;}
					else if (current === 4) {value -= 5;}
					else if (current === 5) {value -= 3;}
					else if (current === 6) {value -= 2;}
					else if (current === 7) {value -= 1;}
					else if (current === 8) {value += 1;}
					else if (current === 9) {value += 1;}
					else if (current === 10) {value += 2;}
					else if (current === 11) {value += 3;}
					else if (current === 12) {value += 3;}
					else if (current === 13) {value += 4;}
					else if (current === 14) {value += 5;}
					else if (current === 15) {value += 7;}

					if (a === 1) value -= 3;
					else value += a;
				};
			});
			if (value < 10 && value >= 1) {
				return 2;
			}
			if (value < 20 && value >= 10) {
				return 3;
			}
			if (value < 1 && value >= -10) {
				return 1;
			}
			if (value >= 20) {
				return 4;
			}
			if (value < -10) {
				return 0;
			}
		}

		function CalcRank (order, index) {
			if (index == 0) {return 0;};
			var lim = (order.length + 1) / 4;
			if (index < lim) {return 1};
			if (index < 2*lim) {return 2};
			if (index < 3*lim) {return 3};
			if (index < 4*lim) {return 4};
		}

		function CalcSingles (cards) {
			var values = cards.column("value");
			var num = 0;
			values.forEach(function (val) {
				if (values.numberOf(val) === 1) {
					num++;
				};
			});
			if (num < 1) {return 0;};
			if (num < 3) {return 1;};
			if (num < 6) {return 2;};
			if (num < 9) {return 3;};
			return 4;
		}

		function CalcPairs (cards) {
			var values = cards.column("value");
			var num = 0;
			values.forEach(function (val) {
				if (values.numberOf(val) === 2) {
					num++;
					values.remove(val);
				};
			});
			if (num < 1) {return 0;};
			if (num < 3) {return 1;};
			if (num < 5) {return 2;};
			return 3;
		}

		function CalcBig (cards) {
			var values = cards.column("value");
			var num = 0;
			values.forEach(function (val) {
				if (values.numberOf(val) > 2) {
					num++;
					values.remove(val, val, val);
				};
			});
			if (num < 1) {return 0;};
			if (num < 3) {return 1;};
			if (num < 5) {return 2;};
			return 3;
		}

		function CalcHigh (cards) {
			var values = cards.column("value");
			var num = 0;
			values.forEach(function (val) {
				if (val > 10) {
					num++;
				};
			});
			if (num < 2) {return 0;};
			if (num < 5) {return 1;};
			if (num < 7) {return 2;};
			return 3;
		}

		function CalcCardsOver (player, players) {
			var cards = [],
				sum = 0;
			players.forEach(function (p, i) {
				if (p.cards.length > player.cards.length) {
					cards.push(p.cards.length);
					sum += p.cards.length;
				}
			});
			if (sum === 0) {return 0};
			if (sum/cards.length < 3) {return 1;};
			if (sum/cards.length < 5) {return 2;};
			if (sum/cards.length < 7) {return 3;};
			if (sum/cards.length < 9) {return 4;};
			return 5;
		}

		function CalcCardsUnder (player, players) {
			var cards = [],
				sum = 0;
			players.forEach(function (p, i) {
				if (p.cards.length < player.cards.length) {
					cards.push(p.cards.length);
					sum += p.cards.length;
				}
			});
			if (sum === 0) {return 0};
			if (sum/cards.length < 3) {return 1;};
			if (sum/cards.length < 5) {return 2;};
			if (sum/cards.length < 7) {return 3;};
			if (sum/cards.length < 9) {return 4;};
			return 5;
		}

		function CalcPutJollies (putHistory, id) {
			var filtered = putHistory.filter(function  (e) {
				return e[0] !== id;
			});
			filtered = filtered.column(1);
			var j = 0;
			filtered.forEach(function (a) {
				a.forEach(function (b) {
					if (b.value === 15 || b.value === 2) {j++};
				});
			});

			if (j < 3) {return 0;};
			if (j < 6) {return 1;};
			if (j < 9) {return 2;};
			if (j < 12) {return 3;};
			if (j < 15) {return 4;};
			return 5;
		}

		function CalcPutHighs (putHistory, id) {
			var filtered = putHistory.filter(function  (e) {
				return e[0] !== id;
			});
			filtered = filtered.column(1);
			var j = 0;
			filtered.forEach(function (a) {
				a.forEach(function (b) {
					if (b.value === 14 || b.value === 13 || b.value === 12 || b.value === 11) {j++};
				});
			});

			if (j < 6) {return 0;};
			if (j < 12) {return 1;};
			if (j < 20) {return 2;};
			if (j < 28) {return 3;};
			if (j < 36) {return 4;};
			return 5;
		}

		function CalcCircles (putHistory, id) {
			var j = putHistory.column(0).numberOf(id);

			if (j < 3) {return 0;};
			if (j < 5) {return 1;};
			if (j < 8) {return 2;};
			if (j < 11) {return 3;};
			if (j < 15) {return 4;};
			return 5;
		}

		function CalcCirclesToEnd (player) {
			var j = player.cards.column('value').uniq().length;
			if (j < 2) {return 0;};
			if (j < 4) {return 1;};
			if (j < 6) {return 2;};
			if (j < 8) {return 3;};
			return 4;
		}

		function saveDB () {
			fs.writeFileSync('db.json', JSON.stringify(db));
		}

		////////////////////////////////////////////////////////////////////////////////

		function getAiPlayers () {
			return aiPlayers;
		}

		function newAiPlayer (player, id, players) {
			aiPlayers.push(playerAI(player, id, players));
		}

		function setCallbacks (data) {
			callbacks = data;
		}

		
		function playerAI (player, id, players) {
			var myCurrentIndex,
				iSendTribute = false,
			    currentOrder,
			    rank,
			    cardsval,	// Húzott kártyák (adózás utáni) értéke
			    no_of_singles,
			    no_of_pairs,
			    no_of_big_groups,
			    no_of_high,
			    myStrategy,
			    callStrategies = [],
			    putStrategies = [],
			    putHistory = [];

			var _iCall = function () {
				var cStrat = [];
				cStrat.push(myStrategy);
				cStrat.push(CalcCardsOver(player, players));
				cStrat.push(CalcCardsUnder(player, players));
				cStrat.push(CalcPutJollies(putHistory, id));
				cStrat.push(CalcPutHighs(putHistory, id));
				cStrat.push(CalcCircles(putHistory, id));
				cStrat.push(CalcCirclesToEnd(player));
				cStrat.push(ChooseCall(cStrat[0],cStrat[1],cStrat[2],cStrat[3],cStrat[4],cStrat[5],cStrat[6]));
				callStrategies.push(cStrat);

				var cards = [];
				if (cStrat.last() === 'lowest') {
					for (var i = 0; (i < player.cards.length); i++) {
						var c = player.cards[i];
						
						if (cards.length == 0) {
							cards.push(c);
						} else {
							if (cards[0].value != c.value && c.value != 2 && c.value != 15) break;
							cards.push(c);
						}
					};
				};
				if (cStrat.last() === 'most') {
					var groups = player.cards.column('value').uniq();
					var numbers = [];
					groups.forEach(function (a) {
						numbers.push(player.cards.column('value').numberOf(a));
					});
					player.cards.forEach(function (a) {
						if(a.value === groups[numbers.maxIndex()])
							cards.push(a);
					});
				};
				if (cStrat.last() === 'win_the_circle') {
					var groups = player.cards.column('value').uniq();
					var high;
						 if (groups.contains(14)) {high = 14;}
					else if (groups.contains(13)) {high = 13;}
					else if (groups.contains(12)) {high = 12;}
					else if (groups.contains(11)) {high = 11;}
					else if (groups.contains(10)) {high = 10;}
					else high = groups.last();

					if (high == 15 || high == 2) {
						cards.push(player.cards.last());
					} else {
						player.cards.forEach(function (a) {
							if(a.value === high)
								cards.push(a);
						});
					}
				};
					
				callbacks.put(id, function() {}, cards);
			};
			var _iPut = function () {
				var cards = [],
					num = callbacks.currentRound().cardsOnTable().last().cards.length,
					val = callbacks.currentRound().cardsOnTable().last().value;
				
				if (val == 15) {
					callbacks.put(id, function() {}, cards);
					return;
				};

				var cStrat = [];
				cStrat.push(myStrategy);
				cStrat.push(CalcCardsOver(player, players));
				cStrat.push(CalcCardsUnder(player, players));
				cStrat.push(CalcPutJollies(putHistory, id));
				cStrat.push(CalcPutHighs(putHistory, id));
				cStrat.push(CalcCircles(putHistory, id));
				cStrat.push(CalcCirclesToEnd(player));
				cStrat.push(val);
				cStrat.push(num);
				cStrat.push(ChoosePut(cStrat[0],cStrat[1],cStrat[2],cStrat[3],cStrat[4],cStrat[5],cStrat[6],cStrat[7],cStrat[8]));
				putStrategies.push(cStrat); //'lowest', 'no_bid', 'win_the_circle'

				if (cStrat.last() === "lowest" || (cStrat.last() === 'no_bid' && rndInt(10) > 7)) {	
					for (var i = 0; (i < player.cards.length); i++) {
						var c = player.cards[i];
						if (c.value != 2 && c.value <= val) continue;
						if (cards.length == 0) {
							cards.push(c);
						} else {
							if (cards[0].value != c.value && c.value != 2 && c.value != 15) cards.splice(0);
							cards.push(c);
						}
						if (cards.length == num) break;
					};
					if (cards.length !== num || val === 14) cards.splice(0);
				};
				if (cStrat.last() === 'no_bid') {
				};
				if (cStrat.last() === 'win_the_circle') {
					var cvs = player.cards.column('value');
					var high;
					if (val === 14){
						var js = player.cards.filter(function (e) {return (e.value === 2 || e.value === 15);});
						if (js.length >= num) {
							num.times(function (i) {
								cards.push(js[i]);
							});
						}
					} else {
						(14).downto(val+1, function (i) {
							if (cvs.numberOf(i) >= num) {
								num.times(function (j) {
									cards.push(player.cards[cvs.indexOf(i)+j]);
								});
								return 'break';
							} else if ((cvs.numberOf(i) + cvs.numberOf(15) + cvs.numberOf(2)) >= num) {
								cvs.numberOf(i).times(function (j) {
									cards.push(player.cards[cvs.indexOf(i)+j]);
								});
								(num-cards.length).times(function (j) {
									cards.push(player.cards[cvs.length-(1+j)]);
								});
								return 'break';
							}
						});
					}
				};

				callbacks.put(id, null, cards);
			};
			var _ready = function () {
				callbacks.ready(id);
			};
			var _updateModel = function () {
				// TODO
			};
			var _iTribute = function () {
				var a = rndInt(3, 5);
				var b = rndInt(2, a-1);
				var c = rndInt(1,b-1);
				callbacks.tributes(id, [a,b,c]);
			};
			var _iTributeBack = function (num) {
				// TODO ne a legelső numt, hanem értelmesen
				var cards = [];
				Number(num).downto(1, function (i) {
					cards.push(player.cards[i]);
				});
				callbacks.tributeback(id, null, cards);
			};

			var _calcVariables = function () {
				rank = CalcRank(currentOrder, myCurrentIndex);
				cardsval = CalcCards(player.cards);
				no_of_singles = CalcSingles(player.cards);
				no_of_pairs = CalcPairs(player.cards);
				no_of_big_groups = CalcBig(player.cards);
				no_of_high = CalcHigh(player.cards);
			}

			var _saveResults = function (neworder) {
				function save () {
					db["strategy"].push([rank, cardsval, no_of_singles, no_of_pairs, no_of_big_groups, no_of_high, myStrategy]);
					db["call"].push.apply(db["call"], callStrategies);
					db["put"].push.apply(db["put"], putStrategies);
					if (db["strategy"].length > 200) {
						db["strategy"].shift();
					};
					if (db["call"].length > 400) {
						db["call"].shift();
					};
					if (db["put"].length > 200) {
						db["put"].shift();
					};
				}
				var myO = neworder.indexOf(id);

				if (myStrategy == 'finishfirst') {
					if (myO == 0)
						save();
					return;
				}
				if (myStrategy == 'betterposition') {
					if (myO < myCurrentIndex)
						save();
					return;
				}
				if (myStrategy == 'keep') {
					if (myO <= myCurrentIndex+1)
						save();
					return;
				}
				if (myStrategy == 'noswamp') {
					if (myO !== neworder.length-1)
						save();
					return;
				}
			}

			////////////////////////////////////////////////////

			var onNext = function (nextid) {
				if (nextid === id) {
					_iPut();
				};
			};

			var onNextCircle = function (callid) {
				if (callid === id) {
					_iCall();
				};
			};

			var onNewRound = function (data) {
				if (myCurrentIndex) {
					_saveResults(data.order);
				}
				callStrategies.splice(0);
				putStrategies.splice(0);
				putHistory.splice(0);
				iSendTribute = false;
				currentOrder = data.order;
				myCurrentIndex = currentOrder.indexOf(id);
				if (data.democratic) {
					_calcVariables();
					myStrategy = ChooseStrategy(rank, cardsval, no_of_singles, no_of_pairs, no_of_big_groups, no_of_high);
					_ready();
				}
				if (currentOrder.first() === id && !data.democratic) {
					iSendTribute = true;
				};
			};

			var onPut = function (data) {
				putHistory.push([data.from, data.cards]);
				_ready();
			};

			var onTributes = function (tributes) {
				if (tributes.length > myCurrentIndex) {
					_iTributeBack(tributes[myCurrentIndex]);
				};
				_updateModel('tributes', tributes);
			};

			var onTributeBack = function () {
				_updateModel('tributeback');
				_ready();
			};

			var onTributeReady = function () {
				_calcVariables();
				myStrategy = ChooseStrategy(rank, cardsval, no_of_singles, no_of_pairs, no_of_big_groups, no_of_high);
				_ready();
			};

			var onNewPlayer = function (list) {
				// TODO
			};

			var getISendTribute = function () {
				return iSendTribute;
			}

			return {
				newplayer: onNewPlayer,
				newround: onNewRound,
				put: onPut,
				next: onNext,
				nextcircle: onNextCircle,
				tributes: onTributes,
				tributeback: onTributeBack,
				tributeready: onTributeReady,
				iSendTribute: getISendTribute,
				sendTribute: _iTribute
			};
		}





		return {
			newAiPlayer: newAiPlayer,
			aiPlayers: getAiPlayers,
			callbacks: setCallbacks,
			saveDB: saveDB
		};
	};
}();