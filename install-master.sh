#!/bin/sh
#


do_docker_install() {
    curl -sSL https://get.docker.com/ | sh
}

do_master_init() {
    echo "Initializing dockerbox"

    do_docker_install
    #Install docker compose
    curl -L https://github.com/docker/compose/releases/download/1.4.1/docker-compose-`uname -s`-`uname -m` > /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    mkdir -p /opt/docker-compose
    rm -rf /opt/docker-compose/*
    service docker stop
    killall -9 docker
    docker daemon -H tcp://0.0.0.0:2375&
    sleep 20
    cd /opt/docker-compose/ && wget https://raw.githubusercontent.com/dockerx/dockerbox/admin/Dockerfile&& wget https://raw.githubusercontent.com/dockerx/dockerbox/admin/docker-compose.yml  && DOCKER_HOST=tcp://0.0.0.0:2375 /usr/local/bin/docker-compose up -d
}
do_master_init
