const request = require('request');

const aliases = {
    'sushi': 'Sushipool',
    'porky': 'PorkyPool',
    'beep': 'BeepPool',
    'phil': 'PhilPool',
    'chain': 'NimiqChain',
    'watch': 'NimiqWatch',
    'np': 'NimiqPool',
    'nim': 'NimPool',
    'global': 'Nimiq',
};

class Helper {
    static async getPoolData(pool, cb){
        if(aliases.hasOwnProperty(pool)){
            pool = aliases[pool];
        }
        return await request({
            'url': `https://poolwatch.thuisserver.ovh/api/pools/${pool}`,
            'rejectUnauthorized': false,
            'timeout': 30000,
        }, (err, response, body) => {
            let data;
            data = JSON.parse(body);
            cb(data);
        });

    }
    static async getPools(cb){
        return await request({
            'url': `https://poolwatch.thuisserver.ovh/api/pools`,
            'rejectUnauthorized': false,
            'timeout': 30000,
        }, (err, response, body) => {
            let data;
            data = JSON.parse(body);
            cb(data);
        });

    }
    static humanHashes(bytes) {
        if (isNaN(bytes)) {
            return '0 h/s';
        }
        let thresh = 1000;
        if (Math.abs(bytes) < thresh) {
            return bytes + ' H/s';
        }
        let units = ['kH/s', 'MH/s', 'GH/s', 'TH/s', 'PH/s', 'EH/s', 'ZH/s', 'YH/s'];
        let u = -1;
        do {
            bytes /= thresh;
            ++u;
        } while (Math.abs(bytes) >= thresh && u < units.length - 1);
        return bytes.toFixed(1) + ' ' + units[u];
    }

}

module.exports = exports = Helper;