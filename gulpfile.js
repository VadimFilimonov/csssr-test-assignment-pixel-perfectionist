const gulp = require('gulp');
const gulpLoadPlugins = require('gulp-load-plugins');
const yargs = require('yargs');
const webpackConfig = require('./webpack.config');

let emittyPug;

let errorHandler;

let argv = yargs.default({
	cache: true,
	ci: false,
	debug: true,
	fix: false,
	minify: false,
	minifyHtml: null,
	minifyCss: null,
	minifyJs: null,
	notify: true,
	open: true,
	port: 3000,
	spa: false,
	throwErrors: false,
}).argv;

argv.minify = !!argv.minify;
argv.minifyHtml = argv.minifyHtml !== null ? !!argv.minifyHtml : argv.minify;
argv.minifyCss = argv.minifyCss !== null ? !!argv.minifyCss : argv.minify;
argv.minifyJs = argv.minifyJs !== null ? !!argv.minifyJs : argv.minify;

if (argv.ci) {
	argv.cache = false;
	argv.notify = false;
	argv.open = false;
	argv.throwErrors = true;
}

if (argv.minifyJs) {
	webpackConfig.mode = 'production';
} else {
	webpackConfig.mode = webpackConfig.mode || 'development';
}

let $ = gulpLoadPlugins({
	overridePattern: false,
	pattern: [
		'autoprefixer',
		'browser-sync',
		'connect-history-api-fallback',
		'cssnano',
		'emitty',
		'imagemin-mozjpeg',
		'merge-stream',
		'postcss-reporter',
		'postcss-scss',
		'stylelint',
		'uglifyjs-webpack-plugin',
		'vinyl-buffer',
		'webpack',
		'webpack-stream',
	],
	scope: [
		'dependencies',
		'devDependencies',
		'optionalDependencies',
		'peerDependencies',
	],
});

if (argv.throwErrors) {
	errorHandler = false;
} else if (argv.notify) {
	errorHandler = $.notify.onError('<%= error.message %>');
} else {
	errorHandler = null;
}

gulp.task('copy', () => {
	return gulp.src([
		'app/resources/**/*.*',
		'app/resources/**/.*',
		'!app/resources/**/.keep',
	], {
		base: 'app/resources',
		dot: true,
	})
		.pipe($.if(argv.cache, $.newer('dist')))
		.pipe($.if(argv.debug, $.debug()))
		.pipe(gulp.dest('dist'));
});

gulp.task('images', () => {
	return gulp.src('app/images/**/*.*')
		.pipe($.if(argv.cache, $.newer('dist/images')))
		.pipe($.if(argv.debug, $.debug()))
		.pipe(gulp.dest('dist/images'));
});

gulp.task('pug', () => {
	if (!emittyPug) {
		emittyPug = $.emitty.setup('app', 'pug', {
			makeVinylFile: true,
		});
	}

	if (!argv.cache) {
		return gulp.src('app/*.pug')
			.pipe($.plumber({
				errorHandler,
			}))
			.pipe($.if(argv.debug, $.debug()))
			.pipe($.pug({
				pretty: argv.minifyHtml ? false : '\t',
			}))
			.pipe(gulp.dest('dist'));
	}

	return new Promise((resolve, reject) => {
		emittyPug.scan(global.emittyPugChangedFile).then(() => {
			gulp.src('app/*.pug')
				.pipe($.plumber({
					errorHandler,
				}))
				.pipe(emittyPug.filter(global.emittyPugChangedFile))
				.pipe($.if(argv.debug, $.debug()))
				.pipe($.pug({
					pretty: argv.minifyHtml ? false : '\t',
				}))
				.pipe(gulp.dest('dist'))
				.on('end', resolve)
				.on('error', reject);
		});
	});
});

