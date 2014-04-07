var moment = require('moment');
var json_handler = require('../middleware/json_handler.js');

/**
 * GET /
 */
exports.index = function(req, res) {
	json_handler.retrieveRefTree(function(json_ref) {
		json_handler.retrieveAvailableLng(function(available_lng) {
			res.render('index', {json_ref: json_ref, available_lng: available_lng});
		});
	});
}

/**
 * Post /save
 */
exports.save = function(req, res) {
	json_handler.saveRefTree(req.body.json_ref, function(err) {
		if (err) {
			console.log(err);
			return res.send({code: '500', alert: "An error has occurred"});
		}
		else {
			if (req.body.json_lng && req.body.lng) {
				console.log(req.body.json_lng);
				json_handler.saveLngTree(req.body.lng, req.body.json_lng, function(err) {
					if (err) {
						console.log(err);
						return res.send({code: '500', alert: "An error has occurred"});
					}
					else {
						return res.send({code: '200', alert: "last save at " + moment().format("HH:mm:ss")});
					}
				});
			}
			else {
				return res.send({code: '200', alert: "last save at " + moment().format("HH:mm:ss")});
			}
		}
	});
}

/**
 * Post /edit_lng
 * load lng file to the GUI 
 */
exports.edit_lng = function(req, res) {
	json_handler.retrieveLngTree(req.body.lng, function(json) {
		res.send({json: json});
	});
}

/**
 * Post /rename_key
 * load lng file to the GUI 
 */
exports.rename_key = function(req, res) {
	json_handler.removeNode(req.body.parent, req.body.value, function(err) {
		if (err) {
			console.log(err);
			return res.send({code: '500', alert: "An error has occurred"});
		} else {
			
		}
	});
}

exports.delete_key = function(req, res) {
	json_handler.removeNode(req.body.parent, req.body.value, function(err) {
		if (err) {
			console.log(err);
			return res.send({code: '500', alert: "An error has occurred"});
		} else {
			
		}
	});
}

/**
 * Truncate json and keep key linked to modified value
 */
/*function diff(previous, modified) {
	var diff = {
		modified_value: {},
		added_key: {},
		deleted_key: {}
	};
	
	return diff_rec(previous, modified);
	
	function diff_rec(previous_tree, modified_tree) {
		console.log('diff rec');
		if (!(typeof previous_tree === 'object')) {
			console.log('prev leaf');
			if (!(typeof modified_tree === 'object')) {
				// Two leaves
				if (previous_tree == modified_tree) {
					return {
						modified_value: null,
						added_key: null,
						deleted_key: null
					};
				}
				else {
					return {
						modified_value: previous_tree,
						added_key: null,
						deleted_key: null
					};
				}
			}
			else {
				// leaf replaced by a tree
				return {
					modified_value: null,
					added_key: modified_tree,
					deleted_key: previous_tree
				};
			}
		}
		if (!(typeof modified_tree === 'object')) {
			// tree replaced by a leaf
			return {
				modified_value: null,
				added_key: modified_tree,
				deleted_key: previous_tree
			};
		}
		var result = {
			modified_value: null,
			added_key: null,
			deleted_key: null
		};
		Object.keys(previous_tree).forEach(function(previous_key) {
			if (modified_tree.hasOwnProperty(previous_key)) {
				var rec_result = diff_rec(previous_tree[previous_key], modified_tree[previous_key]);
				if (!rec_result.modified_value || !rec_result.added_key || !rec_result.deleted_key) {
					result[previous_key] = rec_result;
				}
			}
			else {
				
			}
		});
		reste previous -> retrait
		reste modified -> ajout
	}
}*/