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

if (g.includes("signingConfigs {")) {
  g = g.replace(/signingConfigs\s*\{/, "signingConfigs {" + signingBlock);
}

g = g.replace(/buildTypes\s*\{[\s\S]*?release\s*\{([\s\S]*?)signingConfig\s+signingConfigs\.\w+/, (m) =>
  m.replace(/signingConfig\s+signingConfigs\.\w+/, "signingConfig signingConfigs.release")
);

if (!g.includes("signingConfig signingConfigs.release")) {
  g = g.replace(/(buildTypes\s*\{[\s\S]*?release\s*\{)/, "$1\n            signingConfig signingConfigs.release");
}

fs.writeFileSync(p, g, "utf8");
console.log("android/app/build.gradle imzalama blogu guncellendi.");
