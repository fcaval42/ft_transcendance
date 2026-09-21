
.PHONY: server open o npx db stop

server:
	docker compose up -d --build && cd backend && npx prisma migrate dev

open:
	open https://localhost:8443/

o:
	open https://10.18.195.241:8443/

npx:
	npx prisma studio

db:
	open http://localhost:5555/

stop:
	docker compose down && pkill -f "prisma studio"
