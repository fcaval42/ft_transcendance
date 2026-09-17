
.PHONY: server open db stop

server:
	docker compose up -d --build && cd backend && npx prisma migrate dev && npx prisma studio

open:
	open https://localhost:8443/

db:
	open http://localhost:5555/

stop:
	docker compose down && pkill -f "prisma studio"
