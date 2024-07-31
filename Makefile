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
	perl -MYAML=LoadFile,Dump -MHash::Merge::Simple=merge -E 'say Dump(merge(map{LoadFile($_)}@ARGV))' perses.yaml ./secret/secret.yaml > ./secret/config.yaml
