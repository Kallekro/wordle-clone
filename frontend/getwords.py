words = []
with open("/usr/share/dict/words", "r") as fd:
    for i, line in enumerate(fd):
        word = line.strip()
        if len(word) == 5 and not ord(word[0]) < 91:
            words.append(word.upper())

with open('data.js', 'w') as fd:
    fd.write("const words = %s;\nexport {words};" % repr(words))