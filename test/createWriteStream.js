// затирает файл на длину вставляемого текста

const fs = require('fs');
const s = fs.createWriteStream('./test.txt', {start: 10, flags: 'r+'});
s.write('88566');
s.close();