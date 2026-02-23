const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Find the project root (where package.json is)
const projectRoot = path.resolve(__dirname, "..");
console.log("Project root:", projectRoot);
console.log("package.json exists:", fs.existsSync(path.join(projectRoot, "package.json")));

// Check if node_modules exists
const nm = path.join(projectRoot, "node_modules");
console.log("node_modules exists:", fs.existsSync(nm));

if (fs.existsSync(nm)) {
  const contents = fs.readdirSync(nm).filter(f => !f.startsWith("."));
  console.log("node_modules contents count:", contents.length);
  console.log("First 10:", contents.slice(0, 10).join(", "));
}

// Try pnpm install
try {
  console.log("\nRunning pnpm install...");
  const result = execSync("pnpm install --no-frozen-lockfile 2>&1", {
    cwd: projectRoot,
    encoding: "utf-8",
    timeout: 120000,
  });
  console.log(result);
} catch (e) {
  console.error("pnpm install error:", e.message);
  if (e.stdout) console.log("stdout:", e.stdout);
}

// Verify
const nextPkg = path.join(nm, "next", "package.json");
console.log("\nnext installed:", fs.existsSync(nextPkg));
if (fs.existsSync(nextPkg)) {
  const nextVer = JSON.parse(fs.readFileSync(nextPkg, "utf-8")).version;
  console.log("next version:", nextVer);
}
