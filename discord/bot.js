const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const API_TOKEN = 'YOUR_ADMIN_API_TOKEN'; // Replace with a secure token
const API_BASE = 'http://localhost:3000/api'; // Change if hosted externally

client.once('ready', () => {
  console.log(`✅ Discord Bot is online as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => { // Ensure this function is async
  if (message.author.bot) return;

  const args = message.content.split(' ');
  const command = args.shift().toLowerCase();

  // 🔍 Lookup user by username or ID
  if (command === '!lookup') {
    if (args.length < 1) {
      return message.channel.send('Usage: `!lookup <username or id>`');
    }

    const searchTerm = args[0];
    try {
      const response = await axios.get(`${API_BASE}/lookup-user`, {
        headers: { 'Authorization': API_TOKEN },
        params: { query: searchTerm }
      });

      if (response.data.user) {
        const user = response.data.user;
        message.channel.send(
          `🆔 **ID:** ${user.id}\n👤 **Username:** ${user.username}\n📅 **Registered:** ${user.date_registered}\n🎭 **Role:** ${user.role}`
        );
      } else {
        message.channel.send('❌ User not found.');
      }
    } catch (error) {
      console.error('Error in !lookup:', error);
      message.channel.send('❌ Error looking up user.');
    }
  }

  // 🛠️ Generate a key (Ensure `generateUniqueKey` is implemented)
  if (command === '!genkey') {
    if (!message.member.roles.cache.some(role => role.name === 'Admin')) {
      return message.channel.send('❌ You do not have permission to use this command.');
    }

    const key = generateUniqueKey(); // Implement this function

    try {
      const response = await axios.post(`${API_BASE}/generate-key`, { key }, {
        headers: { 'Authorization': API_TOKEN }
      });

      if (response.data.success) {
        message.channel.send(`✅ Generated key: **${key}**`);
      } else {
        message.channel.send(`❌ ${response.data.error}`);
      }
    } catch (error) {
      console.error('Error generating key:', error);
      message.channel.send('❌ Error generating key.');
    }
  }

  // 🏷️ Assign a role to a user
  if (command === '!addrole') {
    if (args.length < 2) {
      return message.channel.send('Usage: `!addrole <role> <username or id>`');
    }

    const role = args[0];
    const userQuery = args[1];

    try {
      const response = await axios.post(
        `${API_BASE}/assign-role`,
        { role, userQuery },
        { headers: { 'Authorization': API_TOKEN } }
      );

      if (response.data.success) {
        message.channel.send(`✅ Role **${role}** assigned to **${userQuery}**.`);
      } else {
        message.channel.send(`❌ ${response.data.error}`);
      }
    } catch (error) {
      console.error('Error in !addrole:', error);
      message.channel.send('❌ Error assigning role.');
    }
  }

  // 🏗️ Create a new role with hierarchy
  if (command === '!createrole') {
    if (args.length < 2) {
      return message.channel.send('Usage: `!createrole <role name> <hierarchy_number>`');
    }

    const roleName = args[0];
    const hierarchy = parseInt(args[1]);

    if (isNaN(hierarchy)) {
      return message.channel.send('❌ Hierarchy must be a number.');
    }

    try {
      const response = await axios.post(
        `${API_BASE}/create-role`,
        { roleName, hierarchy },
        { headers: { 'Authorization': API_TOKEN } }
      );

      message.channel.send(response.data.message);
    } catch (error) {
      console.error('Error in !createrole:', error);
      message.channel.send('❌ Error creating role.');
    }
  }

  // 📜 List all roles
  if (command === '!listroles') {
    try {
      const response = await axios.get(`${API_BASE}/list-roles`, {
        headers: { 'Authorization': API_TOKEN }
      });

      if (response.data.roles && response.data.roles.length > 0) {
        const roleList = response.data.roles
          .map((role) => `🔹 **${role.role_name}** (Hierarchy: ${role.hierarchy})`)
          .join('\n');

        message.channel.send(`📜 **Roles List:**\n${roleList}`);
      } else {
        message.channel.send('⚠️ No roles found.');
      }
    } catch (error) {
      console.error('Error in !listroles:', error);
      message.channel.send('❌ Error retrieving roles.');
    }
  }
});

// Function placeholder (implement this if missing)
function generateUniqueKey() {
  return Math.random().toString(36).substr(2, 10).toUpperCase();
}
