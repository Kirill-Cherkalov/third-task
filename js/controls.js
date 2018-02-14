 ymaps.ready(show);

 function show() {
 	var humanContainer = document.getElementById('humanCities'); /*output human cities*/
 	var compContainer = document.getElementById('compCities'); /*output comp cities*/
 	var counter = 0; /*coun for funct compReq + count for compArray*/
 	var humanArray = []; //array for human cities
 	var compArray = [];  //array for comp cities
 	var i = 0; // count for humanArray
 	var lastCompSimb = '';//last symbol in comp city request
 	var myMap;
	var outRes = document.getElementById('outRes');//out info/results
 	init();

 	function init() {
 		myMap = new ymaps.Map('map', {
 			center: [0, 0],
 			zoom: 2
 		});
 		myMap.controls
 			.add('zoomControl', {
 				left: 5,
 				top: 5
 			})
 	}

 	function setLabel(lat, lng) {
 		var res = ymaps.geocode([lat, lng], {
 			kind: 'locality'
 		});
 		res.then(
 			function (res) {
 				myMap.geoObjects.add(res.geoObjects.get(0));
 			},
 			function (err) {}
 		);
 	}

	$('#btn').click(function(){
		var city = document.getElementById('humanCity').value;
		document.getElementById('humanCity').value = '';
		outRes.innerHTML = '';
		if (lastCompSimb != 0) {
			if (city.charAt(0).toUpperCase() == lastCompSimb.toUpperCase()) {
				checkWord(city);
				return;
			} else {
				outRes.innerHTML = 'Ссылка на правила игры в заглавии.';
				return;
			}
		}
		checkWord(city);
		});
 
 	function sendReq(city) {
 		//send human request/writing in humanArray/writing lastSymbol
 		//check on double word
		if (counter != 0) {
			for (k = 0; k < humanArray.length; k++) {
				for (kk = 0; kk < compArray.length; kk++) {
					if (city == humanArray[k] || city == compArray[kk]) {
						outRes.innerHTML = 'Этот город уже был введен';
						return;
					}
				}
			}
		}
 		//magic with AJAX and JSON
 		var outRequest = new XMLHttpRequest();
 		outRequest.open('GET', 'http://api.geonames.org/searchJSON?name_equals=' + city + '&lang=ru&featureClass=P&cities=cities1000&orderby=relevance&username=kirill_for_yandex');
 		outRequest.send();
 		outRequest.onload = function () {
 			var ourData = JSON.parse(outRequest.responseText);
 			//переменная для проверки, есть ли результат
 			var total = 'totalResultsCount';
 			if (ourData[total] == 0) {
 				outRes.innerHTML = 'Введенный город не найден.';
 				return;
 			}
 			humanArray[i] = ourData.geonames[0].name;
 			//var with coordinates of city 
 			var lat = ourData.geonames[0].lat;
 			var lng = ourData.geonames[0].lng;
 			humanContainer.innerHTML += ' ' + ourData.geonames[0].name + ', ';
 			setLabel(lat, lng);
 			var lastSimb = city.charAt(city.length - 1);
 			if (lastSimb == 'ъ' || lastSimb == 'ь') {
 				lastSimb = city.charAt(city.length - 2);
 			}
 			compReq(lastSimb);
 			i++;
 		}
 	}

 	function compReq(lastSimb) {
 		//send comp request/writing in humanArray/writing lastSymbol
 		var compRequest = new XMLHttpRequest();
 		compRequest.open('GET', 'http://api.geonames.org/searchJSON?name_startsWith=' + lastSimb + '&orderby=relevance&searchlang=ru&cities=cities1000&lang=ru&featureClass=P&username=kirill_for_yandex');
 		compRequest.send();
 		compRequest.onload = function () {
 			var compData = JSON.parse(compRequest.responseText);
 			var total = 'totalResultsCount';
 			if (compData[total] == 0) {
 				outRes.innerHTML = 'Нажмите "The end", чтобы подвести итоги. ';
 				return;
 			}
 			var rand = Math.floor(Math.random() * compData.geonames.length);
 			var randCity = compData.geonames[rand].name;
 			if (counter != 0) {
 				for (var ii = 0; ii < compArray.length; ii++) {
 					if (randCity == compArray[ii]) {
						outRes.innerHTML = 'Нажмите "The end", чтобы подвести итоги.';
 						return;
 					}
 				}
 			}
 			compArray[counter] = compData.geonames[rand].name;
 			var lat = compData.geonames[rand].lat;
 			var lng = compData.geonames[rand].lng;
 			//переменная с последним символом города компа
 			lastCompSimb = compData.geonames[rand].name.charAt(compData.geonames[rand].name.length - 1);
 			if (lastCompSimb == 'ь' || lastCompSimb == 'ъ') {
 				lastCompSimb = compData.geonames[rand].name.charAt(compData.geonames[rand].name.length - 2);
 			}
 			compContainer.innerHTML += ' ' + compData.geonames[rand].name + ', ';
 			setLabel(lat, lng);
 			counter++;
 		}
 	}

 	function checkWord(city) {
 		//орфографич проверки при вводе
 		if (!city) {
 			return outRes.innerHTML = 'Чтобы начать игру введите название города';
 		} else
 			city = city.toLowerCase();
 		city = city[0].toUpperCase() + city.slice(1);
 		var eng = /[a-z]+/i;
 		var ru = /[а-яё]/i;
 		var numb = /[a-z0-9\!\@\#\$\^\,\.\"\№\&\;\%\:\?\*\(\)\_\+\/\\=]+/g;
 		if (city.length < 3) {
 		outRes.innerHTML ='Разве сущетсвуют города с названием меньше 2 символов?';
 			return;
 		} else if (city.match(eng)) {
 			outRes.innerHTML = 'Используйте рускиий алфавит.';
 			return;
 		} else if (city.match(numb)) {
 			outRes.innerHTML = 'Символы?..Серьезно?..Меня этим не возьмешь.';
 			return;
 		}
 		sendReq(city);
 	}
	 
	 $('#restart').click(function (){
		var humanTotals = '';
 		var compTotals = '';
 		var str = '';
		var count1 = 1;
		var count2 = 1;
 		for (var p = 0; p < humanArray.length; p++) {
 			humanTotals += count1 + ' - ' + humanArray[p] + ',';
			count1++;
 		}
 		for (var j = 0; j < compArray.length; j++) {
 			compTotals += count2 + ' - ' + compArray[j] + ',';
			count2++;
 		}
 		if ( humanArray.length > compArray.length ) {
			str = 'Поздравляю, вы победили.';
		} else {
			str = 'Победил компьютер.';
		}
 		outRes.innerHTML = 'User: ' + humanTotals + '\n\n' + 'Computer: ' + compTotals + '\n\n' + str;
 		humanArray.splice(0, humanArray.length);
 		compArray.splice(0, compArray.length);
 		counter = 0;
 		i = 0;
 		lastCompSimb = '';
 		lastSimb = '';
 		humanContainer.innerHTML = '';
 		compContainer.innerHTML = '';
 		outComp = '';
 		out = '';
 		myMap.geoObjects.each((geoObject) => {
 			myMap.geoObjects.remove(geoObject);
 		});
	 });
 }