var axios = require("axios") //HTTP requests module
var nodeMailer = require("nodemailer") //Email module
var cheerio = require("cheerio") //Webscraper module
var creds = require("./credentials.json") //Imports the credentials for nodemailer. 
var $ //Buffer for cheerio operations. 
var args = process.argv //Holds the arguments from the command line. 
var allArtist = [] //Holds the names of all artists processed by the scraper.
var artistToSong = [] //Holds an array of JSON objects mapping artists to songs they were involved in. 

//Ensures the user actually searched for some artists. 
if(args.length > 2){
    webScraper(args)
}else{
    console.log("Insufficient parameters. Please enter the artists you want to search for.");
}

//Main webscraper method. 
async function webScraper(args){
    axios.get("https://www.popvortex.com/music/charts/top-rap-songs.php") //Collects popvortex's DOM
    .then((response) => {
        $ = cheerio.load(response.data); //Loads the DOM into the cheerio selector

        if($){ //Ensures data was loaded into the buffer.
            $("p.title-artist").each(function(i, element) { //Selects all paragraphs with the class 'title-artist' which contains the title and artist(s) for a song. 
                //Processes each elements title and artist child elements' text.
                let title = $(this).find("cite.title").text(); 
                let artist = $(this).find("em.artist").text();
                let originalArtist = artist
                artist = artistSplitter(artist);

                let featIndex = title.indexOf("feat.") //Finds where the 'featuring' credit starts. 
                if(featIndex != -1){
                    let featEnd = title.indexOf(")", featIndex); //Finds where the 'featuring' credit ends.
                    let featArtists = title.substring(featIndex + 6, featEnd); //Collects the substring containing the featured artist(s) name. 
                    featArtists = artistSplitter(featArtists);
                    
                    artist = artist.concat(featArtists); //Adds featured artists to the array of all artists related to this song. 
                }
                
                artist.forEach(function(element){
                    if(allArtist.includes(element)){ //Checks if the artist has already been mapped. 
                        //If a mapping exists, push the new title to their songs array. Since their instance in allArtist and artistToSong were pushed at the same time
                        //They should exist at the same index in both arrays. 
                        artistToSong[allArtist.indexOf(element)].songs.push({"title": title, "originalArtist": originalArtist}) 
                    }else{
                        //If a mapping doesn't exist, create an instance in allArtist and push the artist with the current song into artistToSong.
                        allArtist.push(element)
                        artistToSong.push({"artist": element, "songs": [{"title": title, "originalArtist": originalArtist}]})
                    }
                });
            })
        }

        //Logs to the command line which artists were or weren't found. 
        let foundArtists = []
        for(i=2;i<args.length;i++){
            if(allArtist.includes(args[i])){
                console.log(`Artist ${args[i]} was found.`)
                foundArtists.push(args[i])
            }else{
                console.log(`Artist ${args[i]} was not found.`)
            }
        }

        //Sends the email containing the artist(s) and their songs. 
        mailer(foundArtists)
    })
    .catch((error) => {
        console.log(`Error. Please try again.\nE: ${error}`)
    })
}

//Splits a string containing one or more artist names into an array of artist names. 
function artistSplitter(artists) {
    let artistArray = [artists] //Converts the string parameter into an array. 
    if(artistArray[0].includes("&")){
        if(artistArray[0].includes(",")){ //Commas only matter if multiple artists are present, so this is checked second. 
            artistArray = artistArray[0].split(",")
        }
        let artistPair = artistArray[artistArray.length-1].split("&");
        artistArray.pop(); //Removes the element from the array containing two artist names separated by an &
        artistArray = artistArray.concat(artistPair); //Adds the new pair of artists to the array. 
        //Trims the whitespace from each artist name. 
        artistArray.forEach(function(element, index, artistArray){ 
            artistArray[index] = element.trim()
        });
    }

    return artistArray
}

//Creates and sends the email. 
function mailer(foundArtists){
    let transport = nodeMailer.createTransport({
        service: "gmail",
        auth: {
            user: creds.sender_email,
            pass: creds.sender_password
        }
    })

    //Formats the subject line of the email. 
    let subject = "";
    switch (foundArtists.length){
        case 1:
            subject = "You Artist Is: " + foundArtists[0];
            break;
        case 2: 
            subject = `Your Artists are: ${foundArtists[0]} and ${foundArtists[1]}`;
            break;
        default:
            subject = "Your Artists are: "
            for(i=0;i<foundArtists.length-1;i++){
                subject += foundArtists[i] + ", ";
            }
            subject += "and " + foundArtists[foundArtists.length-1];
            break;
    }

    //Formats the plain text of the email
    let text = "";
    for(i=0;i<foundArtists.length;i++){
        text += `${foundArtists[i]}: \n`
        let artistIndex = allArtist.indexOf(foundArtists[i])
        let songs = artistToSong[artistIndex].songs
        for(j=0;j<songs.length;j++){
            text += `=> ${songs[j].title} - By: ${songs[j].originalArtist}\n`
        }
        text += "\n"

    }

    //Formats the html content of the email. 
    let htmlString = ""
    for(i=0;i<foundArtists.length;i++){
        htmlString += `<p><strong>${foundArtists[i]}</strong>:</p><ul>`
        let artistIndex = allArtist.indexOf(foundArtists[i])
        let songs = artistToSong[artistIndex].songs
        for(j=0;j<songs.length;j++){
            htmlString += `<li><em>${songs[j].title}</em> - By: <strong>${songs[j].originalArtist}</strong></li>`
        }
        htmlString += "</ul><br>"
    }


    //Configures the options for the email. 
    let mailOptions = {
        from: creds.from,
        to: creds.to,
        subject: subject,
        text: text,
        html: htmlString
    }

    transport.sendMail(mailOptions)
}