'use strict';

var gulp        = require('gulp');
var browserSync = require('browser-sync').create();
var jshint 		= require('gulp-jshint');
var nodemon     = require('gulp-nodemon');
var sass        = require('gulp-sass');

// Static Server + watching scss/html files
gulp.task('serve', ['sass', 'nodemon'], function() {

    browserSync.init({
        proxy: 'http://localhost:3000',
        port: 4000
    });

    gulp.watch("sass/**/*.scss", ['sass']);
    gulp.watch("views/**/*.jade").on('change', browserSync.reload);
    gulp.watch("javascripts/**/*.js").on("change", browserSync.reload);
});

// Inspect javascript files with jshint and report errors
gulp.task('inspect', function() {
	return gulp.src(['./**/*.js', '!node_modules/**/*.js'])
		.pipe(jshint())
		.pipe(jshint.reporter('default'));
});

// Compile sass into CSS & auto-inject into browsers
gulp.task('sass', function() {
    return gulp.src("./sass/**/*.scss")
        .pipe(sass())
        .pipe(gulp.dest("./public/stylesheets"))
        .pipe(browserSync.stream());
});

// Start server and restart on changes
gulp.task('nodemon', function (cb) {
    
    var started = false;
    
    return nodemon({
        script: 'bin/www',
        env: {'NODE_ENV': 'development'},
        ignore: 'public/**/*.js'
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

