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

ENV_FILE=.env
ENV_TS_FILE=frontend/angular/src/env.ts

# Command to retrieve the public IP of the EC2 instance using AWS CLI
get_public_ip:
	@bash -c 'INSTANCE_ID=$$(curl -s http://169.254.169.254/latest/meta-data/instance-id); \
	PUBLIC_IP=$$(aws ec2 describe-instances --instance-ids $$INSTANCE_ID --query "Reservations[0].Instances[0].PublicIpAddress" --output text); \
	if [ -n "$$PUBLIC_IP" ]; then \
		echo "Updating .env with public IP: $$PUBLIC_IP"; \
		sed -i "/IP_SERVER=/d" $(ENV_FILE); \
		echo "IP_SERVER=$${PUBLIC_IP}:8000" >> $(ENV_FILE); \
		echo "Updating Angular env.ts with public IP: $$PUBLIC_IP"; \
		sed -i "s|IP_SERVER = .*|IP_SERVER = \"http://$${PUBLIC_IP}:8000\";|g" $(ENV_TS_FILE); \
	else \
		echo "Failed to retrieve public IP"; \
	fi'

stop:
	@docker compose down

re: clean volumes prod

prod: get_public_ip volumes
	@docker compose -f docker-compose.prod.yml up --build

dev: volumes
	@sed -i '2s/[^ ]*[^ ]/127.0.0.1:8000/3' .env
	@sed -i '1s/[^ ]*[^ ]/http:\/\//3' .env
	@sed -i '1s/[^ ]*[^ ]/false/5' frontend/angular/src/env.ts
	@docker compose -f docker-compose.yml up