echo "Compiling first chapter"
haml 1_layout/annotated.haml > 1_layout/annotated.html
murdoc 1_layout/demo.html 1_layout/annotated.html 1_layout/annotated.js 1_layout.html -t murdoc/murdoc.template.html.haml -s murdoc/murdoc.stylesheet.css --do-not-count-comment-lines
murdoc-strip-comments 1_layout/annotated.js > 1_layout/fiddle.js
murdoc-strip-comments 1_layout/annotated.html > 1_layout/fiddle.html
sass 1_layout/fiddle.sass > 1_layout/fiddle.css
echo "Compiling second chapter"
haml 2_fields/annotated.haml > 2_fields/annotated.html
murdoc 2_fields/demo.html 2_fields/annotated.html 2_fields/annotated.js 2_fields.html -t murdoc/murdoc.template.html.haml -s murdoc/murdoc.stylesheet.css --do-not-count-comment-lines
murdoc-strip-comments 2_fields/annotated.js > 2_fields/fiddle.js
murdoc-strip-comments 2_fields/annotated.html > 2_fields/fiddle.html
sass 2_fields/fiddle.sass > 2_fields/fiddle.css
