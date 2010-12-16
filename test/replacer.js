module("Quotes");

test("simplifyQuotes", function() {
	equals( Replacer.simplifyQuotes("«»„“”"), '"""""', "simplifyQuotes" );
});

test("replaceQuotes", function() {
	var strings = {
		'""Вътрешни" кавички"' :
			'„„Вътрешни“ кавички“',
		'\t""Вътрешни" кавички"' :
			'\t„„Вътрешни“ кавички“',
		'"Текст с "вътрешни" кавички"' :
			'„Текст с „вътрешни“ кавички“',
		'"Текст с "крайни кавички"" оле' :
			'„Текст с „крайни кавички““ оле',
		'Текст с _"кавички"_.' :
			'Текст с _„кавички“_.',
		'"_Акцент_ има"' :
			'„_Акцент_ има“',
		'Текст с _"кавички"_. _"Текст."_' :
			'Текст с _„кавички“_. _„Текст.“_',
		'"""Вътрешни" кавички" кавички"' :
			'„„„Вътрешни“ кавички“ кавички“',
		'"Текст с "много "вътрешни" кавички" оле"' :
			'„Текст с „много „вътрешни“ кавички“ оле“',
		'"Предайте й: "Девойко… попита: „Защо?“ — кажи й: „…“"" оле' :
			'„Предайте й: „Девойко… попита: „Защо?“ — кажи й: „…“““ оле',
		'пон _„ма“_ често „Пре“, „пон _"ма"_ все.“' :
			'пон _„ма“_ често „Пре“, „пон _„ма“_ все.“',
		'_""Лейк Сентрал" се движи ..."_' :
			'_„„Лейк Сентрал“ се движи ...“_',
		'_„Моля "Транс", заминаващи "флотилия"…"_ _"… всички, моля, изход 47.“_' :
			'_„Моля „Транс“, заминаващи „флотилия“…“_ _„… всички, моля, изход 47.“_',
		'„Предишното _«Quo peregrinatur»_ наместник.“' :
			'„Предишното _„Quo peregrinatur“_ наместник.“',
		'«Десетдневния "Ако те използуват "мръсно" оръжие… живо същество»."' :
			'„Десетдневния „Ако те използуват „мръсно“ оръжие… живо същество“.“',
		'{e}"Коя е най-добрата?"{/e}' :
			'{e}„Коя е най-добрата?“{/e}',
		'("Скоби"), ["Скоби"], {"Скоби"}' : '(„Скоби“), [„Скоби“], {„Скоби“}',
		'"запетая", ' : '„запетая“, ',
		'"точка". ' : '„точка“. ',
		'"двоеточие": ' : '„двоеточие“: ',
		'"точка и запетая"; ' : '„точка и запетая“; ',
		'"удивителен"! ' : '„удивителен“! ',
		'"въпросителен"? ' : '„въпросителен“? ',
		'"многоточие"… ' : '„многоточие“… ',
		'"звезда"* ' : '„звезда“* ',
		'"тире"-то': '„тире“-то'
	};

	expect(strings.length);
	for (var i in strings) {
		equals( Replacer.replaceQuotes(i), strings[i], "Заместване" );
	}
});

module("Dashes");

test("replaceDashes", function() {
	var strings = {
		"Бая дълго тире: става на тире": ["ин ― ян", "ин — ян"],
		"Дефис между цифри": ["4-5", "4–5"],
		"Дефис между числа със запетая": ["4,5-5,5", "4,5–5,5"],
		"Дефис с интервали между цифри": ["4 - 5", "4–5"],
		"Дефис между римски цифри": ["I-II, V-VI, X-XI", "I–II, V–VI, X–XI"],
		"Дефис с интервали между букви": ["той - тя", "той — тя"],
		"Дефис с интервал в края на ред": ["тогава -\nкогато", "тогава —\nкогато"],
		"Дефис с интервал в началото на ред": ["\t- Начало", "\t— Начало"],
		"Изтриване на тирета за пренос": ["Има­ло ед­но вре¬ме.", "Имало едно време."]
	};

	expect(strings.length);
	for (var i in strings) {
		equals( Replacer.replaceDashes(strings[i][0]), strings[i][1], i );
	}
});
