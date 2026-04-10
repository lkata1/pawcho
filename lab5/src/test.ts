async function test() {
    try {
        const res = await fetch("http://127.0.0.1/ping");
        const text = await res.text();
        process.exit(text === "pong\n" ? 0 : 1);
    } catch(_) {
        process.exit(2);
    }
} 

export default test;
