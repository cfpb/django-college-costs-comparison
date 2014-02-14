module.exports = function(grunt) {
  // Loading dependencies
  for (var key in grunt.file.readJSON("package.json").devDependencies) {
    if (key !== "grunt" && key.indexOf("grunt") === 0) grunt.loadNpmTasks(key);
  }

  var browsers = [
  {
    browserName: 'firefox',
    version: '20',
    platform: 'XP'
  }, {
    browserName: 'chrome',
    version: '26',
    platform: 'XP'
  }, {
    browserName: 'chrome',
    version: '26',
    platform: 'linux'
  }, {
    browserName: 'internet explorer',
    platform: 'Windows 7',
    version: '10'
  }, {
    browserName: 'internet explorer',
    platform: 'Windows 7',
    version: '9'
  }, {
    browserName: 'internet explorer',
    platform: 'Windows 7',
    version: '9'
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
    'saucelabs-jasmine': {
      all: {
        options: {
          urls: ['http://127.0.0.1:9999/SpecRunner-sauce.html'],
          //username: This value is set in the environment variable SAUCE_USERNAME
          //key: This value is set in the environment variable SAUCE_ACCESS_KEY
          detailedError: true,
          testname: 'Paying-for-College JS Unit Tests',
          testTimeout: 180000,
          build: process.env.BUILD_ID, // Set by Jenkins
          tags: [
            'cf.gov',
            'paying-for-college'
          ],
          browsers: browsers
        }
      }
    }
  });

  // This line is required so that Jenkins can pick up the results for display
  console.log("SauceOnDemandSessionID="+process.env.BUILD_ID+" job-name=Paying-for-College JS Unit Tests");
  grunt.registerTask("dev", ["connect", "watch"]);
  grunt.registerTask("test", ["jasmine"]);
  grunt.registerTask("sauce", ["connect", "jasmine", "saucelabs-jasmine"]);

};