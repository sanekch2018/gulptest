// setting
let imgwatch = 'jpg,jpeg,png,webp,svg'; 
//---------------------------------------------------------------------------
const { src, dest, parallel, series, watch } = require('gulp');
const concat                                 = require('gulp-concat');
const del                                    = require('del');
// style
const scss                                   = require('gulp-sass');
const autoprefixer                           = require('gulp-autoprefixer');
const cleancss                               = require('gulp-clean-css');
// server
const browserSync                            = require('browser-sync').create();
// script
const uglify                                 = require('gulp-uglify-es').default;
// img 
const imagemin                               = require('gulp-imagemin');
const newer                                  = require('gulp-newer');
//---------------------------------------------------------------------------

// browsersync 
function browsersync() {
	browserSync.init({
		server: { baseDir: 'app/' },
		notify: false
	})
}

// scripts
function scripts() {
	return src([
		'node_modules/jquery/dist/jquery.min.js',
		'node_modules/bootstrap/dist/js/bootstrap.bundle.js',
		'app/js/app.js', 
		])
	.pipe(concat('app.min.js')) 
	.pipe(uglify()) 
	.pipe(dest('app/js/')) 
	.pipe(browserSync.stream())
}

// styles
function styles() {
	return src('app/scss/main.scss') 
	.pipe(scss()) 
	.pipe(concat('app.min.css')) 
	.pipe(autoprefixer({ overrideBrowserslist: ['last 10 versions'], grid: true })) 
	.pipe(cleancss( { level: { 1: { specialComments: 0 } } } )) 
	.pipe(dest('app/css/')) 
	.pipe(browserSync.stream()) 
}

// images
function images() {
	return src('app/images/src/**/*') 
	.pipe(newer('app/images/dest/')) 
	.pipe(imagemin()) 
	.pipe(dest('app/images/dest/')) 
}

// build
function buildcopy() {
	return src([ 
		'app/css/**/*.min.css',
		'app/js/**/*.min.js',
		'app/images/dest/**/*',
		'app/fonts/**/*',
		'app/**/*.html',
		], { base: 'app' }) // Параметр "base" сохраняет структуру проекта при копировании
	.pipe(dest('dist')) // Выгружаем в папку с финальной сборкой
}

function startwatch() {
	watch('app/scss/**/*', {usePolling: true}, styles);
	watch('app/images/src/**/*.{' + imgwatch + '}', {usePolling: true}, images);
	watch('app/**/*.html', {usePolling: true}).on('change', browserSync.reload);
	watch(['app/js/**/*.js', '!app/js/*.min.js'], {usePolling: true}, scripts);
}

// exports 
exports.default = parallel(images, styles, scripts, browsersync, startwatch);
exports.build   = series(styles, scripts, images, buildcopy);
