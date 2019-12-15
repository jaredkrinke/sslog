const process = require("process");
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = 7373;
const trace = (process.env.TRACE === "1");

// TODO: Move to lib
function createEnum(labels) {
    let e = {};
    labels.forEach((label, index) => {
        e[label] = index;
    });
    e._length = labels.length;
    return e;
}

const Visibility = createEnum(["private", "public"]);
const Importance = createEnum(["unimportant", "important"]);
const Urgency = createEnum(["critical", "urgent", "pressing", "casual", "daily"]);

// Logging interface
const statusCode = {
    badRequest: 400,
    notFound: 404,
    internalServerError: 500,
};

function createStringValidator(pattern) {
    return function (x) {
        return (typeof(x) === "string" && pattern.test(x)) ? x : undefined;
    };
}

function createNumberValidator(min, max) {
    return function (x) {
        let number = undefined;
        if (typeof(x) === "number") {
            number = x;
        } else if (typeof(x) === "string") {
            number = parseInt(x);
        }
    
        return (number !== undefined && !isNaN(number) && number >= min && number <= max) ? number : undefined;
    }
}

function createEnumValidator(e) {
    return createNumberValidator(0, e._length);
}

function createOptionalValidator(validator) {
    return function (x) {
        if (x === undefined || x === null) {
            return null;
        } else {
            return validator(x);
        }
    };
}

const logValidators = {
    message: createStringValidator(/.+/),
    channel: createStringValidator(/^[a-z][a-z0-9]{0,7}$/),
    visibility: createOptionalValidator(createEnumValidator(Visibility)),
    importance: createOptionalValidator(createEnumValidator(Importance)),
    urgency: createOptionalValidator(createEnumValidator(Urgency)),
}

function validate(validators, input) {
    let o = { valid: true };
    for (let key in input) {
        let v = validators[key](input[key]);
        if (v === undefined) {
            o.valid = false;
            if (trace) {
                console.log(`Invalid request (field ${key}: ${input[key]})`);
            }
            break;
        } else {
            o[key] = v;
        }
    }
    return o;
}

app.use(bodyParser.json());

app.post("/log/:channel", function (request, response) {
    const { valid, message/*, channel, visibility, importance, urgency*/ } = validate(logValidators, {
        message: request.body.m,
        channel: request.params.channel,
        visibility: request.body.v,
        importance: request.body.i,
        urgency: request.body.u,
    });

    if (valid) {
        // TODO: Fancier logic
        console.log(message);

        // Respond immediately
        response.send();
    } else {
        response.status(statusCode.badRequest).send();
    }
});

app.listen(port, "localhost", () => console.log(`Listening on port ${port}...`));
