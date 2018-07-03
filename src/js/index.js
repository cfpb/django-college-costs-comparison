'use strict';

let $ = require( 'jquery' );
let financialView = require( './views/financial-view' );

let app = {
  init: function() {
    financialView.init();
  }
}

$( document ).ready( function() {
  app.init();
} );
