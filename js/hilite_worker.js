importScripts("sfb_master.js", "replacer.js", "quote_checker.js");

onmessage = function(e){
	runHilite(e.data);
};

function runHilite(args)
{
	if (typeof args == "string") {
		args = JSON.parse(args);
	}
	var hilited = SfbMaster.hiliteFishyPlaces(args.sfbText, args.incorrectForms);
	hilited = QuoteChecker.markFishyQuotes(hilited);
	postMessage(hilited);
}
