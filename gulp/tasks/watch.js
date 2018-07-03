'use strict';

const gulp = require( 'gulp' );
const scripts = require( './scripts' );
const styles = require( './styles' );
const watch = require( 'gulp-watch' );
const browserSync = require( 'browser-sync' );
const reload = browserSync.reload;
const config = require( '../config.js' );

gulp.task( 'watch', function() {
  gulp.watch( config.watch.scripts.src, gulp.parallel( 'scripts' ) );
  gulp.watch( config.watch.styles.src, gulp.parallel( 'styles' ) );
} );