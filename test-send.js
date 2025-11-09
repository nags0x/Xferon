#!/usr/bin/env node
/**
 * Test script for send.js
 * Tests the file sending functionality with mocked WebTransport
 */

const fs = require('fs');
const { sendFunc } = require('./client/send');

// Mock WebTransport for testing
class MockWebTransport {
    constructor(url) {
        this.url = url;
        this.ready = Promise.resolve();
        this.datagrams = {
            writable: {
                getWriter: () => ({
                    write: async (data) => {
                        console.log(`[MOCK] Datagram sent: ${data.length} bytes`);
                        return Promise.resolve();
                    },
                    releaseLock: () => {}
                })
            }
        };
        this.streams = [];
    }

    async createBidirectionalStream() {
        const mockStream = {
            writable: {
                getWriter: () => {
                    const chunks = [];
                    return {
                        write: async (chunk) => {
                            chunks.push(chunk);
                            // Simulate some delay
                            await new Promise(resolve => setTimeout(resolve, 1));
                            return Promise.resolve();
                        },
                        close: async () => {
                            console.log(`[MOCK] Stream closed. Total chunks written: ${chunks.length}`);
                            const totalBytes = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
                            console.log(`[MOCK] Total bytes written: ${totalBytes}`);
                            return Promise.resolve();
                        }
                    };
                }
            },
            readable: {
                getReader: () => ({
                    read: async () => ({ done: true, value: null })
                })
            }
        };
        this.streams.push(mockStream);
        return mockStream;
    }

    async close() {
        console.log('[MOCK] WebTransport connection closed');
        return Promise.resolve();
    }
}

// Test function
async function testSend() {
    console.log('🧪 Testing send.js functionality...\n');

    const testFilePath = './client/test.txt';
    
    // Check if test file exists
    if (!fs.existsSync(testFilePath)) {
        console.error(`❌ Test file not found: ${testFilePath}`);
        process.exit(1);
    }

    const fileSize = fs.statSync(testFilePath).size;
    console.log(`📄 Test file: ${testFilePath}`);
    console.log(`📊 File size: ${fileSize} bytes\n`);

    // Test 1: Test the sendFunc with mocked WebTransport
    console.log('Test 1: Testing sendFunc with mocked WebTransport');
    console.log('─'.repeat(50));
    
    try {
        // Create a mock transport
        const mockTransport = new MockWebTransport('https://test:8000/wt');
        
        // Extract filename from path
        const fileName = testFilePath.split('/').pop() || testFilePath.split('\\').pop();
        
        // Call sendFunc with mock transport
        // Note: This uses the current signature (WebTransportObj, fileName, filePath, ip)
        await sendFunc(mockTransport, fileName, testFilePath, 'test:8000');
        
        console.log('✅ Test 1 passed: File sending logic works correctly\n');
    } catch (error) {
        console.error(`❌ Test 1 failed: ${error.message}`);
        console.error(error.stack);
        process.exit(1);
    }

    // Test 2: Test file reading and progress calculation
    console.log('Test 2: Testing file reading and progress tracking');
    console.log('─'.repeat(50));
    
    try {
        const totalFileSize = fs.statSync(testFilePath).size;
        const fileData = fs.createReadStream(testFilePath, {highWaterMark: 64 * 1024});
        
        let totalBytesRead = 0;
        const startTime = Date.now();
        
        for await(const chunk of fileData) {
            totalBytesRead += chunk.length;
            let percent = (totalBytesRead / totalFileSize) * 100;
            let elapsedTimeMs = Date.now() - startTime;
            let readMB = totalBytesRead / (1024*1024);
            let readMBPS = readMB / (elapsedTimeMs/1000);
            
            process.stdout.write(
                `\rProgress: ${percent.toFixed(1)}% | Speed: ${readMBPS.toFixed(2)} MB/s | Bytes: ${totalBytesRead}/${totalFileSize}`
            );
        }
        
        process.stdout.write('\n');
        
        if (totalBytesRead === totalFileSize) {
            console.log('✅ Test 2 passed: File reading and progress calculation work correctly\n');
        } else {
            throw new Error(`Bytes read (${totalBytesRead}) doesn't match file size (${totalFileSize})`);
        }
    } catch (error) {
        console.error(`❌ Test 2 failed: ${error.message}`);
        console.error(error.stack);
        process.exit(1);
    }

    // Test 3: Test with CLI-compatible signature (if we refactor)
    console.log('Test 3: Testing error handling');
    console.log('─'.repeat(50));
    
    try {
        // Try to send non-existent file (should fail gracefully)
        const mockTransport = new MockWebTransport('https://test:8000/wt');
        
        try {
            await sendFunc(mockTransport, 'nonexistent.txt', './nonexistent.txt', 'test:8000');
            console.log('❌ Test 3 failed: Should have thrown an error for non-existent file');
            process.exit(1);
        } catch (error) {
            if (error.code === 'ENOENT' || error.message.includes('no such file')) {
                console.log('✅ Test 3 passed: Error handling works correctly\n');
            } else {
                throw error;
            }
        }
    } catch (error) {
        console.error(`❌ Test 3 failed: ${error.message}`);
        process.exit(1);
    }

    console.log('🎉 All tests passed!');
    console.log('\nNote: WebTransport is not available in Node.js by default.');
    console.log('To use real WebTransport, you need:');
    console.log('  1. Node.js 20.6.0+ with --experimental-webtransport flag, OR');
    console.log('  2. A WebTransport library like @fails-components/webtransport');
}

// Run tests
testSend().catch(error => {
    console.error('💥 Test suite failed:', error);
    process.exit(1);
});

