var path = require('path');

module.exports = function(grunt) {

	// Load Grunt tasks declared in the package.json file
	require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

	// Project configuration.
	grunt.initConfig({

		watch: {
			scripts: {
				files: [
					'src/*.js'
				],
				tasks: ['jshint','concat']
			},
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
					]
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

	grunt.registerTask('build', ['jshint', 'concat']);
	grunt.registerTask('default', ['build','monitor']);

};
