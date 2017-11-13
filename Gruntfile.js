module.exports = function(grunt) {
	require('time-grunt')(grunt);
	require('jit-grunt')(grunt);

	grunt.initConfig({
		pkg : grunt.file.readJSON('package.json'),
		COPYRIGHTS_BANNER : grunt.file.read('copyrights.txt'),
		vars : {
			src : 'src',
			dist : 'dist',
			components : 'bower_components',
			tmp : '.tmp'
		},
		clean : {
			tmp : [ '<%= vars.tmp %>' ],
			dist : [ '<%= vars.dist %>/*' ],
		},
		jshint : {
			options : {
				reporter : require('jshint-stylish'),
				// curly : true,
				browser : true,
				devel : true,
				shadow : false,
				expr : true,
				validthis : true,
				globals : {
					angular : true,
					_ : true
				}
			},
			gruntfile : [ 'Gruntfile.js' ],
			src : [ '<%= vars.src %>/js/**/*.js' ]
		},
		ngAnnotate : {
			options : {
				singleQuotes : true
			},
			dist : {
				files : [ {
					expand : true,
					cwd : '<%= vars.src %>/js',
					src : [ '**/*.js' ],
					dest : '<%= vars.tmp %>/js',
					filter : 'isFile'
				} ]
			}
		},
		uglify : {
			ext : {
				options : {
					banner : '<%= COPYRIGHTS_BANNER %>',
					mangle : false,
					beautify : true,
					compress : false,
					preserveComments : false,
					maxLineLen : 50000
				},
				files : {
					'<%= vars.dist %>/js/<%= pkg.name %>.js' : [
							'<%= vars.tmp %>/js/<%= pkg.name %>.module.js',
							'<%= vars.tmp %>/js/**/*.js' ]
				}
			},
			min : {
				options : {
					banner : '<%= COPYRIGHTS_BANNER %>',
					mangle : true,
					compress : true,
					preserveComments : false,
					maxLineLen : 50000
				},
				files : {
					'<%= vars.dist %>/js/<%= pkg.name %>.min.js' : [
							'<%= vars.tmp %>/js/<%= pkg.name %>.module.js',
							'<%= vars.tmp %>/js/**/*.js' ]
				}
			}
		}
	});

	grunt.registerTask('build',
			[ 'clean', 'ngAnnotate', 'uglify', 'clean:tmp' ]);

	grunt.registerTask('default', [ 'build' ]);
};