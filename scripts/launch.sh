#!/bin/bash
APP_REVERSE_PROXY_URL=$(eval echo ${APP_REVERSE_PROXY})
cat <<EOF > runtimeConfig.js
var runtimeConfig = {
  appReverseProxy: "${APP_REVERSE_PROXY_URL}"
};
EOF
python -m SimpleHTTPServer $1
