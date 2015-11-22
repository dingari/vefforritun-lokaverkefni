'use strict';

var gulp        = require('gulp');
var browserSync = require('browser-sync').create();
var jshint 		= require('gulp-jshint');
var nodemon     = require('gulp-nodemon');

gulp.task('serve', ['nodemon']);

// Inspect javascript files with jshint and report errors
gulp.task('inspect', function() {
	return gulp.src(['./**/*.js', '!node_modules/**/*.js'])
		.pipe(jshint())
		.pipe(jshint.reporter('default'));
});

// Start server and restart on changes
gulp.task('nodemon', function (cb) {
    
    var started = false;
    
    return nodemon({
        script: 'bin/www',
        env: {'NODE_ENV': 'development'}
    }).on('start', function () {
        // to avoid nodemon being started multiple times
        // thanks @matthisk
        if (!started) {
            cb();
            started = true;
        } 
    });
});

gulp.task('default', ['inspect', 'serve']);

