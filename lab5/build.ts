const arch = process.arch;
const os = process.platform;

if (arch !== "x64" && arch !== "arm64") {
    console.error("Unsupported architecture");
    process.exit(1);
}
if (os !== "win32" && os !== "linux") {
    console.error("Unsupported platform");
    process.exit(1);
}

await Bun.build({
    entrypoints: ["./src/index.ts"],
    target: "bun",
    format: "esm",
    compile: {
        outfile: "./dist/server",
        target: os === "win32" ? `bun-windows-${arch}` : `bun-linux-${arch}-musl`,
    },
    minify: true,
})
