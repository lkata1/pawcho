import os from "os";
import http from "http";
import home from "./pages/home.html";

type AddressInfo = { address: string, family?: string };

function parseAddress(address: AddressInfo|string|null) {
    if (!address)
        return "nieznane";
    if (typeof address === "string")
        return address;
    if (address.family)
        return `[${address.family}] ${address.address}`;
    return address.address;
}

function parseInterfaces(dict: NodeJS.Dict<os.NetworkInterfaceInfo[]>) {
    const list: string[] = [];
    for (const name in dict) {
        const ips: string[] = [];
        for (const address of dict[name]!)
            ips.push(`<li>${parseAddress(address)}</li>`);
        list.push(`<li><p>[${name}]</p><ul>${ips.join("")}</ul></li>`);
    }
    return list.join("");
}

async function server(version: string) {
    let healthy = true;
    
    const server = http.createServer(async (req, res) => {
        switch (req.url) {
            case "/ping":
                if (healthy)
                    res.write("pong\n");
                else
                    res.statusCode = 500;
                break;
            case "/":
                const address = parseAddress(server.address());
                const addresses = parseInterfaces(os.networkInterfaces());
                const hostname = os.hostname();
                
                const html = (await Bun.file(home.index).text())
                    .replace(/<script.*<\/script>/, "")
                    .replace("{{ip}}", address)
                    .replace("{{ip_list}}", addresses)
                    .replace("{{hostname}}", hostname)
                    .replace("{{version}}", version)
    
                res.write(html);
                break;
            default:
                res.statusCode = 404;
                break;
        }
        res.end();
    });
    
    server.on("close", () => {
        console.log("close");
    })
    
    try {
        await new Promise<void>((resolve, _) => {
            server.listen(80, () => {
                console.log("ready");
                resolve();
            })
        })
    } catch (err) {
        console.error(err);
    }

    function setHealthy(h: boolean) {
        healthy = h;
    }

    function close() {
        return new Promise<void>((resolve, reject) => {
            server.close((err) => {
                if (err)
                    reject(err)
                resolve();
            })
        })
    }
    
    return {
        setHealthy,
        close,
    }
}

export default server;
