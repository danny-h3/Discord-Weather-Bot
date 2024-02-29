// File will be used to register and udpdate slash commands for bot application

// Deployment Scirpt
const { REST, Routes, Guild } = require('discord.js');
// Grab tokens
require('dotenv').config();
CLIENT_TOKEN = process.env.CLIENT_TOKEN; 
CLIENT_ID = process.env.CLIENT_ID; 
GUILD_ID = process.env.GUILD_ID; 

const fs = require('node:fs');
const path = require('node:path'); 

const commands = []; // Store commands
// Grab all command folders from the commands directory
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

// Iterate through all command directories and grab commands
for (const folder of commandFolders) {
    // Grab all paths + files for commands
    const commandsPath = path.join(foldersPath, folder); 
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js') );

    // Grab the SlashCommandBuilder#toJSON() ooutput of each command's data for deployment
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file); 
        const command = require(filePath); 
        if ('data' in command && 'execute' in command ) {
            commands.push(command.data.toJSON()); 
        }
        else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

// Construct and prepare an instance of REST module 
const rest = new REST().setToken(CLIENT_TOKEN);

// Deploy Commands 
(async () => {
    try {
        console.log(`Started refreshing $(commands.length) application slash (/) commands.`);

        // Put method is used to fully refresh commands in the guild with the current set 
        const data = await rest.put(
            Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), 
            { body: commands }, 
        ); 

        console.log(`Successfully reloaded ${data.length} application slash (/) commands.`); 
    }
    catch (error) {
        // Log any errors 
        console.error(error); 
    }
}) (); 
