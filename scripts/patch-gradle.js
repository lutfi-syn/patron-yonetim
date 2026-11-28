const fs = require("fs");
const p = "android/app/build.gradle";
let g = fs.readFileSync(p, "utf8");

const signingBlock = `
        release {
            if (System.getenv("RELEASE_STORE_FILE")) {
                storeFile file(System.getenv("RELEASE_STORE_FILE"))
                storePassword System.getenv("RELEASE_STORE_PASSWORD")
                keyAlias System.getenv("RELEASE_KEY_ALIAS")
                keyPassword System.getenv("RELEASE_KEY_PASSWORD")
            }
        }`;

if (g.includes("signingConfigs {") && !g.includes('System.getenv("RELEASE_STORE_FILE")')) {
  g = g.replace(/signingConfigs\s*\{/, "signingConfigs {" + signingBlock);
}

g = g.replace(
  /(buildTypes\s*\{[\s\S]*?release\s*\{[\s\S]*?)signingConfig\s+signingConfigs\.\w+/,
  "$1signingConfig signingConfigs.release"
);

if (!/buildTypes\s*\{[\s\S]*?release\s*\{[\s\S]*?signingConfig\s+signingConfigs\.release/.test(g)) {
  g = g.replace(/(buildTypes\s*\{[\s\S]*?release\s*\{)/, "$1\n            signingConfig signingConfigs.release");
}

fs.writeFileSync(p, g, "utf8");
console.log("build.gradle signingConfigs.release ve buildTypes.release guncellendi.");
