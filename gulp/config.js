const fs = require( 'fs' );

module.exports = {
  // eslint-disable-next-line no-sync
  pkg:    JSON.parse( fs.readFileSync( 'package.json' ) ),
  banner: 
      '/*!\n' +
      ' *               ad$$               $$\n' +
      ' *              d$"                 $$\n' +
      ' *              $$                  $$\n' +
      ' *   ,adPYba.   $$$$$  $$.,dPYba.   $$.,dPYba.\n' +
      ' *  aP\'    `$:  $$     $$P\'    `$a  $$P\'    `$a\n' +
      ' *  $(          $$     $$(      )$  $$(      )$\n' +
      ' *  "b.    ,$:  $$     $$b.    ,$"  $$b.    ,$"\n' +
      ' *   `"Ybd$"\'   $$     $$`"YbdP"\'   $$`"YbdP"\'\n' +
      ' *                     $$\n' +
      ' *                     $$\n' +
      ' *                     $$\n' +
      ' *\n' +
      ' *  <%= pkg.name %>\n' +
      ' *  <%= pkg.homepage %>\n' +
      ' *  A public domain work of the Consumer Financial Protection Bureau\n' +
      ' */\n',
  lint: {
    src: [
      '../src/js/*.js',
      '../src/js/**/*.js'
    ],
    test: [
      '../test/util/**/*.js',
      '../test/unit_tests/**/*.js',
      '../test/browser_tests/**/*.js'
    ]
  },
  scripts: {
    src: '../src/js/**/*.js'
  },
  styles: {
    cwd: './src/css',
    src: '/main.less',
    dest: './comparisontool/static/comparisontool/css/',
    settings: {
      compress: true
    },
  },
  copy: {

  }
};