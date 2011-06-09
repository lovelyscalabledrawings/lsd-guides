#!/usr/bin/env ruby -i

result = {}
i = 0
$stdin.each_line do |line|
  line = line.gsub(/([^\t]*)(\t)/) { $1 + " " * (8 - $1.length % 8) }
  i+=1
  result[i] = case line[62].chr
  when " ":
    :old
  when ">":
    :new
  when "|"
    :changed
  end
end

lines = []
file = File.open(ARGV[0])
file.read.each do |line|
  lines << line
end
content = lines.join('')
last = 0
int = 0
replaced = content.gsub(/<figure>[^<]*<ol>(.*?)<\/ol>/m) do |match|
  if int < last
    last = 99999
    match
  else
    match.gsub(/<li>(.*?)<\/li>/) do |number, a|
      int = number.match(/<li>(.*?)<\/li>/)[1].to_i
      if int < last
        last = 99999
        number
      else
        str = "<li class='#{result[int]}'>#{int}</li>"
        last = int
        str
      end
    end
  end
end
file.close()
file = File.open(ARGV[0], 'w')
file.write(replaced)