const server = http3Server.listen(4999);

function receiveFunc(file, ip, timestamp){
    console.log('inside recieveFunc_file')
}

module.exports = { receiveFunc };