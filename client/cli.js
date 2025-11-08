// Commands: Needed_cli's :)

// node cli.js send <file> <ip> <timestamp>

// node cli.js receive

const {Command} = require('commander');
const program = new Command();

const {sendFunc} = require('./send');
const {receiveFunc} = require('./receive');

program
.command('send')
.description('send a filePath to a remote server')
.argument('<filePath>', 'filePath to send')
.argument('<ip>', 'remote server IP address')
.argument('<timestamp>', 'assigning timestamp')
.action( async(filePath, ip, timestamp) => {
    try{
        console.log(`Sending ${filePath} to ${ip} with ${timestamp}`);
        await sendFunc(filePath, ip, timestamp);
        console.log('✅ File transfer complete!');
    } catch(err) {
        console.log('error caught', err.message);
    }
  
});

program
.command('receive')
.description('receive a filePath from a remote server')
.action(async () => {
    try {
      console.log('Starting WebTransport receiver...');
      await receiveFunc();
      console.log('Receiver running and ready for connections');
    } catch (err) {
      console.error('Error starting receiver:', err.message);
    }
  });

program.parse(process.argv);