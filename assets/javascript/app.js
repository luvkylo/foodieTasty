var food = ["American", "Asian", "British", "Bubble Tea", "Buffets", "Cafes", "Chicken Wings", "Chinese", " Filipino", "Diners", "Dumplings", "Fast Food", "Hot Pot", "Indonesian", "Italian", "Japanese", "Korean", "Malaysian", "Mexican", "Night Food", "Noodles", "Pizza", "Sandwiches", "Seafood", "Sushi Bars", "Thai", "Vegetarian"];

var lat = 34.0752215;
var long = -118.44149050000001;
var cate = "";

navigator.geolocation.getCurrentPosition(function(position) {
	lat = position.coords.latitude;
	long = position.coords.longitude;
	console.log("success");
});

$(document).ready(function() {
	var searchURL = "https://corsanywhere.herokuapp.com/https://api.yelp.com/v3/businesses/search";
	var token = 'YmNs5xVWc1AmBIRel6tpbxEpxy2zsRkWoIrEiojv2vvW2Jld3YIc7KCAWHBKd_FpcjqyjYKesjEK8SfclMEswwThz0zvZ_yxJZlYkU7p_TkpynXA1xcNkme9Mse0XHYx';
	var exist = false;
	var limit = 0;
	// Authorization: Bearer <YOUR API KEY> in request header
	food.forEach(function(element) {
		$(".categoriesContainer").append($("<button>").addClass("btn btn-info mx-1 mb-2 categoriesButton").attr("type", "button").val(element).text(element));
	});

	function build(response) {
		for (var i = 0; i < 10; i++) {
			var body = $("<div>").addClass("card mb-4").width("22rem").css("min-width", "15rem");
			var image_url = response.businesses[i].image_url;
			var name = response.businesses[i].name;
			var rate = response.businesses[i].rating + "/5";
			var price = response.businesses[i].price;
			var yelp_url = response.businesses[i].url;
			if (price === "$") {
				price = "Cheap!";
			} else if (price === "$$") {
				price = "Affordable";
			} else if (price === "$$$") {
				price = "Getting Expensive!";
			} else {
				price = "Goodbye Wallet";
			}
			var yelp = $("<a>").attr({href: yelp_url, target: "_blank"});
			yelp.append($("<img>").addClass("card-img-top img-flui").attr("src", image_url));
			body.append(yelp);
			var text = $("<p>").addClass("card-text").html("<p>Name: <b>" + name + "</b></p><p>Rate: <b>" + rate + "</b></p><p>Price: <b>" + price + "</b></p>");
			body.append($("<div>").addClass("card-body").append(text));
			$(".cardGroup").append(body);
		}
		exist = true;
		limit += 10;
	}

	$(document).on("click", ".categoriesButton", function() {
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
				build(response);
			}
			else {
				build(response);
			}
			
		});
	});

	// row till end -> get again
	$(window).scroll(function() {
		if($(window).scrollTop() + $(window).height() == $(document).height()) {
			var url = searchURL + "?term=" + cate + "&latitude=" + lat + "&longitude=" + long + "&sort_by=rating&limit=10&offset=" + limit + "&radius=40000";
			$.ajax({
				url: url,
				method: "GET",
				headers: {
					'Authorization': 'Bearer ' + token
				}
			}).then(function(response) {
				build(response);
			});
		}
	});

	// connect zip code button
		// use another api to find long and lat
	$("#zipSearch").on("click", function(event) {
		event.preventDefault();
		zip = $(".zipSearch").val();
		if (zip.match("[0-9]{5}")) {
			var GCPapi_key = "AIzaSyCy1z_XBLshu_jzKjrNYmfw55qps1wCOX8";
			var googleUrl = "https://maps.googleapis.com/maps/api/geocode/json?address= " + zip + "&key=" + GCPapi_key;
			$.ajax({
				url: googleUrl,
				method: "GET",
			}).then(function(response) {
				lat = response.results[0].geometry.location.lat;
				long = response.results[0].geometry.location.lng;
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
						build(response);
					}
					else {
						build(response);
					}
				});
			});

		}

	});

	// search food type
		// use term
	$("#styleSearch").on("click", function(event) {
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
				build(response);
			}
			else {
				build(response);
			}
			
		});
	})

	// add a favorite button?
});