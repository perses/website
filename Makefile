.PHONY: synchronize
synchronize:
	@bash ./scripts/synchronize.sh

.PHONY: website-install-depenencies
website-install-depenencies:
	@npm install --prefix ./website

.PHONY: website-preview
website-preview: website-install-depenencies synchronize
	@npm run dev --prefix ./website

.PHONY: generate-config
generate-config:
	@bash ./scripts/generate_config.sh
