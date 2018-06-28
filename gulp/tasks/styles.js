const autoprefixer = require( 'autoprefixer' );
const gulp = require( 'gulp' );
const config = require( '../config' );
const gulpLess = require( 'gulp-less' );
const gulpSourcemaps = require( 'gulp-sourcemaps' );
const gulpPostcss = require( 'gulp-postcss' );
const gulpHeader = require( 'gulp-header' );
const BROWSER_LIST = require( '../../config/browser-list-config' );

function styles() {
  return gulp.src( config.styles.cwd + config.styles.src )
    .pipe( gulpSourcemaps.init() )
    .pipe( gulpLess( config.styles.settings ) )
    .pipe( gulpPostcss( [
      autoprefixer( { browsers: BROWSER_LIST.LAST_2 } )
    ] ) )
    .pipe( gulpHeader( config.banner, { pkg: config.pkg } ) )
    .pipe( gulpSourcemaps.write( '.' ) )
    .pipe( gulp.dest( config.styles.dest ) );
}

gulp.task( 'styles', styles );