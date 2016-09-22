var fs = require('fs')
var cheerio = require('cheerio')
var request = require('request')


function prompt(question, callback) {
    var stdin = process.stdin,
        stdout = process.stdout;

    stdin.resume();
    stdout.write(question);

    stdin.once('data', function (data) {
        callback(data.toString().trim());
    });
}

prompt('Give us a London Data Store url: ', function (input) {
    url = input;
    //process.exit();
    request(url, function (error, response, html) {
      if (!error && response.statusCode == 200) {
        var $ = cheerio.load(html)
          $('.icon-download').each(function(){
            // FIRST PART
            // Select Title + Description and create Disclosure
            var base = $(this).parent().parent().parent().parent().parent().parent().parent()
            var datasetTitle =base.children().eq(1).children().eq(1).text().trim()
            var datasetDescription =base.children().eq(1).children().eq(3).text().trim().replace(/(\r\n|\n|\r)/gm," ")

            // Create var License + Metadata and create About the tool
            var lic = '## This data is under the following License: ' + "\n" + base.children().eq(12).text().trim()
            var moreData = base.children().eq(15).text()
            var info = '# Title: ' + "\n" + datasetTitle + "\n" + '# Description: ' + "\n" + datasetDescription + "\n" + '# Disclosure: ' + "\n" + 'This data was provides by [London Data Store](http://data.london.gov.uk/) through his CKAN API. More information about this tool [here](#).'

            // Writing documents for each piece of information
                  // Write md Documents on Data folder
                  fs.writeFile('README.md', info, function(err) {
                    if (err) return console.log(err)
                  });

                  fs.writeFile('License.md', lic, function(err) {
                    if (err) return console.log(err)
                  });

                  fs.writeFile('More-Information.md',moreData, function (err) {
                    if (err) return console.log(err)
                  });
          })
          //END FIRST PART

          // SECOND PART
          // Extract links to download from given urls
          var links = []

          // Select links from up to 20 list files
          $('.resource-list').each(function(){
            for(var i = 0; i < 21; i++){
              var x = $(this).children().eq([i]).children().eq(2).children().eq(2).children().eq(1).attr('href')
              links.push(x)
            }
          })

          // Clean 'undefined' entries
          var linksClean = links.filter(function(n){ return n != undefined })

          // Prepare txt file to download files
          var linksOrder = []
            for(var z = 0; z < linksClean.length; z++){
              var o = linksClean[z].replace(/(\r\n|\n|\r)/gm," ") + '\n'
              linksOrder.push(o)
            }

          // Write a txt file with urls to download files
          for(var w = 0; w < linksOrder.length; w++){
            fs.appendFile("files.txt", linksOrder[w], (err) => {
                if (err) throw err;
            });
          }
          // END SECOND PART
        }
    })
    console.log('Done!');
});
