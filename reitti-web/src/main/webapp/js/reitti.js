

$(document).ready(function(){
  $("#getloc").bind('click', function(event) {
	  makeRequest(getDummyPosition());
    return false;
  });

  // geocode origin
  $("#search").bind('click', function(event) {
  	searchRouteReittiopas();
    return false;
  });

  $("input.address").change(function(event) {
    var el = $(this);
    el.removeData("coords");
    console.log("changed: "+el.attr("id"));
  });
  
  if(navigator.geolocation) {
    $("#gps").show().bind('click', function(event) {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(handleGetPositionSuccess, handleGetPositionError);
    });
  }
  
  $("#back").bind('click', function(event) {
    $('[data-role="page"]').hide();
    $("#search-page").show();
  });
  
});

function handleGetPositionSuccess(position) {
  var la = position.coords.latitude;
  var lo = position.coords.longitude;
  
  $("#origin").val("-").data("coords", lo+","+la);
}

function handleGetPositionError(error) {
  alert("pos error: "+error.code+": "+error.message);
}

function searchRouteReittiopas() {
	var gc = new JPGeocoder();
	$(".feedback").html("");
	$(".routing > .title").text("");
	$(".routing > .routes").empty();
	
//	$(".address").removeData("coords");

	var o = {done:false};
	var from = $("#origin").data("coords");
	var to = $("#destination").data("coords");
	if(!from)
	  gc.geocode({addr: $("#origin"), ctx: o}, handleGeocodeResponse, handleGeocodeError);
	if(!to)
	  gc.geocode({addr: $("#destination"), ctx: o}, handleGeocodeResponse, handleGeocodeError);
	if(from && to) {
		getRouting(from, to);
	}
}

function getRouting(from, to) {
  new JPRouter().route({data: {from: from, to: to}}, handleRoutingResponse, handleRoutingError);
	//handleRoutingResponse(getRoutingInfo(), "ok", null, null);
};

function handleGeocodeError(jqXhr, textStatus, errorThrown, context) {
	var ctx = context == null ? this : context;
	alert("<p>"+jqXhr+"</p>"+"<p>"+textStatus+"</p>"+"<p>"+errorThrown+"</p>");
	var fb = $(ctx).siblings(".feedback").first();
	fb.html("<p>error: failed to find "+ctx.attr("id")+" address</p>");
}

function createAddressPicker(data, addressElement) {
	var fb = $("#"+addressElement.attr("id")+"-feedback");
	var id = addressElement.attr("id") + "-addresses";
	var select = '<select id="'+id+'">';
	$.each(data, function(key, value) {
		select += '<option value="'+value.matchedName+'" data-coords="'+value.coords+'">'+value.matchedName+', '+value.city+'</option>';
	});
	select += '</select>';
	$(select).change(function(event) {
		var o = $("option:selected", "select#"+id);
		addressElement.val(o.text());
		addressElement.data("coords", o.data("coords"));
		fb.html("");
    $("#search").attr("disabled", false);
	}).appendTo(fb);
}

function handleGeocodeResponse(locs, textStatus, jqXhr, result) {
  if(locs == null || locs.length == 0)
		return handleGeocodeError(jqXhr, "OK", "no data", this.addr);
	if(locs.length > 1) {
		createAddressPicker(locs, this.addr);
		var fb = $(this.addr).nextAll(".feedback").first();
		$("<p>multiple matches: "+locs.length+"</p>").appendTo(fb);
		$("#search").attr("disabled", true);
		return;
	}
	$(this.addr).data("coords", locs[0].coords)
		.data("location", locs[0]);
	var from = $("#origin").data("coords");
	var to = $("#destination").data("coords");

	console.log("ctx.done: "+this.ctx.done);
	if(from && to && !this.ctx.done) {
	  this.ctx.done = true;
	  getRouting(from, to);
	}
}

function handleRoutingResponse(routes, textStatus, jqXhr, result) {
	$(".routing > .title").text($("#origin").val() + " - " + $("#destination").val());
	
	var routesElem = $(".routes");
	var ib = ReittiopasConstants.image_base;
	for(var i = 0; i < routes.length; i++) {
		for(var j = 0; j < routes[i].length; j++) {
			var route = routes[i][j];
			var lastLeg = route.legs[route.legs.length-1];
			var depTime = parseDateTime(route.legs[0].locs[0].arrTime);
			var arrTime = parseDateTime(lastLeg.locs[lastLeg.locs.length-1].arrTime);
			var walkTotal = 0;
			var re = '<li class="route">';
			re += '<div class="times"><div class="starttime">'+formatTime(depTime)+'</div><div class="endtime">'+formatTime(arrTime)+'</div></div>';
			var path = [];
			var bounds = new google.maps.LatLngBounds();
			var n = 0;
			for(var k = 0; k < route.legs.length; k++) {
				var leg = route.legs[k];
				var legType = leg.type;
				var legTypeMeta = ReittiopasConstants.transport_type[leg.type];
				if(!legTypeMeta)
				  alert("undef: "+leg.type);
				if(ReittiopasConstants.transport_type[leg.type])
					legType = legTypeMeta.name;
				if(legType == "walk") {
					re += '<div class="walk"><img src="'+ib+'/resultSummary/'+legTypeMeta.image_url+'"><div class="walkleg">'+formatLengthKm(leg.length)+'</div></div>';
					walkTotal += leg.length;
				} else {
					var jore = new JoreCode(leg.type, leg.code);
					re += '<div class="leg"><img src="'+ib+'/resultSummary/'+legTypeMeta.image_url+'"><div class="line">'+jore.userCode()+'</div></div>';
				}
				for(var l = 0; l < leg.locs.length; l++) {
				  var c = leg.locs[l].coord;
				  var latlng = new google.maps.LatLng(c.y, c.x);
				  path.push(latlng);
				  n += 1;
				  bounds = bounds.extend(latlng);
				}
			}
			re += '<div class="walk"><div class="routetitle">Walking</div><div class="walktotal">'+formatLengthKm(walkTotal)+'</div></div>';
			re += '</li>';
			$(re).data("bounds", bounds) // TODO: remove
			  .data("path", path) // TODO: remove
			  .data("route", route)
			  .bind('click', activateRoute)
			  .appendTo(routesElem);
		}
	}
}

