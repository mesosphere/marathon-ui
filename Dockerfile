FROM node:5.4.1

MAINTAINER Orlando Hohmeier <orlando@mesosphere.io>

WORKDIR /opt/marathon-ui

COPY ./entrypoint.sh /opt/marathon-ui/entrypoint.sh
RUN npm install -g gulp

USER root

VOLUME "/opt/marathon-ui"

# Define entrypoint
ENTRYPOINT [ "/bin/bash", "/opt/marathon-ui/entrypoint.sh" ]
