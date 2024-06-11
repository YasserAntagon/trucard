#!/bin/bash
cd adminDash && pwd && rm -rf node_modules/ package-lock.json && npm i && npm audit fix --force

cd ../admin
ls -d */ | awk '{print $NF}' | xargs -n1 sh -c 'cd $0 && pwd && rm -rf node_modules/ package-lock.json && npm i && npm audit fix --force'
 
cd ../core
ls -d */ | awk '{print $NF}' | xargs -n1 sh -c 'cd $0 && pwd && rm -rf node_modules/ package-lock.json && npm i && npm audit fix --force'

cd ../route
ls -d */ | awk '{print $NF}' | xargs -n1 sh -c 'cd $0 && pwd && rm -rf node_modules/ package-lock.json && npm i && npm audit fix --force'

