#!/bin/sh
#

do_docker_install() {
    curl -sSL https://get.docker.com/ | sh
}

do_master_init() {
    echo "Initializing dockerbox"
    do_docker_install
    service docker stop
    killall -9 docker
    echo $1' registry' >> /etc/hosts
    docker daemon -H tcp://0.0.0.0:2375 --insecure-registry registry:5000&
}
do_master_init