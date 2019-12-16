const sslog = require("../lib/sslog.js");

const argv = require("yargs")
    .command("* <channel> <message>", "Log a message", yargs => 
        yargs
        .positional("channel", {
            describe: "Channel to log to",
            type: "string",
        })
        .positional("message", {
            describe: "Message to log",
            type: "string",
        })
        .option("importance", {
            describe: "0 if message can be dropped",
            type: "number",
        })
        .demandOption("channel")
        .demandOption("message")
    ).argv;

sslog.log(argv.channel, argv.message, (argv.importance === 0) ? sslog.Importance.unimportant : undefined);
