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
	@# The files are copied in place, so the website served by nginx stays available during the build and the copy.
	rsync -a --delete-after build/client/ site/

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
