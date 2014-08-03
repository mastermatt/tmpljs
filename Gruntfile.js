module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= pkg.version %> */\n',
                report: 'min'
            },
            dist: {
                files: {
                    'tmpl.min.js': [ 'tmpl.js' ]
                }
            }
        },

        jasmine: {
            dist: {
                src: 'tmpl.js',
                options: {
                    specs: 'specs.js',
                    vendor: [
                        'http://code.jquery.com/jquery-1.11.0.min.js'
                    ]
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jasmine');

    grunt.registerTask('default', [ 'jasmine', 'uglify']);
};