var QuoteChecker =
{
	_openingQuotes: [],
	_closingQuotes: [],
	_counter: 0,

	_init: function()
	{
		this._openingQuotes = [];
		this._closingQuotes = [];
		this._counter = 0;
	},

	markFishyQuotes: function(string)
	{
		this._init();

		for (var i = 0, len = string.length; i < len; i++) {
			switch (string[i]) {
				case ">":
					if (string[i-1] == "\n") {
						// reset counter by entering a new section
						this._counter = 0;
					}
					break;
				case "„":
				case "«":
					this._counter++;
					this._openingQuotes.push(i);
					break;
				case "“":
				case "»":
					if (this._counter <= 0) {
						this._closingQuotes.push(i);
					} else {
						this._counter--;
						this._openingQuotes.pop();
					}
					break;
			}
		}

		string = this._putMarkers(string);

		return string;
	},

	_putMarkers: function(string)
	{
		var quotes = this._openingQuotes.concat(this._closingQuotes).sort(function(a, b) {
			return a - b;
		});
		var newString = "";
		var offset = 0;
		for (var i = 0, len = quotes.length; i < len; i++) {
			newString += string.substring(offset, quotes[i]);
			// what type of quote: opening or closing
			var quote = this._closingQuotes.indexOf(quotes[i]) == -1 ? "„" : "“";
			newString += "<mark>" + quote + "</mark>";
			offset = quotes[i] + 1;
		}

		if (offset < string.length) {
			newString += string.substring(offset);
		}

		return newString;
	}
};
