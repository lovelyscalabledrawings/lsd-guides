echo "Compiling first chapter"
haml 1_layout/source/annotated.haml > 1_layout/source/annotated.html
murdoc 1_layout/source/demo.html 1_layout/source/annotated.html 1_layout/source/annotated.js 1_layout.html -t murdoc/murdoc.template.html.haml -s murdoc/murdoc.stylesheet.css --do-not-count-comment-lines
murdoc-strip-comments 1_layout/source/annotated.js > 1_layout/demo/demo.js
murdoc-strip-comments 1_layout/source/annotated.html > 1_layout/demo/demo.html
sass 1_layout/demo/demo.sass > 1_layout/demo/demo.css
echo "Compiling second chapter"
haml 2_fields/source/annotated.haml > 2_fields/source/annotated.html
murdoc 2_fields/source/demo.html 2_fields/source/annotated.html 2_fields/source/annotated.js 2_fields.html -t murdoc/murdoc.template.html.haml -s murdoc/murdoc.stylesheet.css --do-not-count-comment-lines
murdoc-strip-comments 2_fields/source/annotated.js > 2_fields/demo/demo.js
murdoc-strip-comments 2_fields/source/annotated.html > 2_fields/demo/demo.html
sdiff 1_layout/demo/demo.html 2_fields/demo/demo.html | ./bin/diff.rb 2_fields.html
sdiff 1_layout/demo/demo.js 2_fields/demo/demo.js | ./bin/diff.rb 2_fields.html

sass 2_fields/demo/demo.sass > 2_fields/demo/demo.css
echo "Compiling third chapter"
haml 3_actions/source/annotated.haml > 3_actions/source/annotated.html
murdoc 3_actions/source/demo.html 3_actions/source/annotated.html 3_actions/source/annotated.js 3_actions.html -t murdoc/murdoc.template.html.haml -s murdoc/murdoc.stylesheet.css --do-not-count-comment-lines
murdoc-strip-comments 3_actions/source/annotated.js > 3_actions/demo/demo.js
murdoc-strip-comments 3_actions/source/annotated.html > 3_actions/demo/demo.html
sass 3_actions/demo/demo.sass > 3_actions/demo/demo.css
sdiff 2_fields/demo/demo.html 3_actions/demo/demo.html | ./bin/diff.rb 3_actions.html
sdiff 2_fields/demo/demo.js 3_actions/demo/demo.js | ./bin/diff.rb 3_actions.html