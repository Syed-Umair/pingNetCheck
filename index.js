const { Resolver } = require('dns');
const ping = require('net-ping');
const defaults = {
    host: null,
    timeout: 3500
};

const NETWORK_CHECK_URLS = [
    'ifconfig.co',
	'icanhazip.com',
    'symbolics.com',
    'time.google.com',
    '0.pool.ntp.org',
    '1.pool.ntp.org',
    '2.pool.ntp.org',
    '3.pool.ntp.org'
];

const getRandomURL = () => {
	let max = NETWORK_CHECK_URLS.length - 1;
	let min = 0;
	let random = Math.floor(Math.random()*(max-min+1)+min);
	return NETWORK_CHECK_URLS[random];
};

const getIp = (host, timeout) => {
    if(host && timeout) {
        return new Promise((resolve, reject) => {
            const resolver = new Resolver();
            setTimeout(() => {
                resolver.cancel();
                reject(new Error('Get IP timedOut'));
            }, timeout);
            resolver.resolve4(host, (err, addresses) => {
                if (err) {
                    reject(err);
                }
                if (addresses && addresses.length > 0) {
                    // console.log('addresses::', addresses);
                    resolve(addresses[0]);
                } else {
                    reject(new Error(`No Address Found for the ${host}`));
                }
            });
        });
    } else {
        throw new Error("Invalid Parameters");
    }
};

const hitIp = (ip, timeout) => {
    if (ip && timeout) {
        return new Promise((resolve, reject) => {
            var session = ping.createSession({
                timeout
            });
            session.pingHost(ip, function (error, target) {
                if (error) {
                    // console.log (target + ": " + error.toString ());
                    reject(error);
                } else {
                    // console.log (target + ": Alive");
                    resolve(true);
                }
            });
        });
    } else {
        throw new Error("Invalid Parameters");
    }
};

const checkReachablity = async (host, timeout) => {
    if (host && timeout) {
        try {
            let ip = await getIp(host, timeout);
            return await hitIp(ip, timeout);
        } catch (e) {
            // console.error(e);
            return false;
        }
    } else {
        throw new Error("Invalid Parameters");
    }
};

const netCheck = async (options) => {
    options = {
        ...defaults,
        ...options
    };
    let response = await checkReachablity(getRandomURL(), options.timeout);
    if (!response && options.host) {
        response = await checkReachablity(options.host, options.timeout);
    }
    return response;
};

module.exports = {
    NETWORK_CHECK_URLS,
    getRandomURL,
    getIp,
    hitIp,
    checkReachablity,
    netCheck
}
