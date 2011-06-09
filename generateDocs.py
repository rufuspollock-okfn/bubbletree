# encoding: utf-8
import markdown
txt = open('readme.txt').read()
content = markdown.markdown(txt);

head = """
<!-- 
  -- please do not edit this auto-generated file.
  -- instead, change readme.txt and run generateDocs.py
-->
<html>
<head>
<style type="text/css">
body { font-family: sans; margin: 40px; background: #f8f8f8 }
#wrapper { width: 100ex; margin: 0 auto; background: white; border:1px solid #e9e9e9; padding: 1em 2em; }

@font-face {
	font-family: Graublau;
	src: url('fonts/graublau/GraublauWeb.otf') format("opentype");
}
h1,h2,h3 { font-family: Graublau, Georgia, sans-serif; }
</style>
<title>OpenSpending BubbleTree Documentation</title>
</head>
<body><div id="wrapper">
"""

footer = "</div></body></html>"

out = open('readme.html', 'wb')
out.write(head)
out.write(content)
out.write(footer)
out.close()

print "Converted markdown documentation to html"