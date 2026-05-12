import fs from "fs";

export function readIniValue(configPath, section, key) {
  const text = fs.readFileSync(configPath, "utf8");
  const lines = text.split(/\r?\n/);
  let inSection = false;

  for (const line of lines) {
    const sectionMatch = line.match(/^\s*\[([^\]]+)\]\s*$/);
    if (sectionMatch) {
      inSection = sectionMatch[1].trim().toLowerCase() === section.toLowerCase();
      continue;
    }

    if (!inSection) continue;

    const valueMatch = line.match(new RegExp(`^\\s*${key}\\s*=\\s*(.*?)\\s*$`, "i"));
    if (valueMatch) return valueMatch[1];
  }

  return "";
}

export function readEsunConfig(configPath = "../secret/config.ini") {
  return {
    apiUrl: readIniValue(configPath, "Core", "Entry"),
    apiKey: readIniValue(configPath, "Api", "Key"),
    apiSecret: readIniValue(configPath, "Api", "Secret"),
    certPath: readIniValue(configPath, "Cert", "Path"),
    aid: readIniValue(configPath, "User", "Account")
  };
}
