#!/bin/bash
set -e
SRC=src/js/*.js
OUTFILE=build/bubbletree.js
echo "Checking JS"
while read LINE
do
    jshint $LINE --reporter src/buildtools/reporter.js
done < makefile

echo "Combining JS files"
DATE=`date +%s`
TMP=tmp_$DATE
TMPFILE=$TMP/tmp.js
mkdir $TMP
touch $TMPFILE

while read LINE
do
    cat $LINE >> $TMPFILE
done < makefile


if [ "$1" == "debug" ]; then
  cp $TMPFILE $OUTFILE
else
  echo "Minifying JS files"
  uglifyjs -o $OUTFILE $TMPFILE
fi
rm -Rf $TMP

python generateDocs.py
