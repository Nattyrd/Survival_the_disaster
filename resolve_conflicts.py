import pathlib

root = pathlib.Path('Public/js')
files = list(root.rglob('*.js'))
conflicted = []
for p in files:
    text = p.read_text(encoding='utf-8')
    if '<<<<<<< HEAD' in text:
        conflicted.append(p)
        new = ''
        i = 0
        while True:
            j = text.find('<<<<<<< HEAD', i)
            if j == -1:
                new += text[i:]
                break
            new += text[i:j]
            k = text.find('=======', j)
            if k == -1:
                raise SystemExit(f'Missing ======= in {p}')
            l = text.find('>>>>>>>', k)
            if l == -1:
                raise SystemExit(f'Missing >>>>>>> in {p}')
            head_block = text[j + len('<<<<<<< HEAD'):k]
            new += head_block
            i = text.find('\n', l)
            if i == -1:
                i = l + len('>>>>>>>')
            else:
                i += 1
        p.write_text(new, encoding='utf-8')
        print('patched', p)
print('done', len(conflicted), 'files')
