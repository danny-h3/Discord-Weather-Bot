/* 
    Bot will be using the National Weather Service's free non-commercial API 
    as well as Google Maps geocode API 

    The calls to Google Maps will be to find the latitude and longitude of a given
    address by the user

    The calls to the National Weather Service will be to obtain the forcast data for
    the given location 

    API calls will be done through the axios library
*/

// Importing axios
const axios = require('axios');
require('dotenv').config();

// Building new weather command
const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('weather')
        .setDescription('Replies with weather')
        .addStringOption( location => 
            location
            .setName('location')
            .setDescription('Location to find weather for')),
        
    async execute(interaction) {

        // Grab user given location
        let userLocation = interaction.options.getString('location') ?? 'No location provided';

        // Grab API Address 
        let weatherAPIAddress = "https://api.weather.gov/points/";
        let googleAPIAddress = "https://maps.googleapis.com/maps/api/geocode/json?address="; 

        // Grab google api key since we need it to make api call
        const GOOGLE_TOKEN = process.env['GOOGLE_MAPS_KEY'];
        
        // Modify google API address by adding user given location 
        googleAPIAddress += userLocation.replaceAll(" ", "+");
        googleAPIAddress += `&key=${GOOGLE_TOKEN}`; // Making sure I add my own key

        // Store google api data
        let coordinatesInfo; 
        // Try sending API call using generated address 
        try {
            coordinatesInfo = await axios.get(googleAPIAddress); 
            console.log("[Success] Data successfully obtained from Google API!"); 
        }
        catch (error) {
            console.log("[ERROR] Something went wrong with Google API request!\n", error); 
        }

        // Based on the json returned from google API grab latitude and longitde  
        let latitude = coordinatesInfo.data['results'][0]['geometry']['location']['lat'];
        let longitude = coordinatesInfo.data['results'][0]['geometry']['location']['lng'];
        
        // Print lat and long for testing [Remove later]
        console.log(`[SUCCESS] Coordinates are Lat: ${latitude}, Long: ${longitude}`); 
        
        // Add coordinates to weather api address 
        weatherAPIAddress += latitude + ',' + longitude; 
        // Print it out for testing [Remove later]
        console.log(weatherAPIAddress); 

        // Store forcast information
        let weatherAPIResponse; 
        // Sending API call via address 
        // Try sending API call using generated address 
        try {
            weatherAPIResponse = await axios.get(weatherAPIAddress); 
            console.log("[SUCCESS] Data successfully obtained from Weather API!"); 
        }
        catch (error) {
            console.log("[ERROR] Something went wrong with Weather API request!\n", error); 
        }

        // Get forcast link 
        let forecastLink = weatherAPIResponse.data.properties.forecast; 
        // Store forcast data   
        let forecastInfo; 
        try {
            forecastInfo = await axios.get(forecastLink); 
            console.log("[SUCCESS] Data successfully obtained from forcast link!")
        }
        catch (error) {
            console.log("[ERROR] Something went wrong with getting data from Forecast Link!", error)
        }

        // Creating result: 
        let result = forecastInfo.data.properties.periods[0].temperature; 
        

        // Reply to client 
        await interaction.reply( `The forcast for your location is currently: ${result} F` );
    },
};
