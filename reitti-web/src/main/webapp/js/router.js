
function Router() {
	this.config = new Config();
	
	this.route = function() {
		return null;
	};
	
	return true;
}

/* Reittiopas proxy
 */
function JPRouter() {
	this.prototype = new Router();
	this.proxy = new JourneyPlannerProxy(this.prototype.config.jpUrl, this.prototype.config.jpUser, this.prototype.config.jpPass);

	this.route = function(params, success, failure) {
		this.proxy.ajax($.extend(true, params, {
			data: { request: "route",  /*detail: "full",*/
			  epsg_in: ReittiopasConstants.COORDINATE_SYSTEM.WGS84, epsg_out: ReittiopasConstants.COORDINATE_SYSTEM.WGS84 },
			success: success, error: failure,
			dataType: "json"
	  }));
	};
	
	return true;
}
