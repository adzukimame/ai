#!/bin/bash
while true; do curl -Sfso/dev/null "http://localhost:3000/healthz"; [ $? == "0" ] && break; sleep 1; done
