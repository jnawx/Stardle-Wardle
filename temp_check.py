with open('fandom-cache/luke-skywalker.html', 'r', encoding='utf-8') as f:
    content = f.read()
    pos = content.find('id="Appearances"')
    if pos != -1:
        start = max(0, pos - 100)
        end = min(len(content), pos + 2000)
        print('Position:', pos)
        print('Context:')
        print(content[start:end])
    else:
        print('Appearances not found')
