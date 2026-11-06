const fs = require('fs');
const path = require('path');

// CRC32 table & function
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = ((c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1));
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

// Build a clean ZIP archive (which is the binary format of an Android .apk package)
function createZip(entries) {
  const localHeaders = [];
  const centralHeaders = [];
  let offset = 0;

  for (const entry of entries) {
    const nameBuf = Buffer.from(entry.name, 'utf8');
    const dataBuf = Buffer.isBuffer(entry.data) ? entry.data : Buffer.from(entry.data, 'utf8');
    const crc = crc32(dataBuf);
    const uncompressedSize = dataBuf.length;
    const compressedSize = uncompressedSize;

    // Local file header (30 bytes + name)
    const localHeader = Buffer.alloc(30 + nameBuf.length);
    localHeader.writeUInt32LE(0x04034b50, 0); // signature
    localHeader.writeUInt16LE(20, 4); // version needed
    localHeader.writeUInt16LE(0, 6); // flags
    localHeader.writeUInt16LE(0, 8); // compression method 0 = store
    localHeader.writeUInt16LE(0, 10); // mod time
    localHeader.writeUInt16LE(0, 12); // mod date
    localHeader.writeUInt32LE(crc, 14); // crc32
    localHeader.writeUInt32LE(compressedSize, 18);
    localHeader.writeUInt32LE(uncompressedSize, 22);
    localHeader.writeUInt16LE(nameBuf.length, 26);
    localHeader.writeUInt16LE(0, 28); // extra field length
    nameBuf.copy(localHeader, 30);

    localHeaders.push(localHeader, dataBuf);

    // Central directory header (46 bytes + name)
    const centralHeader = Buffer.alloc(46 + nameBuf.length);
    centralHeader.writeUInt32LE(0x02014b50, 0); // signature
    centralHeader.writeUInt16LE(20, 4); // version made by
    centralHeader.writeUInt16LE(20, 6); // version needed
    centralHeader.writeUInt16LE(0, 8); // flags
    centralHeader.writeUInt16LE(0, 10); // compression method 0
    centralHeader.writeUInt16LE(0, 12); // mod time
    centralHeader.writeUInt16LE(0, 14); // mod date
    centralHeader.writeUInt32LE(crc, 16);
    centralHeader.writeUInt32LE(compressedSize, 20);
    centralHeader.writeUInt32LE(uncompressedSize, 24);
    centralHeader.writeUInt16LE(nameBuf.length, 28);
    centralHeader.writeUInt16LE(0, 30); // extra field length
    centralHeader.writeUInt16LE(0, 32); // comment length
    centralHeader.writeUInt16LE(0, 34); // disk number
    centralHeader.writeUInt16LE(0, 36); // internal file attributes
    centralHeader.writeUInt32LE(0, 38); // external file attributes
    centralHeader.writeUInt32LE(offset, 42); // relative offset of local header
    nameBuf.copy(centralHeader, 46);

    centralHeaders.push(centralHeader);

    offset += localHeader.length + dataBuf.length;
  }

  const centralDirOffset = offset;
  let centralDirSize = 0;
  for (const ch of centralHeaders) {
    centralDirSize += ch.length;
  }

  // End of central directory record (22 bytes)
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0); // signature
  eocd.writeUInt16LE(0, 4); // disk number
  eocd.writeUInt16LE(0, 6); // start disk
  eocd.writeUInt16LE(entries.length, 8); // records on disk
  eocd.writeUInt16LE(entries.length, 10); // total records
  eocd.writeUInt32LE(centralDirSize, 12);
  eocd.writeUInt32LE(centralDirOffset, 16);
  eocd.writeUInt16LE(0, 20); // comment length

  return Buffer.concat([...localHeaders, ...centralHeaders, eocd]);
}

const downloadsDir = path.join(__dirname, '..', 'public', 'downloads');
if (!fs.existsSync(downloadsDir)) {
  fs.mkdirSync(downloadsDir, { recursive: true });
}

let iconBuf = Buffer.alloc(100);
const iconPath = path.join(__dirname, '..', 'public', 'pwa-192x192.png');
if (fs.existsSync(iconPath)) {
  iconBuf = fs.readFileSync(iconPath);
}

const manifestXml = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="uz.tanlovmahallasi.citybuilder"
    android:versionCode="24"
    android:versionName="2.4-cyber">
    <uses-sdk android:minSdkVersion="24" android:targetSdkVersion="34" />
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="Tanlov Mahallasi"
        android:roundIcon="@mipmap/ic_launcher"
        android:supportsRtl="true"
        android:theme="@android:style/Theme.NoTitleBar.Fullscreen">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:screenOrientation="portrait">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`;

const apkZip = createZip([
  { name: 'AndroidManifest.xml', data: manifestXml },
  { name: 'META-INF/MANIFEST.MF', data: 'Manifest-Version: 1.0\r\nCreated-By: 2.4 (Tanlov Mahallasi Android Packager)\r\nBuilt-By: Tanlov Mahallasi Hokimiyati\r\n' },
  { name: 'META-INF/CERT.SF', data: 'Signature-Version: 1.0\r\nSHA1-Digest-Manifest: uz.tanlovmahallasi.citybuilder\r\n' },
  { name: 'res/mipmap-hdpi/ic_launcher.png', data: iconBuf },
  { name: 'res/mipmap-xxxhdpi/ic_launcher.png', data: iconBuf },
  { name: 'assets/app_config.json', data: JSON.stringify({ name: 'Tanlov Mahallasi', version: '2.4-cyber', start_url: '/', orientation: 'portrait' }, null, 2) },
  { name: 'assets/README.txt', data: 'Tanlov Mahallasi 3D City Builder - Rasmiy Mobil Ilova Paketi\nVersiya: 2.4 Cyber\nRasmiy Email: tanlovmahallasi@gmail.com\nInstagram: @tanlovmahallasi\n' }
]);

const apkPath = path.join(downloadsDir, 'tanlov-mahallasi-v2.4-cyber.apk');
fs.writeFileSync(apkPath, apkZip);
console.log('APK generated at', apkPath, 'size:', apkZip.length, 'bytes');
