document.addEventListener('DOMContentLoaded',function() {
  console.log('DOM loaded');
  MyList.init();
});

var MyList  = (function() {

	function saveClick(e) {
		e.preventDefault();

		var url = location.protocol + '//' + location.host 
			+ '/entries/my_entries';

		var id = $('.entrylist-item.active').attr('id');

		var titleText = $('#title').val();
		var content = {};
		var isList = false;

		// We have a list
		if($('.checklist-box').length > 0) {
			isList = true;
			var values = [];
			var checked = [];
			var i = 0;
			$.each($('.checklist-item.list'), function() {
				var check = ($(this).attr('data-checked') === 'true') ? true : false;
				var value = $(this).find('.content').val();

				if(checked !== undefined && checked !== null) {
					values[i] = value;
					checked[i] = check;

					i++;
				}
			});

			content.content = values;
			content.checked = checked;
		} else {
			content.content = $('#content').val();
		}

		console.log('send', JSON.stringify(content))

		$.ajax({
			type: 'POST',
			data: {
				id: id, 
				title: titleText, 
				content: JSON.stringify(content),
				isList: isList,
				getList: false},
			url: url
		})
			.done(function(res) {
				console.log("done", res);

				$('.entrylist-item').removeClass('active');

				// Make it if it doesn't exist
				if($('#' + res.id).length === 0) {
					var a = $('<a />', {
						id: res.id,
						href: '#',
						class: 'list-group-item entrylist-item'
					});

					var p = $('<p></p>', {class: 'text-left'});
					var s = $('<span></span>', {class: 'glyphicon list-icon'});
					var h = $('<h4></h4>', {class: 'text-left'});

					a.append(p).append(s).append(h);

					$('.saved-entries').prepend(a);
				} 

				var type, icon;
				if(res.content.checked) {
					type = 'list';
					icon = 'glyphicon-th-list';
				} else {
					type = 'memo';
					icon = 'glyphicon-pencil';
				}

				$('#' + res.id)
					.attr('data-title', res.title)
					.attr('data-date', res.date)
					.attr('data-content', JSON.stringify(res.content))
					.addClass(type)
					.addClass('active')
					.find('.glyphicon').addClass(icon);

				console.log('response', res.content)

				$('#' + res.id + ' p').html(res.date);
				$('#' + res.id + ' h4').html(res.title);
			})
			.fail(function() {
				console.log("AAH SOMETHING WENT TERRIBLY WRONG!!!")
			});
	}

	function deleteClick(e) {
		e.preventDefault();
		// if(!e.currentTarget.classList.contains("disabled"))
		// 	removeListItem(g_selectedId);

		var url = location.protocol + '//' + location.host + '/entries/delete';
		var id = $('.entrylist-item.active').attr('id');

		if(!id) {
			return;
		}
		$.ajax({
			type: 'POST',
			data: {id: id, getList: false},
			url: url
		})
			.done(function(response) {
				console.log("done", response);

				var next = $('#' + response.id).next();
				if(next.length === 0) {
					next = $('#' + response.id).prev();
				}

				next.addClass('active');
				$('#' + response.id).remove();
			})
			.fail(function() {
				console.log('Delete failed');
			});
	}

	function itemClick() {
		console.log('click')
		$('a.entrylist-item').removeClass('active');
		$(this).addClass('active');

		$('#title').val($(this).attr('data-title'));

		var content = $(this).attr('data-content');

		content = JSON.parse(content);

		console.log(content)

		if(!content.checked) {
			createTextarea(content);

		} else {
			createChecklist(content);
		}
	}

	function checkClick(e) {
		e.preventDefault();

		console.log('check-click', this);

		var item = $(this).closest('.checklist-item');
		var checked = ($(item).attr('data-checked') === 'true') ? true : false;
		$(item).remove();

		console.log(checked)

		$(item).attr('data-checked', !checked)

		if(!checked) {
			$('.checked ul').prepend(item);
		} else {
			$('.unchecked ul').prepend(item);
		}
	}

	function newCheckitemClick(e) {
		e.preventDefault();

		console.log('foo')

		var value = $('.new-item').val();

		var self = $(this).closest('li');
		$(self).remove();

		var li = createChecklistItem(null, value, false);

		$('.unchecked ul').append(li);
		$('.unchecked ul').append(self);
		$('.unchecked .new-item').val('').focus();

	}

	function createChecklist(content) {
		console.log("making da list");

		var ulChecked = $('<ul></ul>');
		var ulUnchecked = $('<ul></ul>');

		for(var i in content.checked) {
			var li = createChecklistItem(i, content.content[i], content.checked[i]);

			if(!content.checked[i]) {
				ulUnchecked.append(li);
			} else {
				ulChecked.append(li);
			}
		}

		ulUnchecked = $(ulUnchecked).append(
			$('<li></li>', {class: 'checklist-item'}).append(
				$('<form></form>', {action: '/entries/my_entries?list=true'})
				.append(
					$('<span></span>', {class: 'glyphicon glyphicon-plus'})
					.append(
						$('<button></button>', {
							type: 'submit',
							id: 'new-check'
						})
					)
				)
				.append(
					$('<input></input>', {
						id: 'new-form',
						type: 'text',
						name: 'new',
						placeholder: 'Bættu einhverju við',
						class: 'new-item'
					})
				)
			)
		);

		$('.textarea').html('').append(
			$('<div></div>', {class: 'checklist-box'}).append(
				$('<div></div>', {class: 'unchecked'})
					.append(ulUnchecked)
			).append(
				$('<div></div>', {class: 'checked'})
					.append(ulChecked)
			)
		);

		$('.checklist-box').on('click', '.checkmark', checkClick);
		$('.checklist-box').on('click', '#new-check', newCheckitemClick);
	}

	function createChecklistItem(index, value, checked) {
		var li = $('<li></li>')
			.attr('data-checked', checked)
			.addClass('checklist-item list');
		var span = $('<span></span>', {class: 'glyphicon glyphicon-ok'})
			.append($('<button></button>', {type: 'submit', class: 'checkmark'}));
		var form = $('<form></form>', {action: '/entries/my_entries?list=true'})
			.append(span)
			.append($('<input></input>', {
				type: 'hidden',
				name: 'item',
				value: {id: $('.active').id, index: index}
			}))
			.append($('<input></input>', {
				type: 'text',
				name: 'content',
				value: value,
				class: 'content'
			}));

		return li.append(form);
	}

	function createTextarea(content) {
		$('.textarea').html('').append(
			$('<textarea></textarea>', {
				name: 'content',
				id: 'content',
				class: 'form-control',
				rows: 20,
				placeholder: 'Your stuff here...'
			}).html(content.content)
		);
	}

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

	/*
	g_form.addEventListener('keyup', function(e) {
		updateCounters(formValues(g_form)['content']);
	})
*/
	

	//////////////////////
	/// MAIN FUNCTIONS ///
	//////////////////////

	function init() {
		$('.entrylist-item').attr('href', '#');
		$('#save').on('click', saveClick);
		$('#delete').on('click', deleteClick);
		$('.saved-entries').on('click', 'a.entrylist-item', itemClick);

		$('#memobtn').on('click', function(e) {
			e.preventDefault();

			$('.entrylist-item.memo').css('display', 'block');
			$('.entrylist-item.list')
				.css('display', 'none')
				.removeClass('active');
		});

		$('#listbtn').on('click', function(e) {
			e.preventDefault();

			$('.entrylist-item.list').css('display', 'block');
			$('.entrylist-item.memo')
				.css('display', 'none')
				.removeClass('active');
		}); 

		$('#allbtn').on('click', function(e) {
			e.preventDefault();

			$('.entrylist-item').css('display', 'block');
		});

		$('#newlist').on('click', function(e) {
			e.preventDefault();

			$('#title').val('').focus();
			$('.entrylist-item').removeClass('active')
			createChecklist({
				content: '',
				values: ''
			});
		});

		$('#new').on('click', function(e) {
			e.preventDefault();

			$('#title').val('').focus();
			$('.entrylist-item').removeClass('active');
			createTextarea('');
		});
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

	// Return an object API with methods to initialize 
	// an instance and add/remove items
	return {
    	init : init
  	};

})();