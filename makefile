
.PHONY: install tunnel server open o npx db stop

SHELL    := /bin/bash
NVM_DIR  := $(HOME)/.nvm
LOAD_NVM := export NVM_DIR="$(NVM_DIR)" && source "$(NVM_DIR)/nvm.sh" --no-use
NODE24   := $(LOAD_NVM) && nvm use 24 > /dev/null

install:
	@[ -s "$(NVM_DIR)/nvm.sh" ] || curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.8/install.sh | bash > /dev/null 2>&1
	@$(LOAD_NVM) && { nvm use 24 > /dev/null 2>&1 || nvm install --no-progress 24 > /dev/null 2>&1; }
	@$(NODE24) && npm install --loglevel=error --no-audit --no-fund --no-update-notifier > /dev/null
	@[ -x cloudflared ] || { curl -fsSLo cloudflared https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 && chmod +x cloudflared; }

tunnel: install server
	./cloudflared tunnel --url https://localhost:8443 --no-tls-verify

server: install
	@docker compose up -d --build && $(NODE24) && cd backend && npx prisma migrate dev

open:
	open https://localhost:8443/

npx: install
	@$(NODE24) && cd backend && npx prisma studio

db:
	open http://localhost:5555/

stop:
	docker compose down && pkill -f "prisma studio"
