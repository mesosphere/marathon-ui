#!/bin/bash

{ cd docker; ./bin/corsproxy; } &
exec $@
