/**
* Enables jumping back and forth through the markers
*/
var MarkViewer = {
	$marks: null,
	curMark: -1,

	packBags: function()
	{
		this.$marks = $("#output mark");

		if (this.isBadWeather()) {
			return false;
		}

		$("#marks-count").text(this.$marks.length);
		this.curMark = -1;

		return true;
	},

	isBadWeather: function()
	{
		return this.$marks.length == 0;
	},

	gotoPrev: function()
	{
		if (this.canGotoPrev()) {
			this.$marks.eq(this.curMark).removeClass("current");

			this.curMark--;
			this.gotoMark(this.curMark);
			ButtonHandler.enableNext();

			if ( ! this.canGotoPrev()) {
				ButtonHandler.disablePrev();
			}
		}
	},

	gotoNext: function()
	{
		if (this.canGotoNext()) {
			this.$marks.eq(this.curMark).removeClass("current");

			this.curMark++;
			this.gotoMark(this.curMark);
			if (this.canGotoPrev()) {
				ButtonHandler.enablePrev();
			}

			if ( ! this.canGotoNext()) {
				ButtonHandler.disableNext();
			}
		}
	},

	canGotoPrev: function()
	{
		return this.curMark > 0;
	},

	canGotoNext: function()
	{
		return this.curMark < this.$marks.length - 1;
	},

	gotoMark: function(id)
	{
		var $mark = this.$marks.eq(id);
		$mark.addClass("current");
		$("#current-mark").text(parseInt(id) + 1);
		$("#current-mark-text").text($mark.text());
		$("#current-mark-raw").remove();
		location.href = "#mark-"+id;
		scrollTo($mark);
		if (this.curMark == 0 && ! $("#navi").hasClass("navi-top")) {
			this.initMarkNavigation();
		}
	},

	initMarkNavigation: function()
	{
		$("#navi").addClass("navi-top");
		$("#current-mark-text")
			.show()
			.hover(function(){
				if ( ! $("#current-mark-raw").length) {
					$('<span id="current-mark-raw"/>')
						.text( getRawText($(this).text()) )
						.appendTo(this);
				}
			});
	},

	showIndex: function()
	{
		$("#navi").after(this.buildIndex());
		$("#mark-index").tablesorter();
		this.enableIndexLinks();
		this.enableIndexHover();
		$("#mark-index-button").hide();
	},

	buildIndex: function()
	{
		var viewer = this;
		this.initIndex();
		var ind = '<table id="mark-index"><caption>Показалец на маркировките</caption><thead><tr><th class="index-text">Текст</th><th title="Брой срещания">#</th><th class="index-marks">Маркировки</th></tr></thead><tbody>';
		$.each(this.index, function(text, data){
			var links = "";
			$.each(data.items, function(i, item){
				links += '<li><a id="ml-'+item+'" href="#mark-'+item+'">'+(item+1)+'</a></li>';
			});
			ind += '<tr><td><mark class="'+data.className+'">'+text+'</mark></td><td>'+data.items.length+'</td><td><ul>'+links+'</ul></td></tr>';
		});
		ind += '</tbody></table>';

		return ind;
	},

	enableIndexLinks: function()
	{
		var viewer = this;
		$("#mark-index").delegate("a", "click", function(){
			viewer.gotoMark(this.id.replace(/\D/g, ""));
		});
	},

	enableIndexHover: function()
	{
		var viewer = this;
		$("#mark-index").delegate("a", "hover", function(){
			if (this.id[0] != "_") {
				viewer.initIndexTooltip(this);
				this.id = "_" + this.id;
			}
		});
	},

	initIndexTooltip: function(link)
	{
		var maxContext = 30;
		var elm = this.$marks.get(link.id.replace(/\D/g, ""));
		var prev = elm.previousSibling ? maxstr(elm.previousSibling.textContent, maxContext, "right") : "";
		var next = elm.nextSibling ? maxstr(elm.nextSibling.textContent, maxContext) : "";
		var mark = '<mark class="'+elm.className+'">'+ elm.textContent +'</mark>';
		$(link).simpletip({
			content: $.trim(prev + mark + next).replace(/\n/g, "<br>"),
			showEffect: "none",
			hideEffect: "none",
			position: ["30", "-30"]
		});
		$(link).simpletip().show();
	},

	index: {},
	initIndex: function()
	{
		var viewer = this;
		this.$marks.each(function(i, elm){
			var text = elm.textContent;
			elm.id = "mark-" + i;
			if ( ! viewer.index[text] ) {
				viewer.index[text] = { items: [], className: elm.className };
			}
			viewer.index[text].items.push(i);
		});
	},

	clear: function()
	{
		$("#current-mark").text("—");
		$("#current-mark-text").hide();
		$("#mark-index").remove();
		$("#mark-index-button").show();
		this.index = {};
	}
};


