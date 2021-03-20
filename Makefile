install:
	npm install

develop:
	npm start

build:
	npm run build

lint:
	npx editorconfig-checker
	npx gulp lint:pug
	npx gulp lint:scss
	npx gulp lint:js

deploy: lint
	npm run deploy
