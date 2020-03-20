const Discord = require("discord.js");
const Client  = new Discord.Client();
const randomstring = require("randomstring");
const http = require('http');
const syn4 = require("./syn4.js").syn4;
const fs = require("fs");

const webhook = require("webhook-discord")
const Hook = new webhook.Webhook("https://discordapp.com/api/webhooks/690616811179475004/OtK2n8uhQ4rda0_XTYrlQZF6Bo2btiHdLQ20OfgyU6icflBvYOzXT254yg2XlWCcalon")

const database = require("./database.json");
const acs = require("./acs.json");

// Options
let name = "Coastified"
let productName = name + " Whitelisting";
let logoLink = "https://i.imgur.com/tqyVJYU.png";
let prefix = "!";
let bot_credits = productName + "™ - All rights reserved.";
let color = 0x507DFA;
let no_perms = "You do not have permissions to use this command. ";
let no_args = "Please give me some arguments to work with. ";

let network_command_stack = {};
let token_data = [];
let trial = false;

// Functions
function get_key(object, value) {
    return Object.keys(object).find(key => object[key] === value);
};

function error_message(msg) {
    return {embed:{
        color: color,
        thumbnail: {
            url: "https://i.imgur.com/DzDpZPe.png",
        },
        author: {
            icon_url: Client.user.avatarURL,
            name: name + ' Whitelister',
        },
        title: ":red_circle: Error",
        description: msg,
        timestamp: new Date(),
        footer: {
            icon_url: Client.user.avatarURL,
            text: bot_credits,
        },
    }};
};

function info_message(title,msg) {
    return {embed:{
        color: color,
        author: {
            icon_url: Client.user.avatarURL,
            name: name + ' Whitelister',
        },
        title: title,
        description: msg,
        timestamp: new Date(),
        footer: {
            icon_url: Client.user.avatarURL,
            text: bot_credits,
        },
    }};
};

function save_database() {
    fs.writeFile("./database.json", JSON.stringify(database), function(err) {
        if (err) throw err;
    });
};
function save_acs() {
    fs.writeFile("./acs.json", JSON.stringify(acs), function(err) {
        if (err) throw err;
    });
};

function activate(ID,HWID) {
    if (Client.users.cache.get(ID)) {
        if (!whitelist[ID]) {
            let user = Client.users.cache.get(ID).username;
            let dis = Client.users.cache.get(ID).discriminator;
            
            let username = user + "#" + dis;
            Hook.success("Activation","Successfully Activated user " + username + " (" + ID + ")!\nHWID : `" + HWID + "`.");
            console.log("Successfully Activated user " + username + " (" + ID + ")!\nHWID : `" + HWID + "`.");
            Client.users.cache.get(ID).send(info_message("Success","Your account has successfully been activated!"));

            database[ID] = HWID;
            acs[ID] = null;
            save_database();
            save_acs();
        }
    };
};
function whitelist(ID) {
    if (Client.users.cache.get(ID)) {
        let user = Client.users.cache.get(ID).username;
        let dis = Client.users.cache.get(ID).discriminator;

        let new_key = randomstring.generate(8);
        let username = user + "#" + dis;
        Hook.success("Whitelist","Successfully whitelisted user " + username + " (" + ID + ")!\nActivation Key : `" + new_key + "`.");
        console.log("Successfully whitelisted user " + username + " (" + ID + ")!\nActivation Key : `" + new_key + "`.");
        Client.users.cache.get(ID).send(info_message("Success","You were successfully whitelisted!\nKey: `" + new_key + "`"));

        acs[ID] = new_key;
        save_acs();
    };
};
function blacklist(ID) {
    if (database[ID] || acs[ID]) {
        let user = Client.users.cache.get(ID).username;
        let dis = Client.users.cache.get(ID).discriminator;
        let username = user + "#" + dis;

        database[ID] = null;
        acs[ID] = null;
        save_database();
        save_acs();
        
        Client.users.cache.get(ID).send(info_message("Blacklist","You have been blacklisted from " + name + "."));
        Hook.info("Blacklist","Successfully blacklisted " + username + " (" + ID + ").");
        console.log("Successfully blacklisted " + username + " (" + ID + ").");
    } else {
        message.channel.send(info_message("Blacklist",user + " was successfully blacklisted."));
    };
};

// Discord Bot //

// Perms
var botPerms = ["644006346038968331","604260676936007681","536258420047609857"];

function checkpermission(id) {
    let key = botPerms.find(function(element) {
      return element === id.toString();
    });

    if (key) {
        return true;
    } else {
        return false;
    };
};