/**
* Handles key shortcuts for MarkViewer
*/
var KeyHandler = {
	p: function() { MarkViewer.gotoPrev(); return false; },
	n: function() { MarkViewer.gotoNext(); return false; },
	bindArrows: function()
	{
		$(document).bind('keydown', 'left', this.p).bind('keydown', 'right', this.n);
		return this;
	},
	unbindArrows: function()
	{
		$(document).unbind('keydown', this.p).unbind('keydown', this.n);
		return this;
	},
	bindAltArrows: function()
	{
		$(document).bind('keydown', 'ctrl+left', this.p).bind('keydown', 'ctrl+right', this.n);
		return this;
	},
	unbindAltArrows: function()
	{
		$(document).unbind('keydown', this.p).unbind('keydown', this.n);
		return this;
	}
};


var ButtonHandler = {
	enablePrev: function() { this.enable(this.getPrev()) },
	enableNext: function() { this.enable(this.getNext()) },
	disablePrev: function() { this.disable(this.getPrev()) },
	disableNext: function() { this.disable(this.getNext()) },

	setWorking: function(button, isWorking)
	{
		if (isWorking === undefined || isWorking) {
			$(button).attr("disabled", "disabled").addClass("working");
		} else {
			$(button).removeAttr("disabled").removeClass("working");
		}
	},

	done: function(button)
	{
		this.setWorking(button, false);
		$(button).addClass("done");
	},

	enable: function(button) {
		$(button).removeAttr("disabled");
	},
	disable: function(button) {
		$(button).attr("disabled", "disabled");
	},
	_p: null, _n: null,
	getPrev: function() {
		return this._p || (this._p = $("#prev-button"));
	},
	getNext: function() {
		return this._n || (this._n = $("#next-button"));
	}
};

