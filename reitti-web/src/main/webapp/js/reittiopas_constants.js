
function ReittiopasConstants() {
}

ReittiopasConstants.COORDINATE_SYSTEM = {};
ReittiopasConstants.COORDINATE_SYSTEM.WGS84 = 4326;

ReittiopasConstants.image_base = "http://www.reittiopas.fi/images";

ReittiopasConstants.transport_type = {
	1: { name: "bus_hki", image_url: "pict_bussi.gif" },
	2: { name: "tram", image_url: "pict_ratikka.gif" },
	3: { name: "bus_espoo", image_url: "pict_bussi.gif" },
	4: { name: "bus_vantaa", image_url: "pict_bussi.gif" },
	5: { name: "bus_reg", image_url: "pict_bussi.gif" },
	6: { name: "metro", image_url: "pict_metro.gif" },
	7: { name: "ferry", image_url: "pict_lautta.gif" },
	8: { name: "u-line", image_url: "pict_bussi.gif" },
	12: { name: "train", image_url: "pict_juna.gif" },
	walk: { name: "walk", image_url: "walk.gif" },
};