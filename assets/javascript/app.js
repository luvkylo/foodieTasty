var food = ["American", "Asian", "British", "Bubble Tea", "Buffets", "Cafes", "Chicken Wings", "Chinese", " Filipino", "Diners", "Dumplings", "Fast Food", "Hot Pot", "Indonesian", "Italian", "Japanese", "Korean", "Malaysian", "Mexican", "Noodles", "Pizza", "Sandwiches", "Seafood", "Sushi Bars", "Thai", "Vegetarian"];

var lat = 34.0752215;
var long = -118.44149050000001;
var cate = "";
var favArr = [];
var infav = false;
var end = false;
var searchURL = "https://corsanywhere.herokuapp.com/https://api.yelp.com/v3/businesses/search";
var token = 'YmNs5xVWc1AmBIRel6tpbxEpxy2zsRkWoIrEiojv2vvW2Jld3YIc7KCAWHBKd_FpcjqyjYKesjEK8SfclMEswwThz0zvZ_yxJZlYkU7p_TkpynXA1xcNkme9Mse0XHYx';
var exist = false;
var limit = 0;

navigator.geolocation.getCurrentPosition(function(position) {
	lat = position.coords.latitude;
	long = position.coords.longitude;
});

function findCookies() {
	var pairs = document.cookie.split(";");
		for (var i=0; i<pairs.length; i++){
		    var pair = pairs[i].split("=");
	    	pair[0] = pair[0].charAt(0).replace(/\s+/g, '') + pair[0].slice(1);
		    if (!favArr.includes(pair[0])) {	
			    favArr.push(pair[0]);
		    }
		}
    console.log(favArr)
}

function build(response, num) {
	findCookies()
	for (var i = 0; i < num; i++) {
		if (response.businesses[0] === "undefined") {
			$(".cardGroup").removeClass("card-columns").addClass("text-center").css("color", "red").text("Result cannot be found!");
			break;
		}
		else if (response.businesses[i] === "undefined") {
			break;
		}
		else {
			var body = $("<div>").addClass("card mb-4").width("22rem").css("min-width", "15rem");
			var image_url = response.businesses[i].image_url;
			var name = response.businesses[i].name;
			var rate = response.businesses[i].rating + "/5";
			var price = response.businesses[i].price;
			var yelp_url = response.businesses[i].url;
			if (price === "$") {
				price = "Cheap!";
				var color = "green";
			} else if (price === "$$") {
				price = "Affordable";
				var color = "blue";
			} else if (price === "$$$") {
				price = "Getting Expensive!";
				var color = "#CCCC00";
			} else {
				price = "Goodbye Wallet";
				var color = "red";
			}
			var yelp = $("<a>").attr({href: yelp_url, target: "_blank"});
			yelp.append($("<img>").addClass("card-img-top img-flui").attr("src", image_url));
			body.append(yelp);
			var text = $("<p>").addClass("card-text").html("<p>Name: <b>" + name + "</b></p><p>Rate: <b>" + rate + "</b></p><p>Price: <b style='color: " + color + "'>" + price + "</b></p>");
			if (!favArr.includes(name)) {
				var fav = $("<button>").addClass("btn btn-outline-primary favButton").attr("type", "button").text("Favorite").data("name", name);
			}
			else {
				var fav = $("<button>").addClass("btn btn-primary favButton").attr("type", "button").text("Favorited!").data("name", name);
			}
			body.append($("<div>").addClass("card-body").append([text, fav]));
			$(".cardGroup").append(body);
			limit += 10;
		}
		exist = true;
	}
}

