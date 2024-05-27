test:
	@npx vitest run

test-watch:
	@npx vitest

types:
	@npx tsc --noEmit

types-watch:
	@npx tsc --noEmit --watch

size:
	@node ./size.mjs

size-watch:
	@node ./size.mjs --watch

benchmark:
	@bun ./benchmark.ts

test-types: install-attw build 
	@cd lib && attw --pack

build: prepare-build
	@npx tsc -p tsconfig.lib.json 
	@env BABEL_ENV=esm npx babel src --config-file ./babel.config.lib.json --source-root src --out-dir lib --extensions .mjs,.ts --out-file-extension .mjs --quiet
	@env BABEL_ENV=cjs npx babel src --config-file ./babel.config.lib.json --source-root src --out-dir lib --extensions .mjs,.ts --out-file-extension .js --quiet
	@node copy.mjs
	@rm -rf lib/types.*js
	@cp lib/index.d.ts lib/index.d.mts
	
prepare-build:
	@rm -rf lib
	@mkdir -p lib

publish: build
	cd lib && npm publish --access public

publish-next: build
	cd lib && npm publish --access public --tag next

link:
	@cd lib && npm link

install-attw:
	@if ! command -v attw >/dev/null 2>&1; then \
		npm i -g @arethetypeswrong/cli; \
	fi