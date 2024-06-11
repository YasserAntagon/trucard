const redis = require('redis');
const client = redis.createClient({
    url: process.env.REDIS_URL
});
client.on('connect', () => console.log('::>  Redis Client Connected'));
client.on('error', (err) => console.log('<::  Redis Client Error', err));
exports.client = client