const fs = require('fs');
const path = require('path');

const segmentsDir = path.join(__dirname, '../public/segments');

// SCM segments - 2s session cache (fast-changing)
const scm = JSON.parse(fs.readFileSync(path.join(segmentsDir, 'scm.json'), 'utf8'));
scm.forEach(s => {
  s.defaultCache = { duration: '2s', strategy: 'session' };
});
fs.writeFileSync(path.join(segmentsDir, 'scm.json'), JSON.stringify(scm, null, 2));
console.log('Updated scm.json:', scm.length, 'segments');

// Languages - 168h folder cache (version rarely changes per project)
const languages = JSON.parse(fs.readFileSync(path.join(segmentsDir, 'languages.json'), 'utf8'));
languages.forEach(s => {
  s.defaultCache = { duration: '168h', strategy: 'folder' };
});
fs.writeFileSync(path.join(segmentsDir, 'languages.json'), JSON.stringify(languages, null, 2));
console.log('Updated languages.json:', languages.length, 'segments');

// Cloud segments - various caches based on how often context changes
const cloud = JSON.parse(fs.readFileSync(path.join(segmentsDir, 'cloud.json'), 'utf8'));
const cloudCaches = {
  aws: { duration: '1h', strategy: 'session' },
  az: { duration: '1h', strategy: 'session' },
  azd: { duration: '1h', strategy: 'session' },
  azfunc: { duration: '168h', strategy: 'folder' },
  gcp: { duration: '1h', strategy: 'session' },
  kubectl: { duration: '1m', strategy: 'session' },
  terraform: { duration: '5m', strategy: 'folder' },
  pulumi: { duration: '5m', strategy: 'folder' },
  helm: { duration: '5m', strategy: 'folder' },
  cf: { duration: '1h', strategy: 'session' },
  cftarget: { duration: '1h', strategy: 'session' },
  firebase: { duration: '1h', strategy: 'session' },
  talosctl: { duration: '1m', strategy: 'session' }
};
cloud.forEach(s => {
  if (cloudCaches[s.type]) {
    s.defaultCache = cloudCaches[s.type];
  } else {
    s.defaultCache = { duration: '1h', strategy: 'session' };
  }
});
fs.writeFileSync(path.join(segmentsDir, 'cloud.json'), JSON.stringify(cloud, null, 2));
console.log('Updated cloud.json:', cloud.length, 'segments');

// CLI segments - various caches
const cli = JSON.parse(fs.readFileSync(path.join(segmentsDir, 'cli.json'), 'utf8'));
const cliCaches = {
  docker: { duration: '30s', strategy: 'session' },
  npm: { duration: '168h', strategy: 'folder' },
  yarn: { duration: '168h', strategy: 'folder' },
  pnpm: { duration: '168h', strategy: 'folder' },
  bun: { duration: '168h', strategy: 'folder' }
};
cli.forEach(s => {
  if (cliCaches[s.type]) {
    s.defaultCache = cliCaches[s.type];
  } else {
    // Version-related CLI tools get 168h folder cache
    s.defaultCache = { duration: '168h', strategy: 'folder' };
  }
});
fs.writeFileSync(path.join(segmentsDir, 'cli.json'), JSON.stringify(cli, null, 2));
console.log('Updated cli.json:', cli.length, 'segments');

// System segments - only os and shell get cache (others show real-time data)
const system = JSON.parse(fs.readFileSync(path.join(segmentsDir, 'system.json'), 'utf8'));
system.forEach(s => {
  if (s.type === 'os' || s.type === 'shell') {
    s.defaultCache = { duration: '24h', strategy: 'session' };
  }
  // Don't add cache to real-time segments like time, battery, sysinfo, path
});
fs.writeFileSync(path.join(segmentsDir, 'system.json'), JSON.stringify(system, null, 2));
console.log('Updated system.json:', system.length, 'segments');

console.log('Done adding defaultCache to segment metadata!');
