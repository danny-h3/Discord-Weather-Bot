// Grab token on start up
require('dotenv').config();
const token = process.env['CLIENT_TOKEN'];

// Grabbing necessary discordjs classes
const { Client, Collection, Events,  GatewayIntentBits, messageLink } = require('discord.js'); 

// Loading command files
const fs = require('node:fs'); // File system module - for identifying command files
const path = require('node:path'); // Path module - cosntructs paths to files and directories
const internal = require('node:stream');

// Creating client instance with necessary intents 
const client = new Client({  
    intents: [ 
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers, 
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

// Print ready when client is ready
client.on('ready', () => { 
    console.log(`Logged in as ${client.user.tag}!`); 
})

// Await message 
client.on(Events.MessageCreate, (message) => {
    if (message.content === 'ping') {
        message.reply('Hey!');
    }
})

// Listen for command - ERROR check if bot was invited with application.commands as scope 
client.on(Events.InteractionCreate, interaction => {
    console.log(interaction);
})

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});

// Login with token 
client.login(token); 