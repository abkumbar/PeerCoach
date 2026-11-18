# Simple cross-platform orchestrator using Python

.PHONY: dev package frontend-build clean-dist

dev:
	python dev.py

frontend-build:
	cd frontend && npm run build

package:
	python scripts/package.py

clean-dist:
	@if exist dist rmdir /S /Q dist
	@if not exist dist @echo dist cleaned

