import server from "./server";
import test from "./test";

const version = process.env["APP_VERSION"]??"v0";
const command = Bun.argv.at(2);
if (command === "start") {
    const s = await server(version);
    
    process.on("SIGINT", () => {
        console.log("^C");
        s.close()
            .then(() => process.exit(0))
    })
    process.on("SIGTERM", () => {
        console.log("SIGTERM");
        s.close()
            .then(() => process.exit(0))
    })

    console.write(`Prosty serwer HTTP, wersja ${version}\n"STOP" aby zatrzymać\n"health (0|1)" by zmienić stan zdrowia\n> `);
    for await (const line of console) {
        if (line === "STOP") {
            s.close();
            break;
        } else if (line === "health 0") {
            s.setHealthy(false);
            console.write("made unhealthy\n");
        } else if (line === "health 1") {
            s.setHealthy(true);
            console.write("made healthy\n");
        }
        console.write("> ");
    }
} else if (command === "test") {
    await test();
} else {
    console.error("usage: ./server (start|test)");
    process.exitCode = 127;
}
