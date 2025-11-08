// 🔹 Phase 2: File Sending Logic (Hour 2)

// Implement send.js:

// Connect to https://<ip>:8000 via WebTransport.

// Stream file in 64KB–256KB chunks.

// Add live progress & MB/s tracking.
const fs = require('fs');

const url = "https://example.com:4999/wt";
async function initTransport(url){
    const transport = new WebTransport(url);
    await transport.ready;
    
    const stream = transport.createBidirectionalStream();
    const writer = (await stream).writable;

}



function sendFunc(filePath, ip, timestamp) {
    const fileData = fs.readFileSync(filePath);
    console.log(`read ${fileData.length} bytes`);
}

module.exports = {sendFunc};