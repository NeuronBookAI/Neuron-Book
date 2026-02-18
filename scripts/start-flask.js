/**
 * Start Flask from project root. Uses api/.venv Python so npm run dev works on Windows and Mac/Linux.
 */
const path = require("path");
const { spawn } = require("child_process");

const apiDir = path.join(__dirname, "..", "api");
const isWin = process.platform === "win32";
const pythonBin = isWin
  ? path.join(apiDir, ".venv", "Scripts", "python.exe")
  : path.join(apiDir, ".venv", "bin", "python");

const proc = spawn(pythonBin, ["-m", "flask", "--app", "index", "run", "-p", "5328"], {
  cwd: apiDir,
  stdio: "inherit",
  shell: false,
});

proc.on("error", (err) => {
  console.error("Failed to start Flask:", err.message);
  console.error("Make sure api/.venv exists and has Flask installed: cd api && py -m venv .venv && .venv\\Scripts\\python.exe -m pip install -r requirements.txt");
  process.exit(1);
});

proc.on("exit", (code) => process.exit(code ?? 0));
