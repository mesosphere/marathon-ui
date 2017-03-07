# can't use 5 https://github.com/npm/npm/issues/9863
FROM node:4.2.3

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app/
RUN npm install

RUN npm install -g \
  corsproxy \
  gulp

COPY docker/package.json /usr/src/app/docker/
RUN cd docker && \
  npm install .

COPY . /usr/src/app

# ENV MARATHON_API_URL
COPY src/js/config/config.docker.js src/js/config/config.dev.js

EXPOSE 1337 4200
ENV CORSPROXY_HOST 0.0.0.0
ENTRYPOINT [ "./docker/entrypoint.sh" ]
CMD [ "npm", "run", "serve" ]
