const Helper = require('./lib/Helper');
const TeleBot = require('telebot');
const config = require('./config.json');
var pmx = require('pmx').init({
    errors: true, // Exceptions logging (default: true)
    custom_probes: true, // Auto expose JS Loop Latency and HTTP req/s as custom metrics
    network: true, // Network monitoring at the application level
});
const probe = require('pmx').probe();

let receivedMessages = 0;
let commandsProcessed = 0;
const bot = new TeleBot({
    token: config.botToken,
});

probe.metric({
    name: 'Messages processed',
    value: function () {
        return receivedMessages;
    }
});

probe.metric({
    name: 'Commands processed',
    value: function () {
        return commandsProcessed;
    }
});

function sendBannerMessage(msgId, msg) {
    commandsProcessed++;
    msg += "\nData provided by [PoolWatch](https://poolwatch.info)";
    return bot.sendMessage(msgId, msg, {parseMode: 'markdown', preview: false})
}

function sendMessage(msgId, msg) {
    commandsProcessed++;
    return bot.sendMessage(msgId, msg)
}

bot.on(['/start', '/help'], (msg) => {
    msg.reply.text(`
Welcome to this bot.
You can use the following commands:
- /hr [pool name] - to get pools hashrate
- /devices [pool name] - to get devices
- /users [pool name] - to get users
- /pools - To show all pools registered by poolwatch

V0.0.1 by @brantje
    `)
});


bot.on('/pools', async (msg, props) => {
    await Helper.getPools(function (data) {
        let text = '';
        let globalHashRate = 0;
        for (pool of data) {
            if (pool.pool === 'Nimiq') {
                pool.pool = 'Nimiq.io (Nimiq network)';
                globalHashRate = pool.hashRate;
            }
            const percentOfNetwork = ((pool.hashRate / globalHashRate ) * 100).toFixed(3);
            text += `${pool.pool} @ ${Helper.humanHashes(pool.hashRate)} (${percentOfNetwork}%) \n`;
        }
        return sendBannerMessage(msg.chat.id, text);
    });
});

bot.on(/^\/pool\s?(.+)?$/, async (msg, props) => {
    const pool = props.match[1];
    if (!pool) {
        return sendMessage(msg.chat.id, 'You need to enter a pool name. For example /hr Sushipool');
    }
    await Helper.getPoolData(pool, function (data) {
        let text = 'Pool not found!';
        if (data.hasOwnProperty('pool')) {
            text = `*${data.pool}*\n`;
            text += `Hashrate: ${Helper.humanHashes(data.hashRate)}\n`;
            text += `Devices: ${data.devices}\n`;
            text += `Users: ${data.userCount}`;
        }
        return sendBannerMessage(msg.chat.id, text);
    });
});
bot.on(/^\/hr\s?(.+)?$/, async (msg, props) => {
    const pool = props.match[1];
    if (!pool) {
        return sendMessage(msg.chat.id, 'You need to enter a pool name. For example /hr Sushipool');
    }
    await Helper.getPoolData(pool, function (data) {
        let text = 'Pool not found!';
        if (data.hasOwnProperty('pool')) {
            text = `Hashrate of ${data.pool}: ${Helper.humanHashes(data.hashRate)}`;
        }
        return sendBannerMessage(msg.chat.id, text);
    });
});

bot.on(/^\/users\s?(.+)?$/, async (msg, props) => {
    const pool = props.match[1];
    if (!pool) {
        return sendMessage(msg.chat.id, 'You need to enter a poolname. For example /users Sushipool');
    }
    await Helper.getPoolData(pool, function (data) {
        let text = 'Pool not found!';
        if (data.hasOwnProperty('pool')) {
            text = `User count of ${data.pool}: ${data.userCount}`;
        }

        return sendBannerMessage(msg.chat.id, text);
    });
});

bot.on(/^\/devices\s?(.+)?$/, async (msg, props) => {
    const pool = props.match[1];
    if (!pool) {
        return sendMessage(msg.chat.id, 'You need to enter a poolname. For example /devices Sushipool');
    }
    await Helper.getPoolData(pool, function (data) {
        let text = 'Pool not found!';
        if (data.hasOwnProperty('pool')) {
            text = `Device count of ${data.pool}: ${data.devices}`;
        }
        return sendBannerMessage(msg.chat.id, text);
    });
});

bot.on('text', async (msg) => {
    receivedMessages++;
});

bot.start();