// Commands
Client.on('message', message => {
    // Preparation
    let msg = message.content.toUpperCase()
    let cont = message.content.slice(prefix.length).split(" ");
    let args = cont.slice(1);
    let defineduser;
    

    if (true) {//(!message.author.bot) {
        if (message.guild) {

            // Commands
            if (msg.startsWith(`${prefix}HELP`)) {
                message.channel.send({embed:{
                    color: color,
                    thumbnail: {
                        url: "https://i.imgur.com/X73KBUK.png",
                    },
                    author: {
                        icon_url: Client.user.avatarURL,
                        name: productName + ' Whitelister',
                    },
                    title: "Help command",
                    description: "Here is a list of all commands.",
                    fields: [{
                        name: `${prefix}help`,
                        value: "Displays a list of all commands.",
                    },{
                        name: `${prefix}whitelist [User]`,
                        value: "Whitelists [User]. Gives them an activation code.",
                    }, {
                        name: `${prefix}blacklist [User]`,
                        value: "Blacklists [User].",
                    }, {
                        name: `${prefix}info [User]`,
                        value: "Displays a list of information about [User].",
                    }, {
                        name: `${prefix}gameaction [User] [Action]`,
                        value: "Performs [Action] on User in-game, if they are using Coastified.",
                    }, {
                        name: `${prefix}trial`,
                        value: "Toggles trial. This will make everyone able to use the script until disabled again.",
                    }],
                    timestamp: new Date(),
                    footer: {
                        icon_url: Client.user.avatarURL,
                        text: bot_credits,
                    },
                }});
            } else if (msg.startsWith(`${prefix}WHITELIST`)) {
                if (!checkpermission(message.author.id)) return message.channel.send(error_message(no_perms));

                if (args[0]) {
                    if (message.mentions.users.first()) {
                        args[0] = message.mentions.users.first().id;
                    };
                } else return message.channel.send(error_message("Please mention a User ID as first argument!"));

                if (!message.guild.members.cache.get(args[0])) return message.channel.send(error_message("Invalid user!"));

                if (!acs[message.mentions.users.first().id]) {
                    whitelist(message.mentions.users.first().id);
                    message.channel.send(info_message("Success","User was successfully whitelisted!"));
                } else {
                    message.channel.send(error_message("User is already whitelisted."));
                };

            } else if (msg.startsWith(`${prefix}BLACKLIST`)) {
                if (!checkpermission(message.author.id)) return message.channel.send(error_message(no_perms));

                if (args[0]) {
                    if (message.mentions.users.first()) {
                        args[0] = message.mentions.users.first().id;
                    };
                } else return message.channel.send(error_message("Please mention a User ID as first argument!"));
                
                if (!message.guild.members.cache.get(args[0])) return message.channel.send(error_message("Invalid user!"));

                if (database[message.mentions.users.first().id] || acs[message.mentions.users.first().id]) {
                    blacklist(message.mentions.users.first().id);
                    message.channel.send(info_message("Success","User was successfully blacklisted!"));
                } else {
                    message.channel.send(error_message("User is not whitelisted."));
                };
            } else if (msg.startsWith(`${prefix}INFO`)) {
                if (!checkpermission(message.author.id)) return message.channel.send(error_message(no_perms));

                if (args[0]) {
                    if (message.mentions.users.first()) {
                        args[0] = message.mentions.users.first().id;
                    };
                } else return message.channel.send(error_message("Please mention a User ID as first argument!"));
                
                if (!message.guild.members.cache.get(args[0])) return message.channel.send(error_message("Invalid user!"));

                if (database[message.mentions.users.first().id] || acs[message.mentions.users.first().id]) {
                    message.author.send({embed:{
                        color: color,
                        author: {
                            icon_url: Client.user.avatarURL,
                            name: productName + ' Whitelister',
                        },
                        title: "Info : " + message.mentions.users.first().username + "#" + message.mentions.users.first().discriminator + "(" + message.mentions.users.first().id + ")",
                        description: "Here is the information that you requested.",
                        fields: [{
                            name: "Username",
                            value: message.mentions.users.first().username,
                        }, {
                            name: "HWID",
                            value: database[message.mentions.users.first().id] || "Account not Activated.",
                        }, {
                            name: "Activation Code",
                            value: acs[message.mentions.users.first().id] || "User is already Activated.",
                        }],
                        timestamp: new Date(),
                        footer: {
                            icon_url: Client.user.avatarURL,
                            text: bot_credits,
                        },
                    }});
                } else {
                    message.author.send(error_message("There is no information about this User."));
                };
                message.channel.send(info_message("User Information ","Check DMs."));
            } else if (msg.startsWith(`${prefix}GAMEACTION`)) {
                if (!checkpermission(message.author.id)) return message.channel.send(error_message(no_perms));

                if (args[0]) {
                    if (message.mentions.users.first()) { // Local
                        if (!args[1]) return message.channel.send(error_message(no_args));

                        network_command_stack[message.mentions.users.first().id] = args[1];
                        message.channel.send(info_message("Game Action","Performed '" + args[1] + "' on one User."));
                    } else { // All
                        Object.keys(database).forEach(function(value){
                            network_command_stack[value] = args[0];
                        });
                        message.channel.send(info_message("Game Action","Performed '" + args[0] + "' on all Users."));
                    };
                } else return message.channel.send(error_message(no_args));
                
            } else if (msg.startsWith(`${prefix}TRIAL`)) {
                if (!checkpermission(message.author.id)) return message.channel.send(error_message(no_perms));

                if (!trial) { // Enable trial
                    trial = true;
                    message.channel.send(info_message("Trial","Successfully initiated trial!"));
                    Hook.success("Trial","Trial enabled")
                    console.log("Trial enabled.");
                } else { // Disable trial
                    Object.keys(token_data).forEach(function(value, index){ // Clear Trial users
                        if (value.startsWith(`TrialUser`)) {
                            token_data[index] = null;
                        };
                    });

                    trial = false;
                    message.channel.send(info_message("Trial","Trial has ended!"));
                    Hook.warn("Trial","Trial disabled")
                    console.log("Trial disabled.");
                };
            };

        };
    };

});

