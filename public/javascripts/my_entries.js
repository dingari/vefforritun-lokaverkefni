document.addEventListener('DOMContentLoaded',function() {
  console.log('DOM loaded');
  MyList.init();
});

var MyList  = (function() {

	// "Global" variables in this scope
	var g_saveButton = document.querySelector('button#save');
	var g_deleteButton = document.querySelector('button#delete');
	var g_reverseButton = document.querySelector('button#reverse');
	var g_stripButton = document.querySelector('button#strip');

	var g_listContainer = document.getElementsByClassName('saved-entries')[0];
	var g_listItems = document.getElementsByClassName('entrylist-item');
	var g_form = document.getElementById('form');
	var g_charCount = document.getElementById("character-count");
	var g_wordCount = document.getElementById("word-count");

	var g_selectedId, g_prevSelectedId;

	////////////////////////
	/// EVENT LISTENERES ///
	////////////////////////

	// g_reverseButton.addEventListener('click', function(e) {
	// 	var values = formValues(g_form);
	// 	var title = values['title'];
	// 	var content = values['content'];

	// 	updateForm(g_form, title, reverseString(content));
	// });

	// g_stripButton.addEventListener('click', function(e) {
	// 	var values = formValues(g_form);
	// 	var title = values['title'];
	// 	var content = values['content'];

	// 	updateForm(g_form, title, content.replace(/<[^>]+>/ig, ''));
	// })

	g_saveButton.addEventListener('click', function(e) {
		e.preventDefault();

		// Get the content
		var values = formValues(g_form);
		var titleText = values['title'];
		var content = values['content'];

		var url = location.protocol + '//' + location.host 
			+ '/entries/my_entries';

		var id = $('entrylist-item.active').attr('id');

		}

		$.ajax({
			type: 'POST',
			data: {
				id: id, 
				title: titleText, 
				content: content,
				getList: false},
			url: url
		})
			.done(function(res) {
				console.log("done", res);

				$('entrylist-item').removeClass('active');

				if($('#' + res.id).length === 0) {
					var a = $('<a />', {
						id: res.id,
						href: '#',
						class: 'list-group-item entrylist-item'
					})
						.attr('dataset-title', res.title)
						.attr('dataset-date', res.date)
						.attr('dataset-content', JSON.stringify(res.content));

					var p = $('<p></p>', {class: 'text-left'})
						.append(res.date);
					var h = $('<h4></h4>', {class: 'text-left'})
						.append(res.title);

					a.append(p).append(h);

					$('.saved-entries').prepend(a);
				}

				$('#' + res.id).addClass('active');
				$('#' + res.id).click(itemClick);
			})
			.fail(function() {
				console.log("AAH SOMETHING WENT TERRIBLY WRONG!!!")
			});
	});

	g_deleteButton.addEventListener('click', function(e) {
		//e.preventDefault();
		// if(!e.currentTarget.classList.contains("disabled"))
		// 	removeListItem(g_selectedId);
	});

	/*
	g_form.addEventListener('keyup', function(e) {
		updateCounters(formValues(g_form)['content']);
	})
*/

	function itemClick() {
		$('a.entrylist-item').removeClass('active');
		$(this).addClass('active');

		$('#title').attr('value', $(this).attr('dataset-title'));

		var content = $(this).attr('dataset-content');
		$('#content').html(JSON.parse(content).content);
	}

	//////////////////////
	/// MAIN FUNCTIONS ///
	//////////////////////

	function init() {
		$('.entrylist-item').attr('href', '#');
		$('a.entrylist-item').click(itemClick);
	}

	function updateAndSave() {
		return;

		var items = [];
		
		for(var i=0; i<g_listItems.length; i++) {
			var title = g_listItems[i].dataset.title;
			var date = g_listItems[i].dataset.date;
			var content = g_listItems[i].dataset.content;

			items.push({
				title : title,
				date : date,
				content : content
			});
		}

		if(items.length == 0)
			localStorage.removeItem('items');
		else
			localStorage.setItem('items', JSON.stringify(items));

		var a, title, content;

		// If we don't have anything in the list we
		// have to take care of some stuff
		if(g_listItems.length == 0) {
			var nothing = el('h4', 'list-nothing text-center', 'Ekkert í listanum');
			g_listContainer.appendChild(nothing);
			g_deleteButton.classList.add('disabled');
			title = "";
			content = "";
		}
		else {
			a = document.getElementById(g_selectedId);
			title = a.dataset.title;
			content = a.dataset.content;
		}

		updateCounters(content);
		updateForm(g_form, title, content);
	}

	function addListItem(titleText, dateText, content) {
		if(!validateTitle(titleText)) {
			console.log("That title already exists");
			return;
		}

		// If we add to an empty list we must remove the text
		// saying there's nothing in the list
		if(g_listContainer.querySelector('.list-nothing'))
			g_listContainer.removeChild(g_listContainer.firstChild);

		var a = el('a', 'list-group-item entrylist-item', '');
		var date = el('p', 'text-left', dateText);
		var title = el('h4', 'text-left', titleText);

		a.appendChild(date);
		a.appendChild(title);

		// Other attributes
		a.href = '#';
		a.id = titleText;
		a.dataset.title = titleText;
		a.dataset.date = dateText;
		a.dataset.content = content;

		g_listContainer.appendChild(a);

		moveToTop(a);
		setActive(a);

		// We just add an event listener to the item we just created
		// and is now at the top (first child node)
		g_listItems[0].addEventListener('click', function(e) {
			setActive(e.currentTarget);
			updateAndSave();
		});

		// We now know that we have something in the list so we should
		// be able to delete it
		g_deleteButton.classList.remove('disabled');
		updateAndSave();
		return document.getElementById(titleText) !== null;
	}

	function removeListItem(id) {
		var toRemove = document.getElementById(id);
		var nextNode;

		if(toRemove.nextSibling !== null)
			nextNode = toRemove.nextSibling;
		else
			nextNode = toRemove.previousSibling;

		toRemove.parentNode.removeChild(toRemove);

		// We have to take care of some stuff if we
		// just deleted the last item in the list
		if(nextNode === null) {
			g_selectedId = undefined;
			g_prevSelectedId = undefined;
		}
		else
			setActive(nextNode);

		updateAndSave();

		return document.getElementById(id) === null;
	}

	function editItem(title, date, content) {
		var a = document.getElementById(title);
		if(a !== null) {
			a.dataset.title = title;
			a.dataset.date = date;
			a.dataset.content = content;

			a.firstChild.textContent = date;
		}
	}

	// Creates an element with given name, class (optional)
	// and text (optional)
	function el(elementName, className, text) {
		var e = document.createElement(elementName);

		if(className)
			e.className = className;

		if(text)
			e.appendChild(document.createTextNode(text));

		return e;
	}

	// Counts the words and charaters in the given content string
	// and updates the counters on the site
	// A word can be any set of characters seperated by any number 
	// of whitespace characters
	// All characters counted except whitespace
	function updateCounters(content) {
		var words, chars;
		if(content) {
			words = content.match(/\S+/ig).length;
			chars = content.match(/\S/ig).length;
		}
		else {
			words = 0;
			chars = 0;
		}

		g_wordCount.textContent = words;
		g_charCount.textContent = chars;

		return (g_wordCount.textContent === ""+words && g_charCount.textContent === ""+chars);
	}

	function updateForm(form, title, content) {
		var inputs = form.getElementsByTagName('input');
		var textareas = form.getElementsByTagName('textarea');

		inputs[0].value = title;
		textareas[0].value = content;
	}


	//////////////////////
	/// MISC FUNCTIONS ///
	//////////////////////

	function createErrorMessage(message) {
		var div = el("div", "alert alert-danger error-message", "");
		var icon = el("span", "glyphicon glyphicon-exclamation-sign", "");
		var text = el("span", "sr-only", "Error: ");

		div.role="alert";

		div.appendChild(icon);
		div.appendChild(text);
		div.appendChild(document.createTextNode(message));

		return div;
	}

	function moveToTop(node) {
		node.parentNode.insertBefore(node, node.parentNode.firstChild);
	}

	function setActive(node) {
		g_prevSelectedId = g_selectedId;
		g_selectedId = node.id;

		if(g_selectedId === g_prevSelectedId)
			return;

		node.classList.add('active');
		var prev = document.getElementById(g_prevSelectedId);
		if(prev !== null)
			prev.classList.remove('active');
	}

	function formValues(form) {
		var values = {};
		var inputs = form.getElementsByTagName('input');
		var textareas = form.getElementsByTagName('textarea');

		values[inputs[0].name] = (inputs[0].value).trim();
		values[textareas[0].name] = textareas[0].value;

		return values;
	}

	// The title should be unique and not empty
	function validateTitle(str) {
		if(str === "")
			return false;

		for(var i=0; i< g_listItems.length; i++) {
			if(str === g_listItems[i].id)
				return false;
		}

		return true;
	}

	function reverseString(str) {
		for (var i = str.length - 1, o = ''; i >= 0; o += str[i--]) { }
		return o;
	}

	// Return an object API with methods to initialize 
	// an instance and add/remove items
	return {
    	init : init,
    	add : addListItem,
    	remove : removeListItem
  	};

})();