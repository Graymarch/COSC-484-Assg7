# Popvortex Artist Mailer: Mitchell Griff

## Description
This is a javascript application that scrapes the top 100 rap songs from https://www.popvortex.com/music/charts/top-rap-songs.php and sends an email to the user about which of their favorite artists are in the list and which songs they worked on. 

Presently, the app is only capable of searching for artists with single word names (Eminem, BigXthaPlug, Rhianna, etc.). If you attempt to search for artists with multiple words in their name (Snoop Dogg, Drake Migos, Tyler, the Creator, etc.) you will not receive an appropriate response.

<br>

## Operation
To execute the app from the command line, first navigate to the folder containing the app. 
- You can use 'cd <dir_name>' to do this. 
- Check the contents of your current directory with 'dir' to ensure the app is there. 

<br>

There should be a file labeled 'credentials.json'. Open it and replace the values there with the applicable information for your setup. 

<br>

Then execute the app and await a confirmation message about whether your artists were found. 
- To execute the app, type 'npm artists.js [artist names]'
- The app expects at least one artist name, otherwise it will respond with an error. 
- The app will report whether a given artist was found '[artist_name] was/wasn't found.'

<br>

Once the app completes, check your email to see if your artists are in the top 100!

<br>

## Troubleshooting
**No Email Response**: The most likely cause is that your artists were not in the top 100 rap songs. Check the command line where you executed the app. It will likely say the artists you searched for were not found. 

**Artists Not Found**: If the artist you searched for wasn't found in the top 100, they either weren't there or the search was spelled incorrectly. Ensure the artist's name is spelled correctly and run the app again. 

**Error Sending the Email**: If your artists were found but no email was sent, there are a few possible solutions. 
- Ensure that your credentials.json is setup correctly. Check all addresses and passwords.
- Ensure you have a stable internet connection. 
- If you see 'Error: self-signed certificate in certificate chain' your antivirus may be interfering with normal operations. Try creating an exception in your antivirus for this program or temporarily deactivate your antivirus to allow the email through. 