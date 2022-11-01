var path = require('path');

module.exports = function(grunt) {

	// Load Grunt tasks declared in the package.json file
	require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

	// Project configuration.
	grunt.initConfig({

		watch: {
			scripts: {
				files: [
					'src/*.js',
					'examples/*.js'
				],
				tasks: ['jshint','concat']
			}
		},
		'http-server': {
			dev: {
				root: '',
				port: 3116,
				runInBackground: true
			}
		},
		jshint: {
			options: {
				evil: true
			},
			all: ['src/*.js']
		},
		concat: {
			basic_and_extras: {
				files: {
					'dist/cellauto.js': [
						'src/*.js'
					],
					'dist/examples.js': [
						'examples/*.js'
					]
				}
			}
		},
		uglify: {
			my_target: {
				files: {
					'dist/cellauto.min.js': ['dist/cellauto.js']
				}
			}
		}

	});

	// These plugins provide necessary tasks.
	grunt.loadNpmTasks('grunt-contrib-watch');
	//grunt.loadNpmTasks('grunt-ssh');
	grunt.registerTask('monitor', [
		'watch'
	]);

	grunt.registerTask('build', ['jshint', 'concat', 'uglify']);
	grunt.registerTask('default', ['build', 'http-server', 'monitor']);

};
