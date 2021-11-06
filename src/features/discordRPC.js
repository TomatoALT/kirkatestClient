const { gameLoaded, version } = require('./const');
const client = require('discord-rich-presence')('871730144836976650');
const fetch = require('node-fetch');
let starttime = Date.now();
const { badge_checker } = require('./badges')
const Store = require("electron-store");
const config = new Store();
const https = require('https');

let userBadges = {type:'smth', role:'KirkaClient User'}
let playing = false;

const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
});
let options = {agent: httpsAgent}

setInterval(() => {
	let user = config.get("user", "").toString();
	if (user.slice(-1) === " ") {
		user = user.slice(0, -1)
	}
	if (user !== "") {
		userBadges = badge_checker(user)
		userBadges = userBadges[0]
		if (!playing) initrpc();
	}
}, 2500);


function initrpc() {
    client.updatePresence({
        state: 'Home Page',
        smallImageKey: userBadges.type,
        smallImageText: userBadges.role,
        largeImageKey: 'client_logo',
        largeImageText: `KClient2.0 ${version}`,
        instance: true,
        startTimestamp: starttime,
        buttons: [
          { label: "Get KirkaClient", url: "https://discord.gg/TyGwHQ8yPA" }
        ]
    });
}

function discord_client(webContents) {
    setInterval(() => {
        startrpc(webContents.getURL())
    }, 2000);
}

function startrpc(gameurl) {
    let final_data;
    if (gameLoaded(gameurl)) {
		playing = true;
        let gamecode = gameurl.replace("https://kirka.io/games/", "");
        get_matches(gamecode)
        .then((data) => {
            if (data.mode == 'Editor') {
                final_data = {mode:'Editing a map'}
                updatenow(final_data, 'map');
            } else {
                final_data = {'mode':data.mode, 'map': data.map_name, 'cap': data.cap, 'code':gamecode}
                updatenow(final_data, 'game');
            }
			
        })
        .catch((error) => {
            console.err(error)
        })
    } else {
		playing = false;
    }
}

function get_matches(gamecode) {
    return new Promise((resolve, reject) => {
        fetch('https://kirkaclient.vercel.app/api/matches', options)
        .then(res => res.text())
        .then(text => {
            let data = JSON.parse(text);
            text = data.ffa;
            let found = false;
            let finaldata;
            for (let key in text) {
                let value =  text[key];
                let map_name = value.metadata.mapName;
                let cap = `${value.clients}/${value.maxClients}`;
                let roomId = value.roomId;
                if (roomId == gamecode) {
                  finaldata = {map_name: map_name, cap: cap, mode:'FFA'};
                  found = true;
                  resolve(finaldata);
                }
            }
            if (!found) {
                text = data.tdm
                for (let key in text) {
                    let value =  text[key];
                    let map_name = value.metadata.mapName;
                    let cap = `${value.clients}/${value.maxClients}`;
                    let roomId = value.roomId;
                    if (roomId == gamecode) {
                      finaldata = {map_name: map_name, cap: cap, mode:'TDM'};
                      found = true;
                      resolve(finaldata);
                    }
                }
            }
            if (!found) {
                finaldata = {mode: 'Editor'};
                resolve(finaldata);
            }
        });
      })
}

function updatenow(data, type) {
    if (data === undefined) return;
    switch (type) {
        case 'game':
            client.updatePresence({
                details: `Playing ${data.mode}`,
                state: `${data.map} (${data.cap})`,
                smallImageKey: userBadges.type,
                smallImageText: userBadges.role,
                largeImageKey: 'client_logo',
                largeImageText: `KClient 2.0 ${version}`,
                instance: true,
                startTimestamp: starttime,
                buttons: [
                    { label: "Join Game", url: `https://kirka.io/games/${data.code}`},
                    { label: "Get KClient2.0", url: "https://discord.gg/TyGwHQ8yPA" }
                  ]
            });
            break;
        case 'map':
            client.updatePresence({
                details: `Editing a map`,
                smallImageKey: userBadges.type,
                smallImageText: userBadges.role,
                largeImageKey: 'client_logo',
                largeImageText: `KClient 2.0 ${version}`,
                instance: true,
                startTimestamp: starttime,
                buttons: [
                    { label: "Get KClient", url: "https://discord.gg/TyGwHQ8yPA" }
                  ]
            });
            break;
    }

}

exports.DiscordClient = discord_client;
exports.InitRPC = initrpc;