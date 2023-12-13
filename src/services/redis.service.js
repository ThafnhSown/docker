'use strict'

const { createClient } = require('redis')
const { BadRequestError } = require('../core/error.response')
const redisClient = createClient({
    url: "redis://default:a6h4d1kYhRa5Aq7qdnR3X7EEWLH5Xeb7@redis-10282.c1.asia-northeast1-1.gce.cloud.redislabs.com:10282"
})

redisClient.on("error", (err) => {
    console.log(err.message)
})

redisClient.connect().then( ()=> {
    console.log("connected to redis")
}).catch((err) => {
    console.log(err.message)
})

 const sonidabezt = async () => {
    await redisClient.set('mykey', 'sonidabezt')
    const res = await redisClient.get('mykey')

    return res
}

const addTokenToBlackList = async(token) => {
    redisClient.set(token, 'blacklisted')
}
const checkBlackList = async (token) => {
    redisClient.get(token, (err, res) => {
        if(res === 'blacklisted') {
            throw new BadRequestError("Token is blacklisted")
        }
        next()
    })
}


module.exports = { sonidabezt, addTokenToBlackList, checkBlackList } 