/**
* Takes care of input/output fields.
* Possibly some generic edit functions will come.
*/
var Editor = {
	getInput: function()
	{
		return $("#input").val();
	},
	setInput: function(input)
	{
		this.saveInput(input);
		return $("#input").val(input);
	},
	saveInput: function(input)
	{
		localStorage.input = input;
	},
	setInputIfSaved: function()
	{
		var input = localStorage.input;
		if (input) {
			this.setInput(input);
		}
	},
	clearInput: function()
	{
		this.setInput("");
		localStorage.removeItem("input");
		return this;
	},

	getIncorrectForms: function()
	{
		return $("#incorrect").val().replace(/\s*,\s*/g, ",").split(",");
	},
	getOutput: function()
	{
		// <br>s get stripped by text() below, so turn them into new lines
		$("#output").html($("#output").html().replace(/<br>/g, "\n"));

		return $("#output").text();
	},
	setOutput: function(output)
	{
		this.initOutputBox();
		$("#output").html(output);
	},

	init: function()
	{
		this.setInputIfSaved();
		this.initDropBox();
	},

	initOutputBox: function()
	{
		if ( ! $("#output-box").length ) {
			$("#input-box").after('<div id="output-box"><div id="navi">\
			<div id="message">Маркировка <span id="current-mark">—</span> (от <span id="marks-count">0</span>)</div>\
			<ul>\
				<li><button id="prev-button" onclick="MarkViewer.gotoPrev()">&larr; Предишна</button></li>\
				<li><button id="next-button" onclick="MarkViewer.gotoNext()">Следваща &rarr;</button></li>\
			</ul>\
			</div>\
			<div><button id="mark-index-button" onclick="MarkViewer.showIndex()">Показалец на маркировките</button></div>\
			<div id="edit-buttons">\
				<button id="edit-button" onclick="Editor.toggleEditable()">Редактиране</button>\
				<button id="save-button" onclick="Editor.saveOutput()">Запис</button>\
				<button id="save-button" onclick="Editor.saveToFile()">Запис във файл</button>\
				<button id="copy-button" onclick="Editor.copyToClipboard()" style="display:none">To clipboard</button>\
			</div>\
			<div id="current-mark-text"></div>\
			<pre id="output"></pre></div>');
		} else {
			$("#output-box").show();
		}
	},

	hideOutputBox: function()
	{
		$("#output-box").hide();
		return this;
	},

	initDropBox: function()
	{
		var dropbox = document.body;
		dropbox.addEventListener("dragenter", stopEvent, true);
		dropbox.addEventListener("dragover", stopEvent, true);
		dropbox.addEventListener("drop", function(e) {
			stopEvent(e);
			Editor.loadLocalFile(e.dataTransfer.files);
		}, true);
	},

	toggleEditable: function()
	{
		var $o = $("#output");
		if ( ! $o.attr("contenteditable") || $o.attr("contenteditable") == "false" ) {
			$o.attr("contenteditable", true).focus();
			KeyHandler.unbindArrows().bindAltArrows();
			$o.bind("keydown", this.disableTab);
			//$("#copy-button").show();
		} else {
			$o.attr("contenteditable", false);
			KeyHandler.unbindAltArrows().bindArrows();
			//$("#copy-button").hide();
		}
	},

	copyToClipboard: function()
	{
		document.execCommand("selectAll", false, null);
		document.execCommand("copy", false, null);
	},

	loadLocalFile: function(files)
	{
		ButtonHandler.disable("#action-buttons button");
		ButtonHandler.setWorking("#file-input button", true);
		var reader = new FileReader();
		reader.onload = function(evt) {
			$("#input").val(evt.target.result);
			ButtonHandler.setWorking("#file-input button", false);
			ButtonHandler.enable("#action-buttons button");
			$("#replace-box button.done").removeClass("done");
		};
		reader.readAsText(files[0], "utf8");
	},

	TABKEY: 9,
	disableTab: function(e)
	{
		if (e.keyCode == Editor.TABKEY) {
			Editor.insertAtCaret(this, "\t"),
			stopEvent(e);
			return false;
		}
	},

	insertAtCaret: function(field, text)
	{
		if (field.value) {
			this.insertAtCaretTextarea(field, text);
		} else if (field.contentEditable) {
			this.insertAtCaretEditable(text);
		}
	},

	insertAtCaretTextarea: function(field, text)
	{
		var pos = field.selectionStart;
		field.value = field.value.substring(0, pos) + text + field.value.substring(pos, field.value.length);
		field.selectionStart = field.selectionEnd = pos + text.length;
	},

	insertAtCaretEditable: function(text)
	{
		document.execCommand("insertHTML", false, text);
	},

	saveOutput: function()
	{
		this.setInput(this.getOutput());
	},

	saveToFile: function()
	{
		location.href = "data:application/octet-stream;base64," + Base64.encode(this.getOutput());
	},

	clearOutput: function()
	{
		$("#output").empty();
		this.hideOutputBox();
		return this;
	},

	clear: function()
	{
		this.clearInput().clearOutput();
	},

	replace: function(type, button)
	{
		ButtonHandler.setWorking(button);
		var worker = new Worker("js/replace_worker.js");

		var ed = this;
		worker.onmessage = function(e){
			ed.setInput(e.data);
			ButtonHandler.done(button);
		};

		worker.postMessage(type);
		worker.postMessage(this.getInput());
	}

};


