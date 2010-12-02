importScripts("sfb_master.js", "replacer.js");

var action = null;

onmessage = function(e){
	if (action === null) {
		action = e.data;
	} else {
		run(action, e.data);
		action = null;
	}
};

function run(action, data)
{
	switch (action) {
		case "quotes": data = Replacer.replaceQuotes(data); break;
		case "dashes": data = Replacer.replaceDashes(data); break;
		case "spaces":
			data = Replacer.deleteLeadingSpaces(data);
			data = Replacer.deleteTrailingSpaces(data);
			data = SfbMaster.compressSpaces(data);
			break;
		case "tabs": data = SfbMaster.insertTabs(data); break;
		case "misc":
			data = Replacer.replaceElipsis(data);
			data = Replacer.simplifyApostrophes(data);
			break;
	}

	postMessage(data);
}
