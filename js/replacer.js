var Replacer = {
	simplifyQuotes: function(s)
	{
		return s.replace(/[«»„“”]/g, '"');
	},

	replaceQuotes: function(s)
	{
		var pos = -1, quotesOpen = 0, quote = "";
		s = this.simplifyQuotes(s);
		while ( (pos = s.indexOf('"', pos+1)) >= 0 ) {
			if ( this.quoteOpens(s[pos-1], s[pos+1], quotesOpen) ) {
				quotesOpen++;
				quote = "«";
			} else if ( this.quoteCloses(s[pos-1], s[pos+1], quotesOpen) ) {
				quotesOpen--;
				quote = "»";
			} else {
				quote = '"';
			}
			s = s.substr(0, pos) + quote + s.substring(pos+1);
		}

		return s;
	},

	quoteOpens: function(prevChar, nextChar, inQuote)
	{
		return prevChar == undefined || /[\s_({}\[«]/.test(prevChar);
	},

	quoteCloses: function(prevChar, nextChar, inQuote)
	{
		return nextChar == undefined
			|| /[\s,;:.!?…_){}\]"*]/.test(nextChar)
			|| (nextChar == "-" && /[а-я]/i.test(prevChar));
	},


	replaceDashes: function(s)
	{
		s = this.deleteHyphens(s);
		s = s.replace(/\u2015/g, "—"); // Horizontal bar
		s = s.replace(/\b([\d,.]*)-([\d,.]+)\b/g, "$1–$2"); // ndash
		s = s.replace(/\b(\d+) *[—-] *(\d+)\b/g, "$1–$2"); // ndash
		s = s.replace(/\b([IXV]+)[—-]([IXV]+)\b/g, "$1–$2"); // ndash
		s = s.replace(/([\s(«])[-–­](\s)/g, "$1—$2"); // mdash

		return s;
	},

	/** Заменя всички „...“ с многоточие. */
	replaceElipsis: function(s)
	{
		return s.replace(/\.\.\.|\. \. \./g, "…");
	},

	/** Изтрива тиретата за пренос */
	deleteHyphens: function(s)
	{
		return s.replace(/­|¬/g, "");
	},

	/** Преобразува всички видове апострофи в клавиатурни */
	simplifyApostrophes: function(s)
	{
		return s.replace(/[‘’]/g, "'");
	},

	/** Премахва водещите интервали */
	deleteLeadingSpaces: function(s)
	{
		return s.replace(/\t +| +\t/g, "\t").replace(/\n +/g, "\n");
	},

	/** Премахва опашните интервали */
	deleteTrailingSpaces: function(s)
	{
		return s.replace(/ +\n/g, "\n");
	},

	normalizeNewLines: function(s)
	{
		return s.replace(/\r\n/, "\n").replace(/\r/, "\n");
	},

	/**
	* @param s         A string
	* @param pattern   An object: {search: RegExp, replace: String, [skip: RegExp]}
	*/
	replaceWithSkip: function(s, pattern)
	{
		if (pattern.skip) {
			// hide some text parts
			var matches = s.match(pattern.skip);
			s = s.replace(pattern.skip, "\x01");
		}

		s = s.replace(pattern.search, pattern.replace);

		if (pattern.skip) {
			// reveal hidden text parts
			var i = 0, h = /\x01/;
			while (h.test(s)) {
				s = s.replace(h, matches[i++]);
			}
		}

		return s;
	}

};
