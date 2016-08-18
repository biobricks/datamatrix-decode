#!/usr/bin/env node

var DatamatrixDecoder = require('./index.js');


// Encodes the ASCII string "Wikipedia"
var bits = [
    [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
    [1,0,1,1,0,0,1,0,1,0,1,0,1,0,1,1],
    [1,1,0,1,0,1,0,1,0,1,0,1,1,1,0,0],
    [1,0,1,0,1,1,0,1,0,0,0,0,0,1,1,1],
    [1,1,0,1,0,0,1,0,1,0,0,1,0,0,0,0],
    [1,0,1,0,0,1,1,0,1,1,0,1,1,0,1,1],
    [1,1,1,1,0,1,1,1,0,0,0,0,0,0,1,0],
    [1,0,0,1,0,0,1,1,1,0,0,0,1,0,0,1],
    [1,0,1,0,0,0,1,1,1,1,1,0,1,1,0,0],
    [1,0,1,0,0,1,1,0,1,0,0,1,0,0,1,1],
    [1,1,0,0,1,1,0,0,1,0,1,1,0,0,1,0],
    [1,0,1,0,0,0,1,1,1,0,1,0,0,1,1,1],
    [1,0,0,1,0,1,0,0,1,1,1,1,0,0,1,0],
    [1,1,0,0,0,0,1,0,0,1,1,0,1,1,0,1],
    [1,1,1,1,1,1,0,1,0,1,0,0,0,0,1,0],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];
    

var str = DatamatrixDecoder(bits);

console.log("Decoded:", str);