// TODO: change to generate route-page content. get route data and generate
function activateRoute(event) {
  $(".route").removeClass("row-active");
  $(this).addClass("row-active");
  
  $("#search-page").hide();
  $("#route-page").show();
  
  route = $(this).data("route");
  var legcnt = 0;
  var table = '<table border="0">';
	var ib = ReittiopasConstants.image_base;
  
	for(var k = 0; k < route.legs.length; k++) {
		var leg = route.legs[k];
		var legType = leg.type;
		var legTypeMeta = ReittiopasConstants.transport_type[leg.type];
		if(!legTypeMeta)
		  alert("undef: "+leg.type);
		if(ReittiopasConstants.transport_type[leg.type])
			legType = legTypeMeta.name;
		legcnt++;
		var startTime = parseDateTime(leg.locs[0].arrTime);
		var endTime = parseDateTime(leg.locs[leg.locs.length-1].arrTime);
		var legDest = leg.locs[leg.locs.length-1].name;
		if(k == route.legs.length-1)
			legDest = $("#destination").data("location").name;
		table += '<tr><td><img src="'+ib+'/resultSummary/'+legTypeMeta.image_url+'"></td><td>'+formatTime(startTime)+'-'+formatTime(endTime)+', '+legDest+'</td></tr>';
	}
	table += '</table>';
	$(table).appendTo($("#route-details").empty());
}
  
function activateRoute_OLD(event) {
  $(".route").removeClass("row-active");
  $(this).addClass("row-active");
  var b = $(this).data("bounds");
  
  $("#search-page").hide();
  $("#map-page").show();
  
  var mo = {
    center: b.getCenter(),
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  var map = new google.maps.Map(document.getElementById("map"), mo);
  map.fitBounds(b);
  
  var path = new google.maps.Polyline({
    path : $(this).data("path"),
    strokeColor : "#FF0000",
    strokeOpacity : 1.0,
    strokeWeight : 2
  });
  path.setMap(map);
  
//  var box = new google.maps.Rectangle({ bounds: b});
//  box.setMap(map);

}

function formatLengthKm(d) {
  return (d/1000).toFixed(1);
}

function JoreCode(transportType, code) {
  this.code = code;
  this.transportType = transportType;
  this.areaCode = code.substr(0, 1);
  this.lineCode = code.substr(1, 3);
  this.lineVariantLetter = code.substr(4, 1);
	this.lineVariant = code.substr(5, 1);
	this.direction = code.substr(6, 1);
	
	this.userCode = function() {
	  var line = this.lineCode;
	  var v = this.lineVariantLetter;
	  var tp = this.transportType;
    line = line.replace(/^0*([^0].*)/, "$1");
    if(tp == 6) {
      return "M";
    } else if (tp == 12 || tp == 22) {
	    return v;
    }
	  return $.trim(line + v);
	};
  
  return true;
}

function formatTime(d) {
  var h = d.getHours() > 9 ? d.getHours() : "0"+d.getHours();
  var m = d.getMinutes() > 9 ? d.getMinutes() : "0"+d.getMinutes();
  return h+":"+m;
}

function parseDateTime(d) {
  return new Date(d.substr(0, 4), d.substr(4,2)-1, d.substr(6,2),
		  d.substr(8,2), d.substr(10,2), 0);
}

function handleRoutingError(jqXhr, textStatus, errorThrown, context) {
	alert("routing error");
}


/*

function searchRouteGoogle() {
	var geocodeServiceUrl = "http://maps.googleapis.com/maps/api/geocode/json";
	var result = {};

	makeAjaxRequest(geocodeServiceUrl,
			{ sensor: "false", address: escape($("#origin").val()) },
			function(data, textStatus, jqXhr) { return handleGeocodeResponse(data, textStatus, jqXhr, result, "origin"); }
	);
	
	makeAjaxRequest(geocodeServiceUrl,
			{ sensor: "false", address: escape($("#destination").val()) },
			function(data, textStatus, jqXhr) { return handleGeocodeResponse(data, textStatus, jqXhr, result, "destination"); }
	);
}


function getCoordinates(origDest, key) {
	return origDest[key].lng + "," + origDest[key].lat;
}

function makeAjaxRequest(url, parameters, success, error) {
  $.ajax({
	  headers: { "X-Request-URI": url},
	  url: "/reitti/proxy", data: parameters,
	  success: success, error: error
	});
}

function getDummyPosition() {
	var pos = {
		coords: { longitude: 25.0513450, latitude: 60.3504588}	
	};
	return pos;
}

function makeMapsRequest(position) {
  var lon = position.coords.longitude;
  var lat = position.coords.latitude;
}

function makeMapsRequest(position) {
  var lon = position.coords.longitude;
  var lat = position.coords.latitude;
  $.ajax({
	  url: "/reitti/proxy",
	  data: { latlng: lat+","+lon, sensor: "false" },
	  headers: { "X-Request-URI": "http://maps.googleapis.com/maps/api/geocode/xml"},
	  success: success1 
	  });
  alert("baz");
}

function success1(data, textStatus, jqXhr) {
  alert(jqXhr.responseText);
}

function handleError(error) {
	alert("error: "+error);
}

*/