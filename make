#!/bin/bash

#
# this is the make script for the BubbleTree
# it requires installation of node.js with the following
# modules installed:
#
# - jshint, for checking the js syntax
# - uglify-js, for js minification
# - markdown-js, for translation of readme.md to index.html
#
# Usage: 
# just run ./make and be happy
#
#

set -e
OUTFILE=build/bubbletree.js
MINFILE=build/bubbletree.min.js
README=index.html

echo "Checking JS files"
while read LINE
do
    jshint $LINE --reporter buildtools/reporter.js
done < manifest

echo "Combining JS files"
DATE=`date +%s`
TMP=tmp_$DATE
TMPFILE=$TMP/tmp.js
mkdir $TMP
touch $TMPFILE

while read LINE
do
    cat $LINE >> $TMPFILE
done < manifest

cp $TMPFILE $OUTFILE

echo "Compressing JS files"
uglifyjs -o $MINFILE $TMPFILE

echo "Updating index.html from readme"
markdown readme.md -f $TMP/readme.html.body

rm $README
touch index.html
cat buildtools/readme.html.head >> $README
cat $TMP/readme.html.body >> $README
cat buildtools/readme.html.foot >> $README


# create index file for demos
DEMOS=demos/*

touch $TMP/demos.md
rm demos/index.html
for f in $DEMOS
do
  # take action on each file. $f store current file name
  echo "* [${f:6}](${f:6}/index.html)" >> $TMP/demos.md
done
markdown $TMP/demos.md -f $TMP/demos.html.body
touch demos/index.html
cat  buildtools/demos.html.head > demos/index.html
cat  $TMP/demos.html.body >> demos/index.html
cat  buildtools/demos.html.foot >> demos/index.html

# remove temporary folder
rm -Rf $TMP
