#!/usr/bin/env bash

./run.sh tests/tests.wppl | grep '\[ false \]'

if ((PIPESTATUS[1] == 0)); then
	exit 1
fi
