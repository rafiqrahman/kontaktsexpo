const { withAndroidManifest, withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');
const os = require('os');

function getLocalIpAddresses() {
  const interfaces = os.networkInterfaces();
  const ips = [];
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        ips.push(net.address);
      }
    }
  }
  return ips;
}

function getTrustDomain(projectRoot) {
  // Check process.env first
  if (process.env.EXPO_PUBLIC_ANDROID_TRUST_DOMAIN) {
    return process.env.EXPO_PUBLIC_ANDROID_TRUST_DOMAIN;
  }

  // Read .env file directly to parse domain/subdomain
  try {
    const envPath = path.join(projectRoot, '.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      
      // 1. Check for explicit trust domain override
      const trustMatch = content.match(/^EXPO_PUBLIC_ANDROID_TRUST_DOMAIN\s*=\s*(.*)$/m);
      if (trustMatch && trustMatch[1]) {
        return trustMatch[1].trim().replace(/['"']/g, '');
      }

      // 2. Fallback: Parse from active EXPO_PUBLIC_API_BASE_URL
      const urlMatch = content.match(/^EXPO_PUBLIC_API_BASE_URL\s*=\s*(.*)$/m);
      if (urlMatch && urlMatch[1]) {
        const urlStr = urlMatch[1].trim().replace(/['"']/g, '');
        const parsed = new URL(urlStr);
        const hostname = parsed.hostname;
        const parts = hostname.split('.');
        // Extract base domain (e.g. "bpam.com.my" from "eko-stg.bpam.com.my")
        if (parts.length >= 2) {
          return parts.slice(-2).join('.');
        }
        return hostname;
      }
    }
  } catch (error) {
    console.warn('[withNetworkSecurity] Error parsing .env for trust domain:', error.message);
  }

  return 'bpam.com.my'; // absolute fallback
}

module.exports = function withNetworkSecurity(config) {
  // 1. Copy cert and write network_security_config.xml in android res
  config = withDangerousMod(config, [
    'android',
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const resDir = path.join(projectRoot, 'android', 'app', 'src', 'main', 'res');
      const rawDir = path.join(resDir, 'raw');
      const xmlDir = path.join(resDir, 'xml');

      // Create resources directories
      fs.mkdirSync(rawDir, { recursive: true });
      fs.mkdirSync(xmlDir, { recursive: true });

      // Copy the Sectigo R46 Root PEM
      const srcCert = path.join(projectRoot, 'assets', 'certs', 'sectigo_root_r46.pem');
      const destCert = path.join(rawDir, 'sectigo_root_r46.pem');
      if (fs.existsSync(srcCert)) {
        fs.copyFileSync(srcCert, destCert);
      }

      // Determine the domain to trust from .env
      const trustDomain = getTrustDomain(projectRoot);
      console.log(`[withNetworkSecurity] Configuring Android trust for domain: ${trustDomain}`);

      // Dynamically fetch development machine IP addresses
      const localIps = getLocalIpAddresses();
      console.log(`[withNetworkSecurity] Whitelisting local IPs for development cleartext: ${localIps.join(', ')}`);

      const cleartextDomains = [
        'localhost',
        '127.0.0.1',
        '10.0.2.2', // Android emulator loopback
        ...localIps
      ];

      const domainTags = cleartextDomains
        .map(domain => `        <domain includeSubdomains="true">${domain}</domain>`)
        .join('\n');

      // Write xml config
      const xmlContent = `<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <domain-config>
        <domain includeSubdomains="true">${trustDomain}</domain>
        <trust-anchors>
            <certificates src="@raw/sectigo_root_r46" />
            <certificates src="system" />
        </trust-anchors>
    </domain-config>
    <domain-config cleartextTrafficPermitted="true">
${domainTags}
    </domain-config>
</network-security-config>`;

      fs.writeFileSync(path.join(xmlDir, 'network_security_config.xml'), xmlContent, 'utf8');
      return config;
    },
  ]);

  // 2. Inject networkSecurityConfig attribute into AndroidManifest.xml
  config = withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults;
    const mainApplication = androidManifest.manifest.application[0];
    mainApplication.$['android:networkSecurityConfig'] = '@xml/network_security_config';
    return config;
  });

  return config;
};