var RemoteFile = {
	save: function(button)
	{
		var contents = $("#input").val();
		if (contents == "") {
			return;
		}
		if ( ! this.checkOnline()) {
			return;
		}
		var file = $("#localfile").val() || "untitled-"+(new Date().getTime())+".sfb";
		file = prompt("Име на файла:", file);
		if (file === null) {
			return;
		}
		ButtonHandler.setWorking(button, true);
		var handler = this;
		$.post("put", {f: file, c: contents}, function(sfile){
			this.storeFile(sfile, new Date());
			handler.append(sfile);
			ButtonHandler.setWorking(button, false);
		});
	},

	append: function(file)
	{
		$("#remote-files").append(this.buildItem(file));
		this.showList();
	},

	tryRemove: function(button, file)
	{
		if (this.checkOnline()) {
			if ( confirm("Ще изтриете файла „"+file+"“ от сървъра.") ) {
				this.remove(button, file);
			}
		}
	},

	remove: function(button, file)
	{
		ButtonHandler.setWorking(button, true);
		$.post("delete", {f: file}, function(data){
			this.unstoreFile(file);
			$(button).parents("li").remove();
		});
	},

	showListIfAny: function()
	{
		if (this.hasStoredFiles()) {
			this.showList();
		}
	},

	showList: function()
	{
		if ( ! $("#remote-files").length) {
			$("#input-box").after(this.buildList());
		}
	},

	buildList: function()
	{
		var files = this.getList();
		var s = '<h2>Записани файлове</h2>';
		s += '<ul id="remote-files">';
		for (var i = 0, l = files.length; i < l; i++) {
			s += this.buildItem(files[i]);
		}
		s += '</ul>';

		return s;
	},

	buildItem: function(file)
	{
		return '<li><a href="custom-'+file+'">'+file+'</a> <button class="delete" onclick="RemoteFile.tryRemove(this, \''+file+'\')"><span>Изтриване</span></button></li>';
	},

	getList: function()
	{
		var list = [];
		for (var i in this.getStoredFiles()) {
			list.push(i);
		}

		return list;
	},

	checkOnline: function()
	{
		if ( navigator.onLine) {
			return true;
		}

		alert("Няма връзка към Мрежата.");
		return false;
	},

	_storeKey: "_storedFiles",

	storeFile: function(file, content)
	{
		var files = this.getStoredFiles;
		files[file] = content;
		localStorage.setObject(this._storeKey, files);
	},

	unstoreFile: function(file)
	{
		var files = this.getStoredFiles;
		delete(files[file]);
		localStorage.setObject(this._storeKey, files);
	},

	getStoredFiles: function(file, content)
	{
		var files = localStorage.getObject(this._storeKey);
		if (files === null) {
			files = {};
			localStorage.setObject(this._storeKey, files);
		}

		return files;
	},

	hasStoredFiles: function()
	{
		return this.getStoredFiles() == {};
	}

};



function hilite()
{
	ButtonHandler.setWorking("#hilite-button", true);
	var worker = new Worker("js/hilite_worker.js");

	worker.onmessage = function(e){
		var output = e.data;
		//output = output.replace(/</g, "&lt;").replace(/>/g, "&gt;");
		Editor.clearOutput();
		MarkViewer.clear();
		Editor.setOutput(output);
		ButtonHandler.disablePrev();
		if ( ! MarkViewer.packBags() ) {
			ButtonHandler.disableNext();
		}
		ButtonHandler.setWorking("#hilite-button", false);
	};

	var msg = {
		sfbText:         Editor.getInput(),
		incorrectForms:  Editor.getIncorrectForms()
	};
	if ( ! $.browser.mozilla) {
		msg = JSON.stringify(msg);
	}
	worker.postMessage(msg);
}

function getRawText(s)
{
	var r = [];
	for (var i = 0, l = s.length; i < l; i++) {
		r.push("#" + s.charCodeAt(i));
	}

	return r.join(" ");
}

function maxstr(s, maxlength, dir)
{
	if (s.length <= maxlength) {
		return s;
	}

	switch (dir) {
		case "right": return '…' + s.substr(s.length - maxlength);
		default:      return s.substr(0, maxlength) + '…';
	}
}

function stopEvent(event)
{
	event.preventDefault();
	event.stopPropagation();
}


function scrollTo(elm)
{
	elm = elm || location.hash;
	var $elm = $(elm);
	if ($elm.length) {
		$("html,body").animate({scrollTop: $elm.offset().top - 100}, 500);
	}
}


Storage.prototype.setObject = function(key, value) {
	this.setItem(key, JSON.stringify(value));
};

Storage.prototype.getObject = function(key) {
	return JSON.parse(this.getItem(key));
};

$(function(){
	$(document).bind('keydown', 'alt+x', hilite);
	//window.onhashchange = scrollTo;
	KeyHandler.bindArrows();
	Editor.init();
	RemoteFile.showListIfAny();

	var $input = $("#input");
	//$input.bind("keydown", Editor.disableTab);
	if ($input.val() == "") {
		$input.focus();
	} else {
		hilite();
	}

	$(".collapsible legend").click(function(){
		$(this).parent().toggleClass("collapsed").end().next().toggle();
	}).trigger("click");
});
