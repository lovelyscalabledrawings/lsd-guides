echo "Compiling first chapter"
murdoc 1_setup/annotated.js 1_setup.js.html -t murdoc/murdoc.template.html.haml -s murdoc/murdoc.stylesheet.css --do-not-count-comment-lines
haml 1_setup/annotated.haml > 1_setup/annotated.html
murdoc 1_setup/annotated.html 1_setup.html.html -t murdoc/murdoc.template.html.haml -s murdoc/murdoc.stylesheet.css --do-not-count-comment-lines
murdoc-strip-comments 1_setup/annotated.js > 1_setup/fiddle.js
murdoc-strip-comments 1_setup/annotated.html > 1_setup/fiddle.html
echo "Compiling second chapter"
murdoc 2_fields/annotated.js 2_fields.js.html -t murdoc/murdoc.template.html.haml -s murdoc/murdoc.stylesheet.css --do-not-count-comment-lines
haml 2_fields/annotated.haml > 2_fields/annotated.html
murdoc 2_fields/annotated.html 2_fields.html.html -t murdoc/murdoc.template.html.haml -s murdoc/murdoc.stylesheet.css --do-not-count-comment-lines
murdoc-strip-comments 2_fields/annotated.js > 2_fields/fiddle.js
murdoc-strip-comments 2_fields/annotated.html > 2_fields/fiddle.html

