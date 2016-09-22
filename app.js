// Using Node.js and Wget we can obtain all the neccesary metada and downloadable links from London Data Store and Portal de Datos Abiertos de Madrid.

var fs = require('fs')
var cheerio = require('cheerio')
var request = require('request')
var colors = require('colors')

function prompt(question, callback) {
    var stdin = process.stdin,
        stdout = process.stdout;

    stdin.resume();
    stdout.write(question);

    stdin.once('data', function (data) {
        callback(data.toString().trim());
    });
}


prompt('city: '.green, function (city,url) {
    city = city.toLowerCase();
    if(city === 'london'){
      prompt('give us a url: '.yellow, function (input) {
        var url = input;
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
                      fs.writeFile('data-london/README.md', info, function(err) {
                        if (err) return console.log(err)
                      });

                      fs.writeFile('data-london/License.md', lic, function(err) {
                        if (err) return console.log(err)
                      });

                      fs.writeFile('data-london/More-Information.md',moreData, function (err) {
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
                  var o = linksClean[z].replace(" ", "&") + '\n'
                  linksOrder.push(o)
                }

              // Write a txt file with urls to download files
              for(var w = 0; w < linksOrder.length; w++){
                fs.appendFile("data-london/files.txt", linksOrder[w], (err) => {
                    if (err) throw err;
                });
              }
              // END SECOND PART
            }
        })
        console.log('Done!');

      });
    }
    else if (city === 'madrid') {
      prompt('danos una url: '.yellow, function (input) {
        var url = input;
        request(url, function (error, response, html) {
          if (!error && response.statusCode == 200) {
            var $ = cheerio.load(html)

              $('.summary').each(function(){
                // FIRST PART
                // Create README.md
                var base = $(this).children().eq(1)
                var datasetTitle = base.text()
                var datasetDescription = base.parent().next().children().eq(0).children().eq(0).text().trim()
                var metadataBase = base.parent().parent().children().eq(1).children().eq(0).children().eq(1).children().eq(0) //class: 'panel'
                var metadataInfo = metadataBase.children().eq(1).children().eq(0).text()

                var readme = '# Dataset Title: ' + '\n' + datasetTitle + '\n' + '# Dataset Description: ' + '\n' + datasetDescription + '\n' + '# Addiotional Information: ' + '\n' + metadataInfo


                // Writing documents for each piece of information
                // Write md Documents on Data folder
                fs.writeFile('data-madrid/README.md', readme, function(err) {
                  if (err) return console.log(err)
                });


              })
              //END FIRST PART


              // SECOND PART
              // Extract links to download from given urls


              var links = []

              // Select links from up to 50 list files
              $('.asociada-list').each(function(){
                for(var i = 0; i < 51; i++){
                  var x = $(this).children().eq([i]).children().eq(0).attr('href')
                  links.push(x)
                }
              })

              // Clean 'undefined' entries
              var linksClean = links.filter(function(n){ return n != undefined })

              // Prepare txt file to download files
              var linksOrder = []
                for(var z = 0; z < linksClean.length; z++){
                  var o = 'http://datos.madrid.es'+linksClean[z].toString().replace(/,/g, '') + '\n'
                  linksOrder.push(o)
                }

              // Write a txt file with urls to download files
              for(var w = 0; w < linksOrder.length; w++){
                fs.appendFile("data-madrid/files.txt", linksOrder[w], (err) => {
                    if (err) throw err;
                });
              }
             // END SECOND PART

            }
        })

        console.log('Done!');

      });
    }


    else {
      console.log('For the moment just London or Madrid... more cities, coming soon!'.rainbow.bgWhite);
    }
});


/// FIXES!!!!
// 1.- Right urls for London and Madrid
// 2.- Chat to share data
// 3.- Create game
