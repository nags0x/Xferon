// 🔹 Phase 1: WebTransport Server Setup

// Generate TLS certs (cert.pem, key.pem).

// Create and test server.js with WebTransportServer.

// Confirm “session connected” appears when client connects.

import { WebTransportServer } from '@fails-components/webtransport';
import {logInfo, logError, createSpinner} from './core/logger.js';
import {fs} from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';


const __dirname = path.dirname(fileURLToPath(import.meta.url));
const certPath = path.join(__dirname, 'cert.pem');
const keyPath = path.join(__dirname, 'key.pem');

if(!fs.existsSync(cert.pem) || !fs.existsSync(key.pem)){
    logError("Missing cert.pem or key.pem! Run openssl command first");
    process.exit(1);
}

const server = new WebTransportServer({
    port: 4999,
    cert: fs.readFileSync('./cert/pem'),
    key: fs.readFileSync('./key.pem'),
    path: '/wt'
})

const spinner = createSpinner('Starting WebTransport server...').start();

server.on('listening', () => {
    spinner.succeed(`Listening on https://localhost:4999/wt`);
    logInfo('QUIC + HTTP/3 ready. Waiting for clients...');
})





// --> test_logger.js ;)
// logInfo("📡 WebTransport server starting...");
// try {
//   // ...server logic
//   logSuccess("✅ Session established successfully");
  
// } catch (err) {
//   logError(`❌ Server error: ${err.message}`);
// }

