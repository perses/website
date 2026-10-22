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
	@mkdir -p site/assets
	@# The assets (JavaScript, CSS, fonts) have a hash in their name. They are copied first, without removing the ones of
	@# the previous builds, which can still be loaded by the pages already open in the browsers.
	rsync -a --delay-updates build/client/assets/ site/assets/
	@# Then the pages are replaced. The new files are moved in place at the end of the copy (--delay-updates).
	rsync -a --delay-updates --delete-after --exclude /assets/ build/client/ site/
	@# The assets of the previous builds are removed after a week. The assets of the current build have just been copied:
	@# rsync sets their modification time to the time of the build.
	find site/assets -type f -mtime +7 -delete

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
