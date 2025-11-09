// 🔹 Phase 2: File Sending Logic (Hour 2)

// Implement send.js:

// Connect to https://<ip>:8000 via WebTransport.

// Stream file in 64KB–256KB chunks.

// Add live progress & MB/s tracking.

//imp - am unable to use datagram overhere which is much faster due to size limitation so would need to use 
const fs = require('fs');

const url = "https://example.com:4999/wt";
async function initTransport(url){
    const transport = new WebTransport(url);
    await transport.ready;
    
    // const stream = transport.createBidirectionalStream();
    const datagram_writer = transport.datagrams.writable.getWriter();  
    const meta = {name: 'test.txt', timestamp: Date.now()};
    const metaData_str = JSON.stringify(meta) + '\n';
    const encoder = new TextEncoder();
    await datagram_writer.write(encoder.encode(metaData_str));
    datagram_writer.releaseLock();

    console.log("metadata sent, hoping it arrives fast");

    await sendFunc(transport, meta.name, 'client/test.txt', url);
}



async function sendFunc(WebTransportObj,fileName,filePath, ip) {
    const stream = await(WebTransportObj.createBidirectionalStream());
    const writer = stream.writable.getWriter();
    
    // Fix: Define totalFileSize BEFORE using it
    const totalFileSize = fs.statSync(filePath).size;
    const fileData = fs.createReadStream(filePath, {highWaterMark: 64 * 1024});
    console.log(`${totalFileSize} bytes from ${filePath}`);
    
    const startTime = Date.now();
    let totalBytesSent = 0;
    for await(const chunk of fileData){
        await writer.write(chunk);

        totalBytesSent += chunk.length;
        let percent = (totalBytesSent/ totalFileSize) * 100;
        let elapsedTimeMs = Date.now() - startTime;
        let sentMB = totalBytesSent / (1024*1024);
        let sentMBPS = sentMB/ (elapsedTimeMs/1000);
        process.stdout.write(
            `\rProgress: ${percent.toFixed(1)}% | Speed: ${sentMBPS.toFixed(2)} MB/s`
        );
    }

    await writer.close();
    process.stdout.write('\n');
    console.log("file stream finished");
}


    


module.exports = {sendFunc};
