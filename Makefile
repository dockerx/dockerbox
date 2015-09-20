install:
	git checkout ssi;
	git pull origin ssi;
	npm install;
	mv secrets_sample.json secrets.json
	mkdir -p logs
	pm2 kill;
	rm -r logs/*;
	DOCKERBOX_INIT=true pm2 start bin/www -n dockerbox -e logs/pm2-err.log -o logs/pm2-out.log;