

function Geocoder() {
	this.config = new Config();
	
	this.geocode = function() {
		return null;
	};
	
	return true;
}

function JPGeocoder() {
	this.prototype = new Geocoder();
	this.proxy = new JourneyPlannerProxy(this.prototype.config.jpUrl, this.prototype.config.jpUser, this.prototype.config.jpPass);

	this.geocode = function(ctx, success, failure) {
	  console.log("geocode: "+ctx.addr.val());
		this.proxy.ajax({
			data: { request: "geocode", key: ctx.addr.val(), epsg_out: ReittiopasConstants.COORDINATE_SYSTEM.WGS84},
			success: success, error: failure,
			dataType: "json", context: ctx
	  });
	};
	
	return true;
}


