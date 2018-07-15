const request = require('request');
const debug = require('debug')('poolwatch:server:NetworkService');
const events = require('events');
class NetworkService {
    constructor(){
        this.networkStats = {};
        this.emitter = new events.EventEmitter();
        this.fetchStats()
    }
    fetchStats(){
        debug('Fetching network stats');
        let that = this;
        request({
            'url': 'https://api.nimiqx.com/network-stats/',
            'rejectUnauthorized': false,
            'timeout': 30000,
        }, (err, response, body) => {
            let data;
            debug('Done fetching network stats');
            if (response) {
                data = JSON.parse(body);
                if(data) {
                    that.networkStats = data;
                    this.emitter.emit('network_stats_updated', that.networkStats);
                }
            }
            setTimeout(function () {
                that.fetchStats();
            }, 10000);
        });
    }

    getHashrate(){
        return this.networkStats.hashrate;
    }
}

module.exports = NetworkService;