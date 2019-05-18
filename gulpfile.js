let gulp = require('gulp');
let gulpLoadPlugins = require('gulp-load-plugins');
let yargs = require('yargs');
let path = require('path');
let webpackConfig = require('./webpack.config');

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
	minifySvg: null,
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
argv.minifySvg = argv.minifySvg !== null ? !!argv.minifySvg : argv.minify;

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

function svgoConfig(minify = argv.minifySvg) {
	return (file) => {
		let filename = path.basename(file.relative, path.extname(file.relative));

		return {
			js2svg: {
				pretty: !minify,
				indent: '\t',
			},
			plugins: [
				{
					cleanupIDs: {
						minify: true,
						prefix: `${filename}-`,
					},
				},
				{
					removeTitle: true,
				},
				{
					removeViewBox: false,
				},
				{
					sortAttrs: true,
				},
			],
		};
	};
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

gulp.task('sprites:png', () => {
	const spritesData = gulp.src('app/images/sprites/png/*.png')
		.pipe($.plumber({
			errorHandler,
		}))
		.pipe($.if(argv.debug, $.debug()))
		.pipe($.spritesmith({
			cssName: '_sprites.scss',
			cssTemplate: 'app/scss/_sprites.hbs',
			imgName: 'sprites.png',
			retinaImgName: 'sprites@2x.png',
			retinaSrcFilter: 'app/images/sprites/png/*@2x.png',
			padding: 2,
		}));

	return $.mergeStream(
		spritesData.img
			.pipe($.plumber({
				errorHandler,
			}))
			.pipe($.vinylBuffer())
			.pipe($.imagemin())
			.pipe(gulp.dest('dist/images')),
		spritesData.css
			.pipe(gulp.dest('app/scss'))
	);
});

gulp.task('sprites:svg', () => {
	return gulp.src('app/images/sprites/svg/*.svg')
		.pipe($.plumber({
			errorHandler,
		}))
		.pipe($.if(argv.debug, $.debug()))
		.pipe($.svgmin(svgoConfig()))
		.pipe($.svgstore())
		.pipe($.if(!argv.minifySvg, $.replace(/^\t+$/gm, '')))
		.pipe($.if(!argv.minifySvg, $.replace(/\n{2,}/g, '\n')))
		.pipe($.if(!argv.minifySvg, $.replace('?><!', '?>\n<!')))
		.pipe($.if(!argv.minifySvg, $.replace('><svg', '>\n<svg')))
		.pipe($.if(!argv.minifySvg, $.replace('><defs', '>\n\t<defs')))
		.pipe($.if(!argv.minifySvg, $.replace('><symbol', '>\n<symbol')))
		.pipe($.if(!argv.minifySvg, $.replace('></svg', '>\n</svg')))
		.pipe($.rename('sprites.svg'))
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
		'!app/scss/vendor/**/*.scss',
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
		'!app/js/vendor/**/*.js',
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

gulp.task('optimize:svg', () => {
	return gulp.src('app/images/**/*.svg', {
		base: 'app/images',
	})
		.pipe($.plumber({
			errorHandler,
		}))
		.pipe($.if(argv.debug, $.debug()))
		.pipe($.svgmin(svgoConfig(false)))
		.pipe(gulp.dest('app/images'));
});

gulp.task('watch', () => {
	gulp.watch([
		'app/resources/**/*.*',
		'app/resources/**/.*',
	], gulp.series('copy'));

	gulp.watch('app/images/**/*.*', gulp.series('images'));

	gulp.watch([
		'app/images/sprites/png/*.png',
		'app/scss/_sprites.hbs',
	], gulp.series('sprites:png'));

	gulp.watch('app/images/sprites/svg/*.svg', gulp.series('sprites:svg'));

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

gulp.task('zip', () => {
	// eslint-disable-next-line global-require
	let name = require('./package').name;
	let now = new Date();
	let year = now.getFullYear().toString().padStart(2, '0');
	let month = (now.getMonth() + 1).toString().padStart(2, '0');
	let day = now.getDate().toString().padStart(2, '0');
	let hours = now.getHours().toString().padStart(2, '0');
	let minutes = now.getMinutes().toString().padStart(2, '0');

	return gulp.src([
		'dist/**',
		'app/**',
		'.babelrc',
		'.editorconfig',
		'.eslintignore',
		'.eslintrc',
		'.gitignore',
		'.npmrc',
		'.stylelintignore',
		'.stylelintrc',
		'*.js',
		'*.json',
		'*.md',
		'*.yml',
		'!package-lock.json',
		'!zip/**',
	], {
		base: '.',
		dot: true,
	})
		.pipe($.zip(`${name}_${year}-${month}-${day}_${hours}-${minutes}.zip`))
		.pipe(gulp.dest('zip'));
});

gulp.task('lint', gulp.series(
	'lint:pug',
	'lint:scss',
	'lint:js'
));

gulp.task('dist', gulp.parallel(
	'copy',
	'images',
	'sprites:png',
	'sprites:svg',
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
