

module.exports = function (grunt) {
	// 项目配置
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		copy: {
			main: {
				files: [
					// includes files within path
					{expand: true, cwd: 'src/', src: ['**'], dest: 'dist/'},
				],
			},
		},
		uglify: {
		// options: {
		//  banner: '/*! <%= pkg.file %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
		//},
			build: {
				src: 'dist/slider.js',
				dest: 'dist/slider.min.js'
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-uglify');

	grunt.registerTask('default', ['copy', 'uglify']);
};
