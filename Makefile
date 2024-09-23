help:
	@echo "Usage: make [target]"
	@echo "Usage: make [target]"
	@echo "Targets:"
	@echo "  volumes: Create volumes"
	@echo "  clean: Remove volumes and containers"
	@echo "  stop: Stop containers"
	@echo "  re: Rebuild containers and run production mode"
	@echo "  prod: Run in production mode"
	@echo "  dev: Run in development mode"

volumes:
	@mkdir -p volumes/db volumes/redis

clean:
	@docker compose down -v
	@sudo rm -rf volumes
	@docker system prune -af
	@docker volume prune -f
	# @docker stop $(docker ps -a -q)
	# @docker rm $(docker ps -a -q)
	@/etc/init.d/redis-server stop

stop:
	@docker compose down --remove-orphans

re: clean volumes prod

prod: volumes
	@docker compose -f docker-compose.prod.yml up -d --build

dev: volumes
	@sed -i '2s/[^ ]*[^ ]/127.0.0.1:8000/3' .env
	@sed -i '1s/[^ ]*[^ ]/http:\/\//3' .env
	@sed -i '1s/[^ ]*[^ ]/false/5' frontend/angular/src/env.ts
	@docker compose -f docker-compose.yml up
