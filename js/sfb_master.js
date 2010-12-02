/**
* Handles syntax and incorrect characters higlighting.
* Rewrite of Mandor’s main SFB check macro for Word.
*
* @uses replacer.js
*/
var SfbMaster =
{
	format: function(s)
	{
		s = this.formatTitles(s);
		s = this.formatSections(s);
		s = this.formatSingleMarkers(s);
		s = this.formatBlockMarkers(s);

		s = this.formatPoems(s);
		s = this.formatDedications(s);
		s = this.formatSigns(s);
		s = this.formatInfo(s);
		s = this.formatAuthors(s);
		s = this.formatImages(s);
		s = this.formatInlineMarkers(s);

		s = this.formatQuotes(s);

		return s;
	},

	// escape some correct punctuation
	preformatAbbrStrings: function(s)
	{
		// т.н., т.е.
		s = s.replace(/(т)\.(н|е)\./gi, "$1\u200D.\u200D$2.\u200D");
		// т.нар.
		s = s.replace(/([ (])(т)\.(нар)\./gi, "$1$2\u200D.\u200D$3.\u200D");
		// г., ч., мин.
		s = s.replace(/ (г|ч|мин)\./gi, " $1\u200D.\u200D");
		// пр.н.е., сл.н.е.
		s = s.replace(/ (пр|сл)\.(н)\.(е)\./gi, " $1.\u200D$2.\u200D$3.\u200D");
		// пр.хр., сл.хр.
		s = s.replace(/ (пр|сл)\.(хр)\./gi, " $1.\u200D$2.\u200D");

		s = s.replace(/(вж|др|млн|млрд)\./gi, "$1.\u200D");

		// Бележки
		s = s.replace(/(б|бел)\.(а|ред|пр|прев)\./gi, "$1.\u200D$2.\u200D");

		// Инициали
		s = s.replace(/([\t ][АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЮЯ])\./g, "$1\u200D.\u200D");

		s = s.replace(/(\d[,.:\u2032\u2033])(\d)/g, "$1\u200D$2");

		// Почистване на двойни "празни" интервали
		s = s.replace(/\u200D\u200D/g, "\u200D");

		return s;
	},

	clearFakeSpaces: function(s)
	{
		return s.replace(/\u200D/g, "");
	},

	// Форматира заглавията и подзаглавията с удебелен шрифт
	formatTitles: function(s)
	{
		return s.replace(/([|#])\t(.+)/g, '<b class="marker">$1</b>\t<span class="title">$2</span>');
	},

	// Форматира секциите с удебелен шрифт, а маркерите - със сив текст
	formatSections: function(s)
	{
		return s.replace(/^(>+)\t(.+)/mg, '<b class="marker">$1</b>\t<span class="section">$2</span>');
	},

	// Форматира едноредовите маркери със сив текст
	formatSingleMarkers: function(s)
	{
		return s.replace(/([FN^])\t/g, '<b class="marker">$1</b>\t');
	},

	// Форматира многоредовите маркери със сив текст
	formatBlockMarkers: function(s)
	{
		return s.replace(/[ACEFLTM][>$]/g, '<b class="marker">$&</b>');
	},

	// Форматира стихотворенията с наклонен текст
	formatPoems: function(s)
	{
		return this.formatMultilineMarker(s, "P", "poem");
	},

	// Форматира посвещенията с наклонен шрифт
	formatDedications: function(s)
	{
		return this.formatMultilineMarker(s, "D", "dedication");
	},

	// Форматира табелките с удебелен текст
	formatSigns: function(s)
	{
		s = this.formatMultilineMarker(s, "S", "sign");
		return s.replace(/S\t(.+)/g, '<b class="marker">S</b>\t<span class="sign">$1</span>');
	},


	// Форматира информационния блок с наклонен текст
	formatInfo: function(s)
	{
		return this.formatMultilineMarker(s, "I", "info");
	},

	// Форматира авторите на текст с наклонен шрифт
	formatAuthors: function(s)
	{
		return s.replace(/(@{1,2})\t(.+)/g, '<b class="marker">$1</b>\t<span class="author">$2</span>');
	},


	// Форматира маркерите за картинки със сив цвят
	formatImages: function(s)
	{
		return s.replace(this.re("img"), '<span class="image">$&</span>');
	},


	formatInlineMarkers: function(s)
	{
		var inlines = ["e", "s", "sub", "sup", "del"];
		for (var i = 0, l = inlines.length; i < l; i++) {
			s = this.formatInlineMarker(s, inlines[i]);
		}

		return s;
	},

	// Форматира параграфен маркер със сив цвят
	formatInlineMarker: function(s, marker)
	{
		return s.replace(new RegExp("{/?"+marker+"}", "g"), '<span class="inmarker">$&</span>');
	},


	formatMultilineMarker: function(s, marker, className)
	{
		return s.replace(
			new RegExp(marker+">([\\s\\S]+?)"+marker+"\\$", "g"),
			'<b class="marker">'+marker + '&gt;</b><span class="'+className+'">$1</span><b class="marker">'+marker+'$</b>');
	},

	// Слага блокове за кавичките
	formatQuotes: function(s)
	{
		return s.replace(/«/g, '<cite>$&').replace(/»/g, '$&</cite>');
	},

	// Маркира всички съмнителни места
	hiliteFishyPlaces: function(s, incorrect)
	{
		s = "\n" + s + "\n";

		s = Replacer.normalizeNewLines(s);

		s = this.hiliteLatinChars(s);

		s = this.preformatAbbrStrings(s);

		s = this.hiliteChunks(s);

		s = this.hiliteProblemDigits(s);

		s = this.clearFakeSpaces(s);

		s = this.removeHilites(s);

		s = this.hiliteWords(s, incorrect);

		s = this.putRealMarkers(s);

		s = this.format(s);

		return s;
	},

	hiliteChunks: function(s)
	{
		// there can be false positives: skip poems, dedications, info, authors
		var skip1 = [this.mre("P"), this.mre("D"), this.mre("I"), this.ore("@")];
		// there can be false positives: above + titles, sections, signs
		var skip2 = skip1.concat([this.ore("\\|"), this.ore(">+"), this.ore("#"), this.ore("S"), this.mre("S")]);

		var regexps = [
			/—[^ \n]/g,                  // Дълго тире без интервал отзад
			/[^ \t>]—/g,                 // Дълго тире без интервал отпред
			/ {2,}/g,                    // Няколко поредни празни знака
			/[^\n|>ACEDFILPSTNM#@]\t/g,  // Табулатор не в началото
			/ \n/g,                      // Празен знак в края на реда
			/…\./g,                      // Точка след многоточие
			/\.\./g,                     // Две точки (слято)
			/\. \./g,                    // Две точки (разделени)
			/[^—] …/g,                   // Интервал пред многоточие
			/…[а-яА-Я]/g,                // Буква след многоточие
			/[«„(]_? /g,                 // Интервал след "отварящ" знак
			/ _?[.,!?;:»)]/g,            // Интервал преди "затварящ" знак и преп.знаци
			/,_/g,                       // Невалиден маркер след запетая

			// Препинателен знак без разделител
			/[!?][^ \x02»“)…_\n]/g,
			{search: /[,:][^ \u200D\x02»“)_\n]/g,   skip: this.re("img")},
			{search: /\.[^ \u200D\x02\x03\x04»“)_\n]/g, skip: this.re("img")},

			/\t_— [а-я]/g,               // Пряка реч с малка буква
			/\t— _?[а-я]/g,
			// Смесена кирилица-латиница и цифри, [036] се осветяват в hiliteProblemDigits
			/[a-zA-Z1245789][а-яА-Я]/g,
			/[а-яА-Я][a-zA-Z1245789]/g,
			/[а-я][А-Я]/g,               // Смесен регистър - малка-голяма
			/\t_?—[^ ]/g,                // Пряка реч без интервал след тирето
			/, — [А-Я]/g,                // Запетая преди пряка реч с главна
			/\. — [а-я]/g,               // Точка преди пряка реч с малка
			/-_? | _?-/g,                // Интервал около късо тире
			/['’] | ['’]/g,              // Интервал около апостроф
			/[.!?] [а-я]/g,              // Изречения с малка буква
			/[!?]… [а-я]/g,
			/…[!?] [а-я]/g,
			// /[а-яА-Я]…[а-яА-Я]/g,           // Многоточие между букви
			/[-—–] ?[-—–]/g,                                  // Две тирета
			/[а-яА-Яa-zA-Z]-[а-яА-Яa-zA-Z]+-[а-яА-Яa-zA-Z]/g, // Две тирета в дума
			/[ьЬ][^оО ,\.…!?]/g,         // "ер малък" без "о" отзад
			/\s_{1,2}\s/g,               // Интервали около маркер
			/\s{\/?e}\s/g,
			/\s{\/?s}\s/g,
			/^\t\d+$/gm,                 // Ред, съдържащ само числа
			/[^\t( _«][«„]/g,             // Лошо начало на кавички
			/[»“][а-яА-Я]/g,             // Лош край на кавички
			/^[^\t\n\x02\|>ACEDFILPSTNM#@]/gm, // Лошо начало на ред

			// Параграф с малка буква
			{search: /\t[а-я]/g, skip: this.re(skip1)},

			// Лошо начало на параграф
			{search: /\t[^[\x02\x04—«„(…_*А-ЯA-Z\d{]/g, skip: this.re(skip2)},
			// Лош край на параграф
			{search: /[^.!?»“):;…*_>$}\s\x01\x03\x05\u200D\]]$/gm, skip: this.re(skip2)},

			// Еднобуквени думи
			{search: /(\s)([бгджзклмнпртфхцчшщью])(?=[\s,.])/gi, replace: "$1\x02$2\x03"},

			// Некоректни знаци
			{search: /[¦~%"<>$|#@^]+/g, skip: /\n\S+(?=(\t|\n))|\{[^}]+\}/g},

			// Некоректни кавички и апострофи (\u2019\u201C\u201E removed)
			/[\u05F4\u201D\u2033\u2032\u201A\u2018\u2015]/g
		];

		for (var i = 0, l = regexps.length; i < l; i++) {
			s = this.hiliteText(s, regexps[i]);
		}

		return s;
	},

	// Често срещани некоректни думи
	hiliteWords: function(s, words)
	{
		for (var i = 0, l = words.length; i < l; i++) {
			s = this.hiliteWord(s, words[i]);
		}

		return s;
	},

	hiliteWord: function(s, word)
	{
		return s.replace(new RegExp("[ (]("+word+")(?=[\\s,.:;!?])", "g"), " \x02$1\x03");
	},

	hiliteText: function(s, pattern)
	{
		if ( ! pattern.search) {
			pattern = {search: pattern, replace: "\x02$&\x03"};
		} else if ( ! pattern.replace) {
			pattern.replace = "\x02$&\x03";
		}

		return Replacer.replaceWithSkip(s, pattern);
	},

	// Маркира всички латински знаци
	hiliteLatinChars: function(s)
	{
		return Replacer.replaceWithSkip(s, {
			search:  /([a-zA-Z]+)(?![>$\t])/g,
			replace: "\x04$1\x05",
			skip:    this.re("tag")
		});
		//return s.replace(/([^{:./a-z])([a-zA-Z]+)(?![>$\t])/g, '$1\x04$2\x05');
	},

	// Маркира проблемни цифри: 0, 3 и 6
	hiliteProblemDigits: function(s)
	{
		return Replacer.replaceWithSkip(s, {
			search:  /([036]+)(?![\d.,–-])/g,
			replace: "\x04$1\x05",
			skip:    this.re(
				[this.ore(">+"),
				"[\\s(/][\\d\\x02\\x03]{2,}[\\s)/]",
				"[1245789]\\d+",
				this._re["img"]])
		});
	},

	// Премахване маркировката на коректни комбинации
	removeHilites: function(s)
	{
		var patterns = [
			{search: "%", prefix: "\\d"},
			{search: " \\.", suffix: "\\d"},
			"\\.\\]", "\\.\\*",
			"!\\?", "!!", "\\?!",
			"г-н", "г-жа", "д-р"
			// these are probably not necessary
			//"«[бБгГдДжЖзЗкКлЛмМнНпПрРтТфФхХцЦчЧшШщЩьЬюЮ]»",
			//" [БГДЖЗКЛМНПРТФХЦЧШЩЬЮ]\\.",
			//"[бБгГдДжЖзЗкКлЛмМнНпПрРтТфФхХцЦчЧшШщЩьЬюЮ]\\.\u200D",
		];

		for (var i = 0, l = patterns.length; i < l; i++) {
			s = this.unhiliteText(s, patterns[i]);
		}

		s = this.unhiliteStammers(s);

		return s;
	},

	// Размаркира всички комбинации от заекване
	unhiliteStammers: function(s)
	{
		var stammers = [
			/*"[Аа]-а", "[Бб]-б", "[Вв]-в", "[Гг]-г", "[Дд]-д",
			"[Ее]-е", "[Жж]-ж", "[Зз]-з", "[Ии]-и", "[Кк]-к",
			"[Лл]-л", "[Мм]-м", "[Нн]-н", "[Оо]-о", "[Пп]-п",
			"[Рр]-р", "[Сс]-с", "[Тт]-т", "[Уу]-у", "[Фф]-ф",
			"[Хх]-х", "[Цц]-ц", "[Чч]-ч", "[Шш]-ш", "[Щщ]-щ",
			"[Юю]-ю", "[Яя]-я"*/
			"[Аа]-а-а", "[Бб]-б-б", "[Вв]-в-в", "[Гг]-г-г", "[Дд]-д-д",
			"[Ее]-е-е", "[Жж]-ж-ж", "[Зз]-з-з", "[Ии]-и-и", "[Кк]-к-к",
			"[Лл]-л-л", "[Мм]-м-м", "[Нн]-н-н", "[Оо]-о-о", "[Пп]-п-п",
			"[Рр]-р-р", "[Сс]-с-с", "[Тт]-т-т", "[Уу]-у-у", "[Фф]-ф-ф",
			"[Хх]-х-х", "[Цц]-ц-ц", "[Чч]-ч-ч", "[Шш]-ш-ш", "[Щщ]-щ-щ",
			"[Юю]-ю-ю", "[Яя]-я-я"
		];
		for (var i = 0, l = stammers.length; i < l; i++) {
			s = this.unhiliteText(s, stammers[i]);
		}

		return s;
	},

	unhiliteText: function(s, pattern)
	{
		var find = "", cnt = 1;
		if (typeof pattern == "string") {
			find = "\x02(" + pattern + ")\x03";
		} else {
			find = "\x02(" + pattern.search + ")\x03";
			if (pattern.prefix) {
				find = "(" + pattern.prefix + ")" + find;
				cnt++;
			}
			if (pattern.suffix) {
				find += "(" + pattern.suffix + ")";
				cnt++;
			}
		}

		var repl = "";
		for (var i = 1; i <= cnt; i++) {
			repl += "$" + i;
		}

		return s.replace(new RegExp(find, "g"), repl);
	},
/*
	unhiliteText: function(s, find, prefix, suffix)
	{
		find = "\x02("+find+")\x03";
		var cnt = 1;

		if (prefix !== undefined) {
			find = "(" + prefix + ")" + find;
			cnt++;
		}

		if (suffix !== undefined) {
			find += "(" + suffix + ")";
			cnt++;
		}

		var repl = "";
		for (var i = 1; i <= cnt; i++) {
			repl += "$" + i;
		}

		return s.replace(new RegExp(find, "g"), repl);
	},
*/
	// replace <mark> placeholders
	putRealMarkers: function(s)
	{
		s = this.fixMarkers(s);

		return s
			.replace(/\x02/g, "<mark>")
			.replace(/\x03/g, "</mark>")
			.replace(/\x04/g, '<mark class="latin">')
			.replace(/\x05/g, "</mark>");
	},

	// remove nested marks
	fixMarkers: function(s)
	{
		return s
			.replace(/\x02([^\x03]*)\x02/g, "\x02$1")
			.replace(/\x03([^\x02]*)\x03/g, "$1\x03")
			.replace(/\x05([ \d,:_/-]+)\x04/g, "$1");
	},

	// some special regular expressions as strings, backslashes should be escaped
	_re: {
		"img": "\\{img:[^}]+\\}",
		"tag": "\\{[^}]+\\}"
	},

	// build a block marker regular expression template
	mre: function(marker)
	{
		return marker + ">[\\s\\S]+?" + marker + "\\$";
	},
	// build a one-line marker regular expression template
	ore: function(marker)
	{
		return marker + "\\t.+";
	},

	// generate a regular expression
	re: function(s, flags)
	{
		flags = flags || "g";
		if (this._re[s]) {
			return new RegExp(this._re[s], flags);
		} else if (typeof s == "string") {
			return new RegExp(s, flags);
		} else { // array
			return new RegExp(s.join("|"), flags);
		}
	},

	compressSpaces: function(s)
	{
		return Replacer.replaceWithSkip(s, {
			search:  /  +/g,
			replace: " ",
			skip:    this.re([this.mre("F"), this.ore("F")])
		});
	},


	/**
	* Добавя табулатор пред всеки ред.
	* Коригира табулаторите пред наличните маркери.
	*/
	insertTabs: function(s)
	{
		// Базово вмъкване
		s = "\t" + s.replace(/\n/g, "\n\t");
		// Корекция на празен ред с табулатор
		s = s.replace(/\n\t\n/g, "\n\n");
		// Корекция на два последователни табулатора
		s = s.replace(/\n\t\t/g, "\n\t");
		// Корекция на редове с едноредови маркери
		s = s.replace(/\t([|#@FSN^]\t)/g, "$1");
		// Корекция на редове с блокови маркери
		s = s.replace(/\t([ACEDFILPSTM][>$]\n)/g, "$1");
		// Корекция на редове с нестандартни маркери
		s = s.replace(/\t@@\t/g, "@@\t");
		// Корекция на редове със секции
		s = s.replace(/\t(>+[\t\n])/g, "$1");

		return s;
	}

};
