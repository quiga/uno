define([], function () {
	
	var map = {};
	//map[""] = "";

/* Oldalhoz tartozó szövegek */
	map["CONNECTEDUSERS"] = "Eddig csatlakozott Userek:";
	map["LABELFORNAME"] = "Felhasználónév:";	
	map["LABELFORAINUMBERS"] = "MI játékosok száma:";

	map["BUTTONSENDNAME"] = "Login";
	map["BUTTONSTART"] = "Start Game";
	map["BUTTONSEND"] = "Send";
	map["BUTTONSENDAD"] = "Send";
	map["BUTTONPASSZ"] = "Passz";
	map["BUTTONTRIBUTEBACK"] = "Tribute Back";
/* Játékmenethez tartozó szövegek */

	map["TRIBUTEBACK"] = "Kérlek adj vissza %0 lapot";
	map["BADTRIBUTEBACK"] = "Hibás kártya visszaadás. Kérlek próbáld meg újra";
	map["BADCARDS"] = "Hibás lerakás. Próbáld újra.";
	map["TRIBUTEAD"] = "Adózás kihirdetése. Kérlek adj meg egy csökkenő sorozatot.";
	
	map["ACCESSDENIED"] = "A játék már elkezdődött. Nem Tudsz csatlakozni.";
	
	map["GAMESTARTED"] = "A játék már elkezdődött. Nem Tudsz csatlakozni.";
	map["NAMEINUSED"] = "A név már használatban van.";
	map["TOLONGNAME"] = "A név túl hosszú";
	map["NEXT"] = "következő játékos: %0";	// csak teszteléshez

	return function(code){
		return map[code];
	};
	
});