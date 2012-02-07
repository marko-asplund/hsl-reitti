

function Proxy(baseUrl) {
	this.baseUrl = baseUrl;
	
	this.ajax = function(settings) {
		$.ajax($.extend(true, settings, {
//			  headers: { "X-Request-URI": this.baseUrl},
//			  url: "/reitti/proxy"
			  url: baseUrl
			})
		);
	};

	return true;
}


function JourneyPlannerProxy(baseUrl, user, pass) {
	this.prototype = new Proxy(baseUrl);
	this.user = user;
	this.pass = pass;
	
	this.ajax = function(settings) {
		this.prototype.ajax($.extend(true, settings, {
			data: { user: this.user, pass: this.pass }
		 })
		);
	};
	
	return true;
}