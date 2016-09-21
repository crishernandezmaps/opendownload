var fs = require('fs')
var cheerio = require('cheerio')
var request = require('request')

var urlMadrid = 'http://datos.madrid.es/portal/site/egob/menuitem.c05c1f754a33a9fbe4b2e4b284f1a5a0/?vgnextoid=f3c0f7d512273410VgnVCM2000000c205a0aRCRD&vgnextchannel=374512b9ace9f310VgnVCM100000171f5a0aRCRD&vgnextfmt=default'

request(urlMadrid, function (error, response, html) {
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
          var x = $(this).children().eq([i]).children().eq(1).children().eq(0).children().eq(0).attr('href')
          links.push(x)
        }
      })

      // Clean 'undefined' entries
      var linksClean = links.filter(function(n){ return n != undefined })

      // Prepare txt file to download files
      var linksOrder = []
        for(var z = 0; z < linksClean.length; z++){
          var o = 'http://datos.madrid.es/'+linksClean[z].toString().replace(/,/g, '') + '\n'
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
