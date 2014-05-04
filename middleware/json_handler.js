var fs = require('fs');
var path = require('path');
var config = require('../config.js');

/******************************************************
 * 					Init environment
 ******************************************************/
var root = config.root;
console.log("root is : " + root);
var ref_path = path.dirname(__dirname) + '/translation.json';

var lng_name = {
    en: 'English',
    fr: 'French',
    es: 'Spanish',
    pt: 'Portuguese',
    it: 'Italian',
    de: 'German'
};
var available_lng;
findAvailableLng()

/*var ref;
loadRefLng(function(data) {
	ref = data;
});*/

var ref_lng = 'en';
var ref_json;
loadLng(ref_lng, function(data) {
    ref_json = data;
});

/**
 * Load a translation file.
 * callback(json_content)
 */
function loadLng(lng, callback) {
    fs.readFile(root + lng + '/translation.json', 'utf8', function(err, data) {
        if (err) {
            console.log(err);
            return callback({});
        } else {
            return callback(JSON.parse(data));
        }
    });
}

/**
 * Save a translation file.
 * callback(err)
 */
function saveLng(lng, json_tree, callback) {
    fs.writeFile(root + lng + '/translation.json', JSON.stringify(json_tree, null, 4), 'utf8', function(err) {
        if (err) {
            return callback(err);
        } else {
            return callback(null);
        }
    });
}

/**
 * Find all available languages and display and fill available_lng
 */
function findAvailableLng() {
    available_lng = [];
    fs.readdir(root, function(err, files) {
        files.forEach(function(file) {
            if (fs.lstatSync(root + file).isDirectory() && file != "dev" && file != "en") {
                available_lng.push({
                    lng: file,
                    name: lng_name[file]
                });
            }
        });
    });
}

/**
 * Get the ref tree.
 * Callback(json_tree)
 */
exports.retrieveRefTree = function(next) {
    loadLng(ref_lng, next);
}

/**
 * Save the ref tree.
 * Callback(err)
 */
exports.saveRefTree = function(json, next) {
    saveLng(ref_lng, json, next);
}

/**
 * Get a lng tree.
 * Callback(json_tree)
 */
exports.retrieveLngTree = function(lng, next) {
    loadLng(lng, next);
}

/**
 * save a lng tree.
 * Callback(err)
 */
exports.saveLngTree = function(lng, json, next) {
    saveLng(lng, json, next);
}

/**
 * Get the available languages.
 * Callback(available_lng)
 */
exports.retrieveAvailableLng = function(next) {
    return next(available_lng);
}

/**
 * Rename a node in every json tree
 * node is {"key1": {...{"parent_key": "old_key"}...}}
 */
exports.renameNode = renameMode = function(node, value) {
    for (i = 0; i < available_lng.length; i++) {
        var lng = available_lng[i];
        (function(lng) {
            loadLng(lng, function(json_tree) {
                json_tree = rename_node_rec(node, value, json_tree);
                saveLng(lng, json_tree, function(err) {
                    if (err) console.log(err);
                });
            });
        })(lng);
    }
}

/**
 * Go through the tree recursively
 */
function rename_node_rec(node, value, tree) {
    if (typeof node == 'object') {
        var key = Object.keys(node)[0];
        if (tree.hasOwnProperty(key)) {
            tree[key] = rename_node_rec(node[key], value, tree[key]);
        }
    } else {
        if (tree.hasOwnProperty(node) && !tree.hasOwnProperty(value)) {
            tree[value] = tree[node];
            delete tree[node];
        }
    }
    return tree;
}

/**
 * Add a new leaf to the json tree
 */
exports.addLeaf = function(parent, value) {
    var lng = ref_lng;
    (function(lng) {
        loadLng(lng, function(json_tree) {
            json_tree = add_leaf_rec(parent, value, json_tree);
            saveLng(lng, json_tree, function(err) {
                if (err) console.log(err);
            });
        });
    })(lng);
}

/**
 * Go through the tree recursively in order to add the leaf
 */
function add_leaf_rec(parent, value, tree) {
    if (typeof parent == 'object') {
        if (Object.keys(parent).length == 0) {
            tree[value] = "";
        } else {
            var key = Object.keys(parent)[0];
            if (tree.hasOwnProperty(key)) {
                tree[key] = add_leaf_rec(parent[key], value, tree[key]);
            }
        }
    } else {
        if (tree.hasOwnProperty(parent) && typeof tree[parent] == 'object' && !tree[parent].hasOwnProperty(value)) {
            tree[parent][value] = "";
        }
    }
    return tree;
}

/**
 * Add a new node to the json tree
 */
exports.addNode = function(parent, value) {
    for (i = 0; i < available_lng.length; i++) {
        var lng = available_lng[i];
        (function(lng) {
            loadLng(lng, function(json_tree) {
                json_tree = add_node_rec(parent, value, json_tree);
                saveLng(lng, json_tree, function(err) {
                    if (err) console.log(err);
                });
            });
        })(lng);
    }
}

/**
 * Go through the tree recursively in order to add the node
 */
function add_node_rec(parent, value, tree) {
    if (typeof parent == 'object') {
        if (Object.keys(parent).length == 0) {
            tree[value] = {};
        } else {
            var key = Object.keys(parent)[0];
            if (tree.hasOwnProperty(key)) {
                tree[key] = add_node_rec(parent[key], value, tree[key]);
            }
        }
    } else {
        if (tree.hasOwnProperty(parent) && typeof tree[parent] == 'object' && !tree[parent].hasOwnProperty(value)) {
            tree[parent][value] = {};
        }
    }
    return tree;
}

/**
 * Remove a new node to the json tree/leaf
 */
exports.removeNode = function(parent, value, next) {
    for (i = 0; i < available_lng.length; i++) {
        var lng = available_lng[i];
        (function(lng) {
            loadLng(lng, function(json_tree) {
                json_tree = remove_node_rec(parent, json_tree);
                saveLng(lng, json_tree, function(err) {
                    if (err) return next(err);
                });
            });
        })(lng);
        if (i == available_lng.length - 1) {
            return next(null);
        }
    }
}

/**
 * Go through the tree recursively in order to remove the node/leaf
 */
function remove_node_rec(parent, tree) {
    if (typeof parent == 'object') {
        if (Object.keys(parent).length == 0) {
            delete tree[value];
        } else {
            var key = Object.keys(parent)[0];
            if (tree.hasOwnProperty(key)) {
                tree[key] = remove_node_rec(parent[key], tree[key]);
            }
        }
    } else {
        if (tree.hasOwnProperty(parent)) {
            delete tree[parent];
        }
    }
    return tree;
}

/**
 * Define the value of a leaf. If needed create the leaf.
 */
exports.defineLeaf = function(leaf, value, lng) {
    (function(lng) {
        loadLng(lng, function(json_tree) {
            json_tree = define_leaf_rec(leaf, value, json_tree);
            saveLng(lng, json_tree, function(err) {
                if (err) console.log(err);
            });
        });
    })(lng);
}

/**
 * Define the value of a leaf recursively.
 */
function define_leaf_rec(leaf, value, tree) {
    if (typeof leaf == 'object') {
        var key = Object.keys(leaf)[0];
        if (tree.hasOwnProperty(key)) {
            tree[key] = define_leaf_rec(leaf[key], value, tree[key]);
        }
    } else {
        tree[leaf] = value;
    }
    return tree;
}