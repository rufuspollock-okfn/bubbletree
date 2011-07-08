#!/bin/bash
set -e
SRC=src/*.js
OUTFILE=bubbletree.min.js
echo "Checking JS"
for f in $SRC
do
  #echo "Checking $f"
  jshint $f --reporter src/buildtools/reporter.js
done

echo "Combining JS files"
DATE=`date +%s`
TMP=tmp_$DATE
TMPFILE=$TMP/tmp.js
mkdir $TMP
touch $TMPFILE

while read LINE
do
    cat $LINE >> $TMPFILE
done < includes.txt


if [ "$1" == "debug" ]; then
  cp $TMPFILE $OUTFILE
else
  echo "Minifying JS files"
  uglifyjs -o $OUTFILE $TMPFILE
fi
rm -Rf $TMP

python generateDocs.py
