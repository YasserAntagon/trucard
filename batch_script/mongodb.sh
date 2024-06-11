#!/bin/bash
mongosh --host 127.0.0.1 --port 27017 --file ./script/adminScript.js --file ./script/assetstoreScript.js --file ./script/assetmanagerScript.js --file ./script/defaultConf.js;
