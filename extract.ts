/// <reference path="./typings/main/ambient/node/index.d.ts" />

var pdf = require('pdf-extract');

var errors = [];
var options = {
    type: 'text'  // extract the actual text in the pdf file
};

var processor = pdf(process.argv[2], options, function(err) {
    if (err) {
        console.log(err);
    }
});

function processPage(page: string) {
    var lines = page.split('\n');
    lines.splice(0,4);
    var index: number = 0;
    while (index < lines.length) {
        try {
            var line0 = lines[index].match(/\d{2,16}\s+(.+?)\s{2,99}\u274F/);
            if (line0 && lines[index + 3].slice(0,6) !== 'Postal') {
                var line1 = lines[index + 1].match(/\s{3,99}(.+?)\s{2,99}\u274F/);
                var line2 = lines[index + 2].match(/\s{3,99}(.+?)\s{2,99}\u274F/);
                console.log('"' + line0[1] + '","' + line1[1] + '","' + line2[1] + '"');
            }
        }
        catch (e) {
           errors.push(e.message)
        }
        finally {
            index = index + 4;
        }
    }
}

processor.on('complete', function(data) {
    var text = data.text_pages;
    text.splice(0,2);
    text.forEach(page => {
        processPage(page);
    });
    if (errors.length > 0) {
        console.log('ERRORS:');
        console.log(JSON.stringify(errors, null, 2));
    }
});

processor.on('error', function(err) {
    console.log(JSON.stringify(err, null, 2));
});

