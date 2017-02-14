var request = require('request');
console.log(JSON.stringify({ status: 'success' }));
request({
    url: `http://192.168.1.105/labs_cnns_2016/task/xss_336f1cc065d811e68a32408d5ce74afb/update`,
    method: 'POST',
    json: { status: 'success' }
}, function (error, response, body) {
    if (!error && response.statusCode == 200) {
        console.log(body.message);
    } else {
        console.log(error);
    }
})