gulp.task('scss', () => {
	return gulp.src([
		'app/scss/*.scss',
		'!app/scss/_*.scss',
	])
		.pipe($.plumber({
			errorHandler,
		}))
		.pipe($.if(argv.debug, $.debug()))
		.pipe($.sourcemaps.init())
		.pipe($.sass().on('error', $.sass.logError))
		.pipe($.postcss([
			argv.minifyCss ?
				$.cssnano({
					autoprefixer: {
						add: true,
						browsers: ['> 0%'],
					},
					calc: true,
					discardComments: {
						removeAll: true,
					},
					zindex: false,
				})
				:
				$.autoprefixer({
					add: true,
					browsers: ['> 0%'],
				}),
		]))
		.pipe($.sourcemaps.write('.'))
		.pipe(gulp.dest('dist/css'));
});

gulp.task('js', () => {
	return gulp.src(webpackConfig.entry)
		.pipe($.plumber({
			errorHandler,
		}))
		.pipe($.webpackStream(webpackConfig))
		.pipe(gulp.dest(webpackConfig.output.path));
});

gulp.task('lint:pug', () => {
	return gulp.src([
		'app/*.pug',
		'app/pug/**/*.pug',
	])
		.pipe($.plumber({
			errorHandler,
		}))
		.pipe($.pugLinter())
		.pipe($.pugLinter.reporter(argv.throwErrors ? 'fail' : null));
});

gulp.task('lint:scss', () => {
	return gulp.src([
		'app/scss/**/*.scss',
	])
		.pipe($.plumber({
			errorHandler,
		}))
		.pipe($.postcss([
			$.stylelint(),
			$.postcssReporter({
				clearReportedMessages: true,
				throwError: argv.throwErrors,
			}),
		], {
			parser: $.postcssScss,
		}));
});

gulp.task('lint:js', () => {
	return gulp.src([
		'*.js',
		'app/js/**/*.js',
	], {
		base: '.',
	})
		.pipe($.plumber({
			errorHandler,
		}))
		.pipe($.eslint({
			fix: argv.fix,
		}))
		.pipe($.eslint.format())
		.pipe($.if((file) => file.eslint && file.eslint.fixed, gulp.dest('.')));
});

gulp.task('optimize:images', () => {
	return gulp.src('app/images/**/*.*')
		.pipe($.plumber({
			errorHandler,
		}))
		.pipe($.if(argv.debug, $.debug()))
		.pipe($.imagemin([
			$.imagemin.gifsicle({
				interlaced: true,
			}),
			$.imagemin.optipng({
				optimizationLevel: 3,
			}),
			$.imageminMozjpeg({
				progressive: true,
				quality: 80,
			}),
		]))
		.pipe(gulp.dest('app/images'));
});

gulp.task('watch', () => {
	gulp.watch([
		'app/resources/**/*.*',
		'app/resources/**/.*',
	], gulp.series('copy'));

	gulp.watch('app/images/**/*.*', gulp.series('images'));

	gulp.watch([
		'app/*.pug',
		'app/pug/**/*.pug',
	], {
		delay: 0,
	}, gulp.series('pug'))
		.on('all', (event, file) => {
			if (event === 'unlink') {
				global.emittyPugChangedFile = undefined;
			} else {
				global.emittyPugChangedFile = file;
			}
		});

	gulp.watch('app/scss/**/*.scss', gulp.series('scss'));

	gulp.watch('app/js/**/*.js', gulp.series('js'));
});

gulp.task('serve', () => {
	let middleware = [];

	if (argv.spa) {
		middleware.push($.connectHistoryApiFallback());
	}

	$.browserSync
		.create()
		.init({
			notify: false,
			open: argv.open,
			port: argv.port,
			files: [
				'./dist/**/*',
			],
			server: {
				baseDir: './dist',
				middleware,
			},
		});
});

gulp.task('lint', gulp.series(
	'lint:pug',
	'lint:scss',
	'lint:js'
));

gulp.task('dist', gulp.parallel(
	'copy',
	'images',
	'pug',
	'scss',
	'js'
));

gulp.task('default', gulp.series(
	'dist',
	gulp.parallel(
		'watch',
		'serve'
	)
));
