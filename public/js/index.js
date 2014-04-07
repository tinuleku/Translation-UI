$(document).ready(function() {
	
	var selected_line;
	
	/**
	 * Append/reduce a node.
	 */
	$(".node a.node-caret").click(function(e) {
		e.preventDefault();
		var children = $(this).parents(".node").parent().children(".node-children");
		if (children.hasClass('hidden')) {
			children.removeClass('hidden');
			$(this).children("i").removeClass("fa-caret-right").addClass("fa-caret-down");
		}
		else {
			children.addClass('hidden');
			$(this).children("i").removeClass("fa-caret-down").addClass("fa-caret-right");
		}
	});
	
	/**
	 * Select a line
	 */
	$(".node, .node-leaf").click(function(e) {
		e.preventDefault();
		if (selected_line) {
			selected_line.removeClass('active');
			selected_line.find(".node-action").addClass("hidden");
			var input = selected_line.find(".col-ref div > input, .col-lng div > input");
			// save input in span and hide input
			input.each(function() {
				$(this).addClass('hidden');
				$(this).parent().children('span').text($(this).val());
			});
			selected_line.find(".col-ref div > span, .col-lng div > span").removeClass("hidden");
		}
		selected_line = $(this);
		selected_line.addClass("active");
		selected_line.find(".node-action").removeClass("hidden");
		selected_line.find(".col-ref div > input, .col-lng div > input").removeClass("hidden");
		selected_line.find(".col-ref div > span, .col-lng div > span").addClass("hidden");
	});
	
	/**
	 * Key actions
	 */
	$(".node-action-edit").click(function(e) {
		e.preventDefault();
		// display popover to edit the key name.
		
	});
	
	$(".node-action-delete").click(function(e) {
		e.preventDefault();
		// display popup to confirm
	});
	
	/**
	 * Append/reduce all
	 */
	$("#append").click(function(e) {
		e.preventDefault();
		if ($(this).attr('appended') == 'false') {
			$(this).attr('appended', 'true');
			$(this).text('reduce all');
			$(".node").each(function() {
				var child = $(this).parent().children('.node-children');
				if (child.hasClass('hidden')) {
					child.removeClass('hidden');
					$(this).find(".node-caret > i").removeClass("fa-caret-right").addClass("fa-caret-down");
				}
			});
		} else {
			$(this).attr('appended', 'false');
			$(this).text('append all');
			$(".node").each(function() {
				var child = $(this).parent().children('.node-children');
				if (!child.hasClass('hidden')) {
					child.addClass('hidden');
					$(this).find(".node-caret > i").removeClass("fa-caret-down").addClass("fa-caret-right");
				}
			});
		}
	});
	
	/**
	 * Save
	 */
	$("#button_save").click(function(e) {
		e.preventDefault();
		// get data
		var lng = $("#lng_value").attr('value');
		retrieve_json(lng != "", function(json_ref, json_lng) {
			$.ajax({
				url: '/save',
				type: 'post',
				data: {
					json_ref: json_ref,
					json_lng: json_lng,
					lng: lng
				},
				success: function(data) {
					$("#state").text(data.alert);
				}
			});
		});
	});
	
	/**
	 * Callback(json_ref, json_lng)
	 */
	function retrieve_json(check_lng, next) {
		var result = retrieve_json_rec($("#root"), check_lng);
		if (check_lng) next(result.json_ref, result.json_lng);
		else next(result.json_ref, null);
	}
	
	function retrieve_json_rec(root, check_lng) {
		var json_ref = {};
		var json_lng = {};
		root.find("> ul > li > .node").each(function() {
			var key = $(this).attr('key');
			var result = retrieve_json_rec($(this).parent().children(".node-children"), check_lng);
			if (check_lng) {
				json_lng[key] = result.json_lng;
			}
			json_ref[key] = result.json_ref;
		});
		root.find("> ul > li > .node-leaf").each(function() {
			if ($(this).hasClass('active')) {
				var key = $(this).attr('key');
				var value = $(this).find('.col-lng input').val();
				if (check_lng && $.trim(value) != "") {
					json_lng[key] = value;
				}
				json_ref[key] = $(this).find('.col-ref input').val();
			}
			else {
				var key = $(this).attr('key');
				var value = $(this).find('.col-lng span').text();
				if (check_lng && $.trim(value) != "") {
					json_lng[key] = value;
				}
				json_ref[key] = $(this).find('.col-ref span').text();
			}
		});
		return {json_ref: json_ref, json_lng: json_lng};
	}
	
	/**
	 * Select another lng
	 */
	$(".dropdown-select").each(function() {
		var root = $(this);
		var selected_item = root.find("ul li a.disabled").first();
		
		root.find("ul li a").click(function(e) {
			e.preventDefault();
			if (!$(this).parent().hasClass('disabled')) {
				selected_item.parent().removeClass('disabled');
				selected_item = $(this);
				selected_item.parent().addClass('disabled');
				var lng = selected_item.attr('value');
				console.log(lng);
				$.ajax({
					url: '/edit_lng',
					type: 'post',
					data: {
						lng: lng
					},
					success: function(data) {
						load_lng(data.json);
						root.find('button .select-value').text(selected_item.text()).attr('value', lng);
					}
				});
			}
		});
	});
	
	function load_lng(json) {
		load_lng_rec($("#root"), json);
	}
	
	function load_lng_rec(root, json) {
		root.find("> ul > li > .node").each(function() {
			var key = $(this).attr('key');
			load_lng_rec($(this).parent().children(".node-children"), json[key] || {});
		});
		root.find("> ul > li > .node-leaf").each(function() {
			var key = $(this).attr('key');
			if (json.hasOwnProperty(key)) {
				$(this).find('> .col-lng').find('span').text(json[key]);
				$(this).find('> .col-lng').find('input').attr('value', json[key]);
			}
			else {
				$(this).find('> .col-lng').find('input').attr('value', "");
				$(this).find('> .col-lng').find('span').text(" ");
			}
		});
	}
	
	/**
	 * Cookies
	 */
	
});