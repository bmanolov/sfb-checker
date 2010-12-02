importScripts("sfb_master.js", "replacer.js");

onmessage = function(e){
	runHilite(e.data);
};

function runHilite(args)
{
	if (typeof args == "string") {
		args = JSON.parse(args);
	}
	var hilited = SfbMaster.hiliteFishyPlaces(args.sfbText, args.incorrectForms);
	postMessage(hilited);
}
