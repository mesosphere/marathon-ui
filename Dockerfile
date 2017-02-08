FROM node:5.4.1

MAINTAINER Orlando Hohmeier <orlando@mesosphere.io>

WORKDIR /opt/marathon-ui

ADD . /opt/marathon-ui/

USER root

VOLUME "/opt/marathon-ui/tests"
VOLUME "/opt/marathon-ui/dist"

ENTRYPOINT ["npm"]
CMD ["run", "serve"]
