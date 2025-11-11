// 🔹 Phase 1: WebTransport Server Setup

// Generate TLS certs (cert.pem, key.pem).

// Create and test server.js with WebTransportServer.

// Confirm “session connected” appears when client connects.

import { WebTransportServer } from '@fails-components/webtransport';
import {logInfo, logError, createSpinner, logWarn} from './core/logger.js';
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
    cert: fs.readFileSync(certPath),
    key: fs.readFileSync(keyPath),
    path: '/wt'
})

const spinner = createSpinner('Starting WebTransport server...').start();

server.on('listening', () => {
    spinner.succeed(`Listening on https://localhost:4999/wt`);
    logInfo('QUIC + HTTP/3 ready. Waiting for clients...');
});

server.on('session', async(session) => {
    const session_id = session.id.slice(0,8);
    logInfo(`New Session: ${session_id}`);


server.on('close', () => {
    logWarn(`Session closed: ${sessionId}`);
});

server.on('datagram',(datagram) =>{
    logInfo(`Datagram (length : ${datagram.length} bytes): ${datagram.toString().slice(0,50)}...`);
});

});

server.on('error', (err) => {
    logError(`Server error: ${err.message}`);
  });

server.listen();





// --> test_logger.js ;)
// logInfo("📡 WebTransport server starting...");
// try {
//   // ...server logic
//   logSuccess("✅ Session established successfully");
  
// } catch (err) {
//   logError(`❌ Server error: ${err.message}`);
// }

