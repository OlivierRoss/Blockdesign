module.exports = function(grunt) {

    //Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            my_target: {
                files: {
                    'x-tuiles/modelisation-blockdesign.min.js': [
                        'x-tuiles/utils.js',
                        'x-tuiles/symbols.js',
            //            'x-tuiles/html.js',
                        'x-tuiles/methods.js',
                        'x-tuiles/register.js'
                    ]
                }
            }
        }
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-uglify');

    // Default task(s).
    grunt.registerTask('default', ['uglify']);

};
