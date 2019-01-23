#!/bin/sh

git pull
docker-compose build
docker-compose up -d