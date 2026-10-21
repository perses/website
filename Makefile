.PHONY: install
install:
	pnpm install --frozen-lockfile

.PHONY: dev
dev: install
	pnpm dev

.PHONY: build
build: install
	pnpm build

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
