module("Base check");

test("markFishyQuotes", function() {
	var strings = {
		// missing closing quote, with some real quotes
		'Няма затваряща „кавичка.\n>	Заглавие\n	Правилни „кавички“.':
		'Няма затваряща <mark>„</mark>кавичка.\n>	Заглавие\n	Правилни „кавички“.',

		// missing closing quote in first section; missing closing quote in second one
		'Няма затваряща „кавичка.\n>	Заглавие\n	Няма отваряща кавичка“.':
		'Няма затваряща <mark>„</mark>кавичка.\n>	Заглавие\n	Няма отваряща кавичка<mark>“</mark>.',

		// missing opening quote
		'Няма отваряща кавичка“.':
		'Няма отваряща кавичка<mark>“</mark>.',

		// missing quotes
		'Няма oтваряща“. Няма „затваряща.':
		'Няма oтваряща<mark>“</mark>. Няма <mark>„</mark>затваряща.',

		// no errors
		'Първи „кавички“, втори „кавички“, трети „кавички“.':
		'Първи „кавички“, втори „кавички“, трети „кавички“.',

		// nested, no errors
		'Интересни „вътрешни „кавички““.':
		'Интересни „вътрешни „кавички““.',

		// nested, missing closing quote
		'Интересни „вътрешни „кавички“.':
		'Интересни <mark>„</mark>вътрешни „кавички“.',
	};

	expect(strings.length);
	for (var i in strings) {
		equals( QuoteChecker.markFishyQuotes(i), strings[i], "Проверка на кавички" );
	}
});