$(document).ready(function() {
	// Authorization: Bearer <YOUR API KEY> in request header
	food.forEach(function(element) {
		$(".categoriesContainer").append($("<button>").addClass("btn btn-info mx-1 mb-2 categoriesButton").attr("type", "button").val(element).text(element));
	});


	$(document).on("click", ".categoriesButton", function() {
		limit = 0;
		infav = false;
		end = false;
		var text = $(this).text().split(" ");
		cate = "";
		for (var i = 0; i < text.length; i++) {
			if (i >= 1) {
				cate += text[i].charAt(0).toUpperCase() + text[i].slice(1);
			}
			else {
				cate += text[i];
			}
		}
		var url = searchURL + "?term=" + cate + "&latitude=" + lat + "&longitude=" + long + "&sort_by=rating&limit=10&offset=" + limit + "&radius=40000";
		$.ajax({
			url: url,
			method: "GET",
			headers: {
				'Authorization': 'Bearer ' + token
			}
		}).then(function(response) {
			$(".main-display").append($("<div>").addClass("card-columns cardGroup").css("display", "block"));
			if (exist) {
				$(".cardGroup").empty();
				build(response, 10);
			}
			else {
				build(response, 10);
			}
			
		});
	});

	// row till end -> get again
	$(window).scroll(function() {
		if($(window).scrollTop() + $(window).height() == $(document).height() && !infav) {
			var url = searchURL + "?term=" + cate + "&latitude=" + lat + "&longitude=" + long + "&sort_by=rating&limit=10&offset=" + limit + "&radius=40000";
			$.ajax({
				url: url,
				method: "GET",
				headers: {
					'Authorization': 'Bearer ' + token
				}
			}).then(function(response) {
				build(response, 10);
			});
		}
	});

	// connect zip code button
		// use another api to find long and lat
	$("#zipSearch").on("click", function(event) {
		infav = false;
		end = false;
		event.preventDefault();
		zip = $(".zipSearch").val();
		if (zip.match("[0-9]{5}")) {
			var mapApi_key = "7KJ9FmGzVmFgAQMe0JY1nsua5PG7EUul";
			var googleUrl = "http://www.mapquestapi.com/geocoding/v1/address?key=" + mapApi_key + "&location=" + zip;
			$.ajax({
				url: googleUrl,
				method: "GET",
			}).then(function(response) {
				lat = response.results[0].locations[0].latLng.lat;
				long = response.results[0].locations[0].latLng.lng;
				if (cate != "") {
					var url = searchURL + "?term=" + cate + "&latitude=" + lat + "&longitude=" + long + "&sort_by=rating&limit=10&offset=" + limit + "&radius=4000";
				}
				else {
					var url = searchURL + "?latitude=" + lat + "&longitude=" + long + "&sort_by=rating&limit=10&offset=" + limit + "&radius=4000";
				}

				$.ajax({
					url: url,
					method: "GET",
					headers: {
						'Authorization': 'Bearer ' + token
					}
				}).then(function(response) {
					$(".main-display").append($("<div>").addClass("card-columns cardGroup").css("display", "block"));
					if (exist) {
						$(".cardGroup").empty();
						build(response, 10);
					}
					else {
						build(response, 10);
					}
				});
			});
		}
	});

	// search food type
		// use term
	$("#styleSearch").on("click", function(event) {
		infav = false;
		end = false;
		event.preventDefault();
		text = $(".styleSearch").val().split(" ");
		cate = "";
		for (var i = 0; i < text.length; i++) {
			text[i] = text[i].charAt(0).toUpperCase() + text[i].substring(1);
			if (i >= 1) {
				cate += text[i].charAt(0).toUpperCase() + text[i].slice(1);
			}
			else {
				cate += text[i];
			}
		}
		if (!food.includes(text.join(' '))) {
			food.push(text.join(' '));
			$(".categoriesContainer").append($("<button>").addClass("btn btn-info mx-1 mb-2 categoriesButton").attr("type", "button").val(text.join(' ')).text(text.join(' ')));
		}
		var url = searchURL + "?term=" + cate + "&latitude=" + lat + "&longitude=" + long + "&sort_by=rating&limit=10&offset=" + limit + "&radius=40000";
		$.ajax({
			url: url,
			method: "GET",
			headers: {
				'Authorization': 'Bearer ' + token
			}
		}).then(function(response) {
			$(".main-display").append($("<div>").addClass("card-columns cardGroup").css("display", "block"));
			if (exist) {
				$(".cardGroup").empty();
				build(response, 10);
			}
			else {
				build(response, 10);
			}
			
		});
		$(".styleSearch").val("");
	})

	// add a favorite button?
	$(document).on("click", ".favButton", function() {
		name = $(this).data("name");
		if ($(this).text() === "Favorited!") {
			var date = new Date();
			date.setTime(date.getTime()+(-1*24*60*60*1000));
			document.cookie = name + "= ; expires=" + date.toGMTString();
			$(this).removeClass("btn-primary").addClass("btn-outline-primary").text("Favorite");
		}
		else {
			document.cookie = name + "=" + name;
			$(this).removeClass("btn-outline-primary").addClass("btn-primary").text("Favorited!");
		}
	});

	$(".fav").on("click", function() {
		infav = true;
		if (!end) {
			$(".main-display").empty();
			var pairs = document.cookie.split(";");
			if (pairs[0] === "") {
				$(".main-display").append($("<h1>").addClass("text-center").css("color", "red").text("You do not have any item favorited!"));
			}
			else {
				if ($(".cardGroup").length === 0) {
					$(".main-display").append($("<div>").addClass("card-columns cardGroup").css("display", "block"));
					console.log("in");
					pairs.forEach(function(item, i){
					    var pair = item.split("=");
					    var cate = pair[0];
					    limit = 0;
					    var url = searchURL + "?term=" + cate + "&latitude=" + lat + "&longitude=" + long + "&sort_by=rating&limit=1&offset=" + limit + "&radius=40000";
					    console.log(url);
						$.ajax({
							url: url,
							method: "GET",
							headers: {
								'Authorization': 'Bearer ' + token
							}
						}).then(function(response) {
							build(response, 1);
						});
					});
				}
			}
			end = true;
		}
	});
});