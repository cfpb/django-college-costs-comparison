const gulp = require( 'gulp' );
const config = require( '../config' );
const vinylNamed = require( 'vinyl-named' );
const webpack = require( 'webpack' );
const webpackStream = require( 'webpack-stream' );
const webpackConfig = require( '../../config/webpack-config.js' );
const handleErrors = require( '../utils/handle-errors' );

function scripts() {
  return gulp.src( config.scripts.src  )
    .pipe( vinylNamed( file => file.relative ) )
    .pipe( webpackStream( webpackConfig.commonConf, webpack ) )
    .on( 'error', handleErrors.bind( this, { exitProcess: true } ) )
    .pipe( gulp.dest( config.scripts.dest ) );
}

gulp.task( 'scripts', scripts );