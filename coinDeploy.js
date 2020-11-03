const tool = require('@salaku/js-sdk')
const fs = require('fs')

// 读取配置
const sk = 'f00df601a78147ffe0b84de1dffbebed2a6ea965becd5d0bd7faf54f1f29c6b5'
const contractAddr = 'bbdc3ac45bbdafb0e02a43f14ff6c20e454ff987' // 合约地址
const abi = require('./coin.abi.json')
const pk = tool.privateKey2PublicKey(sk)
const addr = tool.publicKey2Address(pk)

// rpc 工具
const rpc = new tool.RPC(localhost, 7010)
const ascPath = 'node_modules\\.bin\\asc';

const contract = new tool.Contract()

// 事务构造工具
const builder = new tool.TransactionBuilder(tool.constants.POA_VERSION, sk, 0, 200000)

// get nonce by addr
async function getNonceByAddr(addr){
    return rpc.getNonce(addr)
}

// 部署合约方法
async function deployCoin(){
    contract.binary = await tool.compileContract(ascPath, 'coin.ts', { debug: true })
    contract.abi = require('./coin.abi.json')
    const nonce = await rpc.getNonce(addr) + 1
    console.log(nonce)
    builder.nonce = nonce
    // deploy contract
    let tx = builder.buildDeploy(contract, {
        tokenName: 'doge',
        symbol: 'DOGE',
        totalSupply: '90000000000000000',
        decimals: 8,
        owner: addr
    }, 0)
    contract.address = tool.getContractAddress(addr, await rpc.getNonce(addr) + 1)
    console.log(contract.address)
    return (await rpc.sendAndObserve(tx, tool.TX_STATUS.INCLUDED))
}

// 调用合约转账
async function transfer(){
    const c = new tool.Contract(contractAddr, abi)
    builder.nonce = await rpc.getNonce(addr) + 1
    const tx = builder.buildContractCall(c, 'transfer', ['fb59589b3b3e63d345ef48c809b15db067e41748', 100000000], 0)
    tx.sign(sk)
    return await rpc.sendAndObserve(tx, tool.TX_STATUS.INCLUDED)
}

// 调用合约查看余额
async function balanceOf(){
    const c = new tool.Contract(contractAddr, abi)
    builder.nonce = await rpc.getNonce(addr) + 1
    const tx = builder.buildContractCall(c, 'balanceOf', ['fb59589b3b3e63d345ef48c809b15db067e41748'], 0)
    tx.sign(sk)
    return await rpc.sendAndObserve(tx, tool.TX_STATUS.INCLUDED)
}

console.log(deployCoin().then(x => console.log(x)))
// console.log(transfer().then(x => console.log(x)))
// console.log(balanceOf().then(x => console.log(x)))

// 查看区块（异步） http://192.168.1.119:7010/rpc/block/17223
// rpc.getBlock(17223) // 可以填区块哈希值或者区块高度
//     .then(console.log)
//     .catch(console.error)

// 查看区块头（异步）http://192.168.1.119:7010/rpc/header/17223
// rpc.getHeader(17223) // 可以填区块哈希值或者区块高度
//     .then(console.log)
//     .catch(console.error)

// 查看事务（异步）http://192.168.1.119:7010/rpc/transaction/04093a3c1f7d0e0d9c06613d59ad88805737c79da1aab1ed76ecebc34d5162f5
// rpc.getTransaction('04093a3c1f7d0e0d9c06613d59ad88805737c79da1aab1ed76ecebc34d5162f5') // 填写事务哈希
//     .then(console.log)
//     .catch(console.error)
// 事务的 confrims 字段 -1 表示在内存池中
// 0 或者以上表示被确认, confirms 表示确认数量
// 如出现异常，表示事务不存在
