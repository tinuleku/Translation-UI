// my_personal_config.js has the same structure of config.js, 
// the only difference is that it is excluded in the gitignore
// to prevent you from using my api_key ;)
var my_personal_config = require('./my_personal_config.js');


// define all the defaults here
var config = module.exports = {};

// this project has been designed to provide a simple and effective UI 
// to translate translation.json files used by node module i18next

// enter here the path to your 'locales' folder
config.root = (my_personal_config.root || '/path/to/locales/')

// google translate API key
config.api_key = (my_personal_config.api_key || 'your google translate API_KEY')