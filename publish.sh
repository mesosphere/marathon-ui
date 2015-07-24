#!/bin/bash
set -o errexit -o nounset -o pipefail

export PROJECT_ARTIFACT_ID=${PROJECT_ARTIFACT_ID:-ui}
export PROJECT_VERSION=${PROJECT_VERSION:-0.0.1-SNAPSHOT}
export OUTPUT_DIR=${OUTPUT_DIR:-"target/classes/META-INF/resources/webjars/$PROJECT_ARTIFACT_ID"}

function setup {
  echo "PROJECT_ARTIFACT_ID = '$PROJECT_ARTIFACT_ID'"
  echo "PROJECT_VERSION = '$PROJECT_VERSION'"
  echo "OUTPUT_DIR = '$OUTPUT_DIR'"
  cleanUp
  mkdir -p $OUTPUT_DIR
  cp -r dist/* $OUTPUT_DIR
  envsubst < pom.xml.tpl > pom.xml
  ls
}

function deploy {
  mvn deploy
}

function install {
  mvn install
}

function cleanUp {
  rm -fr target
  rm -f pom.xml
}

case "$1" in
	setup)
		setup
		;;
	install)
    setup
    install
    cleanUp
		;;
	deployJar)
    setup
    deploy
    cleanUp
		;;
	clean)
    cleanUp
    ;;
	*)
		echo "Usage: $0 setup|deployJar|clean"
		;;
esac


