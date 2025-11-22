var axios = require("axios")
var nodeMailer = require("nodemailer")
var cheerio = require("cheerio")
var creds = require("./credentials.json")
var $
var results = []
var args = process.argv

if(args.length > 2){ //TODO Consider how to search the array of objects for a given artist. Perhaps create an array for each artist and push their songs there. 
    webScraper()
}else{
    console.log("Insufficient parameters. Please enter the artists you want to search for.")
}

function webScraper(){
    axios.get("https://www.popvortex.com/music/charts/top-rap-songs.php") //Collects popvortex's DOM
    .then((response) => {
        console.log(`Status Code: ${response.status}`) //Reports the status code
        $ = cheerio.load(response.data) //Loads the DOM into the cheerio selector

        if($){
            $("p.title-artist").each(function(i, element) { //Selects all paragraphs with the class 'title-artist' which contains the title and artist(s) for a song. 
                let title = $(this).find("cite.title").text() //Processes each elements title and artist child elements' text.
                let artist = $(this).find("em.artist").text()
                // let test = "test"
                if(artist.includes("&")){ //Splits the artists and stores them in an array if there are multiple artists. 
                    artist = artist.split("&")
                    artist.forEach(function(element, index, artist) {
                        artist[index] = element.trim()
                    });
                }

                let featIndex = title.indexOf("feat.") //Finds where the 'featuring' credit starts. 
                if(featIndex != -1){
                    let featEnd = title.indexOf(")", featIndex) //Finds where the 'featuring' credit ends.
                    let featArtists = title.substring(featIndex + 6, featEnd) //Collects the substring containing the featured artist(s) name. 
                    if(featArtists.includes("&")){ //Splits the artists and stores them in an array if there are multiple artists. 
                        featArtists = featArtists.split("&")
                        featArtists.forEach(function(element, index, featArtists) {
                            featArtists[index] = element.trim()
                        });
                    }

                    //Checks if there are already multiple artist by checking the artist variable's type. If it is, it concatenates the featured artists
                    //otherwise, it adds the original artist to an array and concatenates them. 
                    if(typeof(artist) == "object"){ 
                        artist = artist.concat(featArtists)
                    }else{
                        artist = [artist].concat(featArtists)
                    }
                }
                results.push({"title": title, "artist": artist})
            })
        }

        console.log(results)
    })
    .catch((error) => {
        console.log(`Error. Please try again.\nE: ${error}`)
    })
}