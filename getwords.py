words = []
with open("/usr/share/dict/words", "r") as fd:
    for line in fd:
        word = line.strip()
        if len(word) == 5:
            words.append(word.upper())

with open('data.js', 'w') as fd:
    fd.write("const words = %s;\nexport default words;" % repr(words))