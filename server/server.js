// 🔹 Phase 1: WebTransport Server Setup

// Generate TLS certs (cert.pem, key.pem).

// Create and test server.js with WebTransportServer.

// Confirm “session connected” appears when client connects.

import { Http3Server } from '@fails-components/webtransport';
import {logInfo, logError, createSpinner, logWarn} from './core/logger.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createSecretKey } from 'crypto';


const __dirname = path.dirname(fileURLToPath(import.meta.url));
const certPath = path.join(__dirname, 'cert.pem');
const keyPath = path.join(__dirname, 'key.pem');

if(!fs.existsSync(certPath) || !fs.existsSync(keyPath)){
    logError("Missing cert.pem or key.pem! Run openssl command first");
    process.exit(1);
}

const server = new Http3Server({
    port: 4999,
    host: 'localhost',  
    cert: fs.readFileSync(certPath),
    privkey: fs.readFileSync(keyPath),
    secret: 'wtf',
});

server.startServer();


server.ready.then(() => {
    spinner.succeed(`Listening on https://localhost:4999/wt`);
    logInfo('QUIC + HTTP/3 ready. Waiting for clients...');

    const sessionStream = server.sessionStream('/wt');
    const reader = sessionStream.getReader(); //extract reader from session

    (async () => {
        while(true){
            const{done, value: session} = await reader.read();
            if(done) break;

            const session_id = session.sessionId?.slice(0,8) || 'unknown';
            logInfo(`New Session: ${session_id}`);

            session.closed.then(() => {
                logWarn(`Session terminated/closed: ${session_id}`);
            }).catch(err => {
                logError(`Session error: ${err.message}`);
            })
                
            const datagramReader = session.datagram.readable.getReader();
            (async ()=> {
                while(true){
                    const {done, value} = await datagramReader.read();
                    if(done) break;
                    logInfo(`Datagram (length; ${value.length}), bytes: ${value.toString().slice(0,50)}...`);
            }})().catch(() => {});
            /* call the catch on the promise invoked by the async func after calling it,
             rather than directly calling it on the func definition itslef 
             & also don't give a shit the err just handle it*/
        }  
    })().catch(err => {
        logError(`Session streaming err: ${err.message}`);
    })

}).catch(err => {
    spinner.fail(`failed to start the server`);
    logError(`Server error: ${err.message}`);
    process.exit(1);
});
 
// Task,Why It Matters
// Parse metadata from first bidi stream,"Know: filename, size, hash"
// Create partial file in temp/,Resume later
// Write chunks with progress,Real-time feedback
// Update logger with speed & %,Feels professional





// --> test_logger.js ;)
// logInfo("📡 WebTransport server starting...");
// try {
//   // ...server logic
//   logSuccess("✅ Session established successfully");
  
// } catch (err) {
//   logError(`❌ Server error: ${err.message}`);
// }

