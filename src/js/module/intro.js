if ((typeof module == 'object') && (typeof module.exports == 'object')) {
  var $ = require('jquery');
  var Raphael = undefined;
  try {
    Raphael = require('raphael');
  } catch (e) {
    Raphael = require('webpack-raphael');
  }
  var TWEEN = require('tween.js');
}