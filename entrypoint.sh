#!/usr/bin/env bash

if [[ -n $* ]]; then
  eval $*
else
  tail -f /dev/null
fi
