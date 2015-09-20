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
    mkdir -p /opt/dockerboxsetup/install
    rm -rf /opt/dockerboxsetup/install/*
    mkdir /opt/dockerboxsetup/install/dockerbox
    mkdir /opt/dockerboxsetup/install/elb
    mkdir -p /opt/dockerboxsetup/data/couchdb
    service docker stop
    killall -9 docker
    docker daemon -H tcp://0.0.0.0:2375 --insecure-registry registry:5000&
    sleep 20
    cd /opt/dockerboxsetup/install/dockerbox \
    && wget https://raw.githubusercontent.com/dockerx/dockerbox/ssi/Dockerfile \
    && cd /opt/dockerboxsetup/install/elb \
    && wget https://raw.githubusercontent.com/dockerx/dockerbox-proxy/master/Dockerfile \
    && cd /opt/dockerboxsetup/install \
    && wget https://raw.githubusercontent.com/dockerx/dockerbox/ssi/docker-compose.yml \
    && DOCKER_HOST=tcp://0.0.0.0:2375 /usr/local/bin/docker-compose up -d
}
do_master_init
