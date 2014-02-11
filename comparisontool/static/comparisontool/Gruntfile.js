module.exports = function(grunt) {
  // Loading dependencies
  for (var key in grunt.file.readJSON("package.json").devDependencies) {
    if (key !== "grunt" && key.indexOf("grunt") === 0) grunt.loadNpmTasks(key);
  }

  var browsers = [{
      browserName: "firefox",
      version: "19",
      platform: "XP"
  }, {
      browserName: "chrome",
      platform: "XP"
  }, {
      browserName: "chrome",
      platform: "linux"
  }, {
      browserName: "internet explorer",
      platform: "WIN8",
      version: "10"
  }, {
      browserName: "internet explorer",
      platform: "VISTA",
      version: "9"
  }];

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
      test: {
        src: ['js/*.js', '!js/data.js'],
        options: {
          specs: 'test/spec/ct-spec.js',
          keepRunner: true,
          // order matters here, jquery.js must be loaded before jasmine-jquery!
          vendor: ['cfpb-files/jquery-1.5.1.min.js', 'cfpb-files/jasmine-jquery.js', 'cfpb-files/jasmine-jsreporter.js'],
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
      },
      sauce: {
        src: ['js/*.js', '!js/data.js'],
        options: {
          specs: 'test/spec/ct-spec.js',
          timeout: 30000,
          keepRunner: true,
          // order matters here, jquery.js must be loaded before jasmine-jquery!
          vendor: ['cfpb-files/jquery-1.5.1.min.js', 'cfpb-files/jasmine-jquery.js', 'cfpb-files/jasmine-jsreporter.js'],
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
    },
    'saucelabs-jasmine': {
      all: {
        options: {
          urls: ['http://127.0.0.1:9999/SpecRunner-sauce.html'],
          //username: This value is set in the environment variable SAUCE_USERNAME
          //key: This value is set in the environment variable SAUCE_ACCESS_KEY
          detailedError: true,
          testname: 'Paying-for-College',
          testTimeout: 180000,
          tags: [
            'cf.gov',
            'paying-for-college'
          ],
          browsers: [
            {
                browserName: 'firefox',
                version: '20',
                platform: 'XP'
            }, {
                browserName: 'chrome',
                platform: 'XP'
            }, {
                browserName: 'chrome',
                platform: 'linux'
            }, {
                browserName: 'internet explorer',
                platform: 'WIN8',
                version: '10'
            }, {
                browserName: 'internet explorer',
                platform: 'WIN7',
                version: '9'
            }, {
                browserName: 'internet explorer',
                platform: 'VISTA',
                version: '9'
            }
          ]
        }
      }
    }
  });

  grunt.registerTask("dev", ["connect", "watch"]);
  grunt.registerTask("test", ["jasmine:test"]);
  grunt.registerTask("sauce", ["connect", "jasmine:sauce", "saucelabs-jasmine"]);

};