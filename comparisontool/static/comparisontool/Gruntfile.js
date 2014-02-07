module.exports = function(grunt) {
  grunt.initConfig({
    connect: {
      server: {
        options: {
          base: "",
          port: 9999
        }
      }
    },
    watch: {},
    jasmine: {
      src: ['js/*.js', '!js/data.js', '!js/comparison-tool-setup.js', '!js/raphael-min.js'],
      options: {
        specs: 'test/spec/ct-spec.js',
        // order matters here, jquery.js must be loaded before jasmine-jquery!
        vendor: ['cfpb-files/jquery-1.5.1.min.js', 'cfpb-files/jasmine-jquery.js'],
        junit: {
          path: 'test/junit-results',
          consolidate: true
        },
        template: require('grunt-template-jasmine-istanbul'),
        templateOptions: {
          coverage: 'test/coverage/coverage.json',
          report: [
            {
              type: 'cobertura',
              options: { 
                dir: 'test/coverage/report/cobertura'
              }
            },
            {
              type: 'html',
              options: {
                dir: 'test/coverage/report/html'
              }
            }
          ]
        }
      }
    }
  });

  // Loading dependencies
  for (var key in grunt.file.readJSON("package.json").devDependencies) {
    if (key !== "grunt" && key.indexOf("grunt") === 0) grunt.loadNpmTasks(key);
  }

  grunt.registerTask("dev", ["connect", "watch"]);
  grunt.registerTask("test", ["jasmine"]);

};