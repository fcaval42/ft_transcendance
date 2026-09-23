
.PHONY: install tunnel server open o npx db stop

SHELL    := /bin/bash
NVM_DIR  := $(HOME)/.nvm
LOAD_NVM := export NVM_DIR="$(NVM_DIR)" && source "$(NVM_DIR)/nvm.sh" --no-use
NODE24   := $(LOAD_NVM) && nvm use 24 > /dev/null
ENV_VAR   = $(shell grep -E '^$(1)=' .env 2>/dev/null | cut -d= -f2- | tr -d '"')

install:
	@[ -s "$(NVM_DIR)/nvm.sh" ] || curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.8/install.sh | bash > /dev/null 2>&1
	@$(LOAD_NVM) && { nvm use 24 > /dev/null 2>&1 || nvm install --no-progress 24 > /dev/null 2>&1; }
	@$(NODE24) && npm install --loglevel=error --no-audit --no-fund --no-update-notifier > /dev/null
	@[ -x ngrok ] || curl -fsSL https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.tgz | tar xz ngrok

tunnel: install
	@[ -n "$(call ENV_VAR,NGROK_URL)" ] || { echo "NGROK_URL manquant dans .env (voir .env.exemple)"; exit 1; }
	@NGROK_AUTHTOKEN=$(call ENV_VAR,NGROK_AUTHTOKEN) ./ngrok http https://localhost:8443 --url=$(call ENV_VAR,NGROK_URL)

server: install
	@docker compose up -d --build && $(NODE24) && cd backend && npx prisma migrate dev

npx: install
	@$(NODE24) && cd backend && npx prisma studio

db:
	open http://localhost:5555/

stop:
	docker compose down && pkill -f "prisma studio"
