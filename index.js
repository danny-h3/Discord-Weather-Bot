// Grab token on start up
require('dotenv').config();
const token = process.env['CLIENT_TOKEN'];

// Grabbing necessary discordjs classes
const { Client, Collection, Events,  GatewayIntentBits } = require('discord.js'); 

// Loading command files
const fs = require('node:fs'); // File system module - for identifying command files
const path = require('node:path'); // Path module - cosntructs pahts to files and directories
const internal = require('node:stream');

// Creating client instance with necessary intents 
const client = new Client({  
    intents: [ 
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ] 
}); 

// Attaching commends property to client instance so that access to other command files
// is possible 
client.commands = new Collection(); 

// Retrieving command files:
const foldersPath = path.join(__dirname, 'commands'); // Get path of 'commands' folder
const commandFolders = fs.readdirSync(foldersPath); // Returns array of folder names contained in 'commands'

// Iterate through folders:
for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder); // Get path of folder 
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js')); // Return all command files as array

    // Iterate through command files
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file); 
        const command = require(filePath); 

        // Set a new item in the Collection with the key as the command name and the value as the export module
        if ('data' in command && 'execute' in command) {
            // Set command 
            client.commands.set(command.data.name, command); 
        }
        // If data and execute properties are not found within file for command print an error 
        else {
            console.log(`{Warning!} the command at ${filePath} is missing required "data" or "execute" property.`);
        }
    }
}

// Listen for command
client.on(Events.InteractionCreate, interaction => {
    console.log(interaction);
})

// Print ready when client is ready
client.on('ready', () => { 
    console.log(`Logged in as ${client.user.tag}!`); 
})

// Await message 
client.on('message', async msg => {
    console.log('I see a message!')
    if (msg.content === 'ping') {
        console.log('Printing');
        msg.reply('Hello!'); 
    }
})

// Login with token 
client.login(token); 