install:
	npm install

develop:
	npm start

build:
	npm run build

lint:
	npx gulp lint:pug
	npx gulp lint:scss
	npx gulp lint:js
