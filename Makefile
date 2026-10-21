.PHONY: install
install:
	pnpm install --frozen-lockfile

.PHONY: dev
dev: install
	pnpm dev

.PHONY: build
build: install
	pnpm build

.PHONY: deploy-website
deploy-website: install
	pnpm build
	@mkdir -p site
	@# The website served by nginx stays available during the build. The new files are moved in place at the end of
	@# the copy (--delay-updates), so the pages never reference assets that are not copied yet.
	rsync -a --delay-updates --delete-after build/client/ site/

.PHONY: lint
lint: install
	pnpm lint
	pnpm typecheck

.PHONY: test
test: install
	pnpm test

.PHONY: generate-config
generate-config:
	@bash ./scripts/generate_config.sh