// Server
let network_token = randomstring.generate(24);
let listen = false;
let last_pickup;

http.createServer(function(req,res) {
	let url = req.url;
    let msg = url.replace("/seataps/","").slice(0,-1);

    let id = req.headers["syn-fingerprint"] || req.headers["sentinel-fingerprint"] || req.headers["proto-user-identifier"] || req.headers["exploit-guid"];
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    if (!id) return res.end();
    id = syn4.encrypt(id,"4855");

    let sdec_key = syn4.decrypt(msg,"4855");
    let tdec_key = syn4.decrypt(msg,network_token);

    if (listen) {
        last_pickup = msg;
        listen = false;  
    };

    // [Original message] commands
    if (msg.startsWith(`ping`)) { // Ping command
        res.write("Pong!");
        res.end();
        return;
    };

    // [Standard encryption] commands
    if (sdec_key.startsWith(`fetch-token`)) {
        let new_token = randomstring.generate(24);
        // console.log("New token generated : '" + new_token + "'");
        network_token = new_token;
        res.write(syn4.encrypt(new_token,"4855"));
    };

    // [Auth Token] commands
    if (sdec_key.startsWith(`check-inbox`)) {
        let data = sdec_key.replace("check-inbox","");
        
        let client_id = data.substring(
            data.lastIndexOf(":") + 1,
            data.lastIndexOf(";")
        );
        let auth_token = data.replace(":" + client_id + ";","");
        
        if (token_data[client_id]) {
            if (token_data[client_id] === auth_token) {
                res.write(syn4.encrypt((network_command_stack[client_id] || "") + " " + randomstring.generate(24),"4855"));
                if (network_command_stack[client_id]) {
                    network_command_stack[client_id] = null;
                };
            };
        };
    };

    // [Token encryption] commands

    if (tdec_key.startsWith(`request`)) {
        if (get_key(database,id)) { // User is whitelisted
            let key = randomstring.generate(12);
            let user = get_key(database,id);
            network_command_stack[user] = null;
            token_data[user] = key;

            res.write(syn4.encrypt("102:::" + user + ":::" + key,network_token));
            Hook.info("Request",ip + " requested login. Status: Whitelisted.");
            console.log(ip + " requested login. Status: Whitelisted.");
        } else { // User is not whitelisted

            if (trial) { // Trial enabled
                let key = randomstring.generate(12);
                token_data["TrialUser" + key] = key;

                res.write(syn4.encrypt("100:::" + "TrialUser" + key + ":::" + key,network_token));
                Hook.info("Request",ip + " requested login. Status: Not Whitelisted, but trial was enabled.");
                console.log(ip + " requested login. Status: Not Whitelisted, but trial was enabled.");
            } else { // No trial, user is not whitelisted.
                res.write(syn4.encrypt("101 " + randomstring.generate(12),network_token));
                Hook.info("Request",ip + " requested login. Status: Not Whitelisted.");
                console.log(ip + " requested login. Status: Not Whitelisted.");
            };
            
        };
    };

    if (tdec_key.startsWith(`activate?=`)) {
        let activation_code = tdec_key.replace("activate?=","");
        let ID = get_key(acs,activation_code);
        
        if (ID) { // Activate
            res.write(syn4.encrypt("104 " + randomstring.generate(12),network_token));
            activate(ID,id);
        } else { // Invalid Activation Key
            res.write(syn4.encrypt("103 " + randomstring.generate(12),network_token));
            Hook.info("Activation","Invalid Activation Code used : " + activation_code + ". Client: " + ip);
            console.log("Invalid Activation Code used : " + activation_code + ". Client: " + ip);
        };
    };

	res.end();
}).listen(5000,"localhost");

Client.on('ready', () => {
    console.log(`Whitelist initialized! Ready for requests. \nUser : ${Client.user.tag}\n\n`);
    Client.user.setPresence({
        game: {
            name: "Coastified",
            type: "STREAMING",
            url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        }
    });
});

Client.login("NjkwMjQ0MjkzNjkyMzU4NzM3.XnOmNQ.LeoI0bpnhimLUEgj-4ksFKHua8Y");