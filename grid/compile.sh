echo "Compiling first chapter"
haml 1_layout/source/annotated.haml > 1_layout/source/annotated.html
murdoc 1_layout/source/demo.html 1_layout/source/annotated.html 1_layout/source/annotated.js 1_layout.html -t murdoc/murdoc.template.html.haml -s murdoc/murdoc.stylesheet.css --do-not-count-comment-lines
murdoc-strip-comments 1_layout/source/annotated.js > 1_layout/demo/fiddle.js
murdoc-strip-comments 1_layout/source/annotated.html > 1_layout/demo/fiddle.html
sass 1_layout/demo/fiddle.sass > 1_layout/demo/fiddle.css
echo "Compiling second chapter"
haml 2_fields/source/annotated.haml > 2_fields/source/annotated.html
murdoc 2_fields/source/demo.html 2_fields/source/annotated.html 2_fields/source/annotated.js 2_fields.html -t murdoc/murdoc.template.html.haml -s murdoc/murdoc.stylesheet.css --do-not-count-comment-lines
murdoc-strip-comments 2_fields/source/annotated.js > 2_fields/demo/fiddle.js
murdoc-strip-comments 2_fields/source/annotated.html > 2_fields/demo/fiddle.html
sass 2_fields/demo/fiddle.sass > 2_fields/demo/fiddle.css