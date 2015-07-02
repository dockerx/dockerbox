productionupdate:
	git pull origin master;
	pm2 kill;
	rm -r logs/*;
	pm2 start bin/www -n dockerbox -e logs/pm2-err.log -o logs/pm2-out.log;
	tail -f logs/*;