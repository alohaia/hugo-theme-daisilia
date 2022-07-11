#!/bin/bash

if [[ $# -gt 0 ]]; then
    mes="`date +%Y-%m-%dT%T%:z` $1"
else
    mes="`date +%Y-%m-%dT%T%:z`"
fi

Rscript utils/R/build.R

python utils/genrefs.py

git add .
git commit -m "${mes}"
git push
