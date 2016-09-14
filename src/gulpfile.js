/**
 * gulpfile.js
 * Main file for gulp script 
 * @author: Juan Camilo Ibarra
 * @Creation_Date: March 2016
 * @version: 0.1.0
 * @Update_Author : Juan Camilo Ibarra
 * @Date: March 2016
 */

var gulp = require('gulp');
var clean = require('gulp-clean');
var concat = require('gulp-concat');

var runSequence = require('run-sequence');
var fs = require('fs');

//************* BROWSERIFY************
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var gutil = require('gulp-util');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');

var dest_dev = "../dev";
var dest_prod = "../prod";


gulp.task('browserify_debug', function () {
  // set up the browserify instance on a task basis
  var b = browserify({
    entries: [
    	'./controllers/app_core.js',
		'./controllers/app_home.js',
		'./controllers/app_login.js',
		'./controllers/app_socket_service.js',
		'./controllers/app_rest_service.js',
		'./controllers/app_map.js',
		'./controllers/app_other.js',
    ],
    debug: true,
    // defining transforms here will avoid crashing your stream
    //transform: [uglify]
  });

  return b.bundle()
    .pipe(source('bundle_app.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
        // Add transformation tasks to the pipeline here.
        //.pipe(uglify({mangle : false}))
        .on('error', gutil.log)
    .pipe(sourcemaps.write(dest_dev))
    .pipe(gulp.dest(dest_dev + '/public/js'));
});

gulp.task('browserify_prod', function () {
  // set up the browserify instance on a task basis
  var b = browserify({
    entries: [
    	'./controllers/app_core.js',
		'./controllers/app_home.js',
		'./controllers/app_login.js',
		'./controllers/app_socket_service.js',
		'./controllers/app_map.js',
		'./controllers/app_other.js',
    ],
    debug: false,
    // defining transforms here will avoid crashing your stream
    transform: [uglify]
  });

  return b.bundle()
    .pipe(source('bundle_app.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: false}))
        // Add transformation tasks to the pipeline here.
        //.pipe(uglify({mangle : false}))
        .on('error', gutil.log)
    .pipe(gulp.dest(dest_dev + '/public/js'));
});

//***********************************************

// Removes build_test folder
gulp.task('clean_build_test', function(){
	return gulp.src(dest_dev, {read : false})
		.pipe(clean({force : true}));
});
// Copies node files to build_test
gulp.task('copy_node_files', function() {
	return gulp.src([
			'index.js',
			'package.json',
			'config.js',	
		])
		.pipe(gulp.dest(dest_dev));
});
// Copies css files
gulp.task('copy_css_files', function() {
	return gulp.src([
			'./css/signin.css'
		])
		.pipe(gulp.dest(dest_dev + '/public/css'));
});
// Copies view files to views in build_test
gulp.task('copy_view_files', function() {
	return gulp.src('views/*')
		.pipe(gulp.dest(dest_dev + '/views'));
});
// Copies templates files to views in build_test
gulp.task('copy_templates_files', function() {
	return gulp.src('templates/*')
		.pipe(gulp.dest(dest_dev + '/public/templates'));
});
// Copies images files to build_test
gulp.task('copy_images_files', function() {
	return gulp.src('./images/*')
		.pipe(gulp.dest(dest_dev + '/public/images'));
});
// Creates run files
gulp.task('create_run_files', function(callback){
	fs.writeFileSync(dest_dev + '/run.bat', 'call node index.js');
	fs.writeFileSync(dest_dev + '/run.sh', '#!/bin/sh\nnode index.js');
	callback();
});
// Creates install files
gulp.task('create_install_files', function(callback){
	fs.writeFileSync(dest_dev + '/install.bat', 'call npm install --production');
	fs.writeFileSync(dest_dev + '/install.sh', '#!/bin/sh\nnpm install --production');
	callback();
});

//Concat controllers' files into one bundle file (concat_app.js)
// gulp.task('concat_app_controllers', function(){
	// return gulp.src([
			// './controllers/app_core.js',
			// './controllers/app_home.js',
			// './controllers/app_login.js',
			// './controllers/app_socket_service.js',
			// './controllers/app_map.js',
			// './controllers/app_other.js',
			// ])
		// .pipe(concat('concat_app.js'))
		// .pipe(gulp.dest('./bundle'));
// });

//Copies fenicia modules
gulp.task('copy_project_modules', function(){
	return gulp.src('./project_modules/*')
		.pipe(gulp.dest(dest_dev + '/project_modules'));
});

//Concat css files for app into one bundle file (budle_app.css)
gulp.task('concat_app_css', function(){
	return gulp.src([
			'./node_modules/angular-material/angular-material.css',
			'./node_modules/leaflet/dist/leaflet.css',
			'./node_modules/angular-material-data-table/dist/md-data-table.css',
			'./node_modules/c3/c3.min.css',,
			'./css/signin.css',
			'./css/home.css'
		])
		.pipe(concat('bundle_app.css'))
		.pipe(gulp.dest(dest_dev + '/public/css'));
});

//copy images sources for leaflet
gulp.task('copy_leaflet_images', function(){
	return gulp.src('./node_modules/leaflet/dist/images/*')
		.pipe(gulp.dest(dest_dev + '/public/css/images'));
});

//******************* GULP SEQUENCES ********************
// Clean building
gulp.task('generate_dev', function(callback) {
	runSequence(
		'clean_build_test',
		'copy_node_files',
		'copy_view_files',
		'copy_images_files',
		'copy_templates_files',
		'copy_project_modules',
		'copy_leaflet_images',
		'create_run_files',
		'create_install_files',
		'concat_app_css',
		'browserify_debug',
		function(err) {
		if (err)
			console.log(err);
		else
			console.log('TESTING FILES CREATED SUCCESSFULLY');
		callback(err);
	});
}); 

// Updates build files
gulp.task('update_dev', function(callback) {
	runSequence(
		'copy_node_files',
		'copy_view_files',
		'copy_images_files',
		'copy_templates_files',
		'copy_project_modules',
		'copy_leaflet_images',
		'create_run_files',
		'create_install_files',
		'concat_app_css',
		'browserify_debug',
		function(err) {
		if (err)
			console.log(err);
		else
			console.log('TESTING FILES UPDATED SUCCESSFULLY');
		callback(err);
	});
}); 

// gulp.task('generate_prod', function(callback) {
	// runSequence(
		// 'clean_build_test',
		// 'copy_node_files',
		// 'copy_view_files',
		// 'copy_images_files',
		// 'copy_templates_files',
		// 'copy_project_modules',
		// 'copy_leaflet_images',
		// 'create_run_files',
		// 'create_install_files',
		// 'concat_app_css',
		// 'browserify_debug',
		// function(err) {
		// if (err)
			// console.log(err);
		// else
			// console.log('TESTING FILES CREATED SUCCESSFULLY');
		// callback(err);
	// });
// }); 