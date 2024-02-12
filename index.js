const { token } = require('dotenv').config();

const { Client, GatewayIntentBits } = require('discord.js'); 

const client = new Client({  
    intents: [ 
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages
    ] 
}); 

client.on('ready', () => { 
    console.log(`Logged in as ${client.user.tag}!`); 
})

client.on('messageCreate', async msg => {
    if (msg.content === 'ping') {
        console.log('Printing');
        msg.reply('Sup chinky!'); 
    }
})

client.login(token); 
