const http = require("http");

const hostName = "localhost";
const port = 7373;

const statusCode = {
    ok: 200,
};

function createEnum(labels) {
    let e = {};
    labels.forEach((label, index) => {
        e[label] = index;
    });
    e._length = labels.length;
    return e;
}

const Importance = createEnum(["important", "unimportant"]);

function log(channel, text, importance) {
    let body = JSON.stringify({
        c: channel,
        m: text,
        i: importance,
    });

    const request = http.request({
        method: "POST",
        hostname: hostName,
        port: port,
        path: `/log/${encodeURIComponent(channel)}`,
        headers: {
            "Content-Type": "application/json",
            "Content-Length": body.length,
        },
    }, function (response) {
        if (response.statusCode !== statusCode.ok) {
            console.error(`Request failed with status code ${response.statusCode}`);
        }
    });

    request.write(body);
    request.end();
}

exports.port = port;
exports.Importance = Importance;
exports.log = log;
