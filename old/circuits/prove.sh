#!/bin/bash
if [ "$#" -ne 1 ]; then
  echo "Usage: ./prove.sh [TESTNAME_STRING]"
  exit 1
fi
cd /tmp/$1 && nargo execute witness && bb prove -b ./target/health_data_sharing.json -w ./target/health_data_sharing.gz -o ./target/health_data_sharing.proof && echo "Proof Generated"
