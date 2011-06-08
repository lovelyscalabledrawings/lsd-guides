echo "Compiling first chapter"
haml 1_setup/annotated.haml > 1_setup/annotated.html
murdoc 1_setup/demo.html 1_setup/annotated.html 1_setup/annotated.js 1_setup.html -t murdoc/murdoc.template.html.haml -s murdoc/murdoc.stylesheet.css --do-not-count-comment-lines
murdoc-strip-comments 1_setup/annotated.js > 1_setup/fiddle.js
murdoc-strip-comments 1_setup/annotated.html > 1_setup/fiddle.html
echo "Compiling second chapter"
haml 2_fields/annotated.haml > 2_fields/annotated.html
murdoc 2_fields/demo.html 2_fields/annotated.html 2_fields/annotated.js 2_fields.html -t murdoc/murdoc.template.html.haml -s murdoc/murdoc.stylesheet.css --do-not-count-comment-lines
murdoc-strip-comments 2_fields/annotated.js > 2_fields/fiddle.js
murdoc-strip-comments 2_fields/annotated.html > 2_fields/fiddle.html

