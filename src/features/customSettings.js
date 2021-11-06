const Store = require('electron-store');
const config = new Store();

module.exports = [
	{
		name: 'Start as Fullscreen',
		id: 'fullScreenStart',
		category: 'Startup',
		type: 'checkbox',
		needsRestart: true,
		val: config.get("fullScreenStart", true),
	},
    {
		name: 'Unlimited FPS',
		id: 'disableFrameRateLimit',
		category: 'Performance',
		type: 'checkbox',
		needsRestart: true,
		val: config.get("disableFrameRateLimit", false),
	},
	{
		name: 'Discord Rich Presence',
		id: 'discordRPC',
		category: 'Performance',
		type: 'checkbox',
		needsRestart: true,
		val: config.get("discordRPC", true),
	},
	{
		name: 'Client Badges',
		id: 'clientBadges',
		category: 'Performance',
		type: 'checkbox',
		needsRestart: true,
		val: config.get("clientBadges", true),
	},
	{
		name: 'Show FPS',
		id: 'showFPS',
		category: 'Game',
		type: 'checkbox',
		needsRestart: false,
		val: config.get("showFPS", true),
	},
	{
		name: 'Show Ping',
		id: 'showPing',
		category: 'Game',
		type: 'checkbox',
		needsRestart: false,
		val: config.get("showPing", true),
	},
	{
		name: 'In-game Chat Mode',
		id: 'chatType',
		category: 'Game',
		type: 'list',
		values: ['Show', 'Hide'],
		needsRestart: true,
		val: config.get("chatType", "Show"),
	},
	{
		name: 'Custom Sniper Scope',
		id: 'customScope',
		category: 'Game',
		type: 'input',
		needsRestart: false,
		val: config.get('customScope', ''),
		placeholder: 'Scope url'
	},
	{
		name: 'Scope Size',
		id: 'scopeSize',
		category: 'Game',
		type: 'slider',
		needsRestart: false,
		min: 10,
		max: 1000,
		val: config.get("scopeSize", 400)
	}
]
