#!/bin/bash
mongoimport --db nourriture-android-test --collection consumers test/samples/consumers.json
mongoimport --db nourriture-android-test --collection moments test/samples/moments.json