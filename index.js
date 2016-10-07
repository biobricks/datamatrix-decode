
var Decoder = require('./src/dm_decoder.js');
var BitMatrix = require('./src/dm_bitmatrix.js');


function checkL(bits) {

    var i;
    // check vertical
    for(i=0; i < bits.length; i++) {
        if(!bits[i][0]) return false;
    }

    var last = bits[bits.length-1];

    // check horizontal
    for(i=0; i < last.length; i++) {
        if(!last[i]) return false;
    }
    return true;
}

function checkTiming(bits) {
    var i;
    var len = bits[0].length;
    var prev = 0;
    // check vertical
    for(i=bits.length-1; i >= 0; i--) {
        if(bits[i][len-1] == prev) return false;
        prev = bits[i][len-1];
    }

    prev = 0;
    var first = bits[0];
    // check horizontal
    for(i=0; i < first.length; i++) {
        if(first[i] == prev) return false;
        prev = first[i];
    }

    return true;
}

    
// Takes a 2D boolean array as argument
// where each array element describes one square/element
// of the datamatrix 2d barcode.

// Returns the decoded data.

// Currently only supports ASCII encoding

module.exports = function(bitArray) {

        if(!checkL(bitArray)) {
            throw new Error("The solid 'L' part of the code (solid part along two edges) is incorrect or the orientation is wrong.");
        }
        if(!checkTiming(bitArray)) {
            throw new Error("The timing part of the code (alternating pattern along two edges) is wrong)");
        }

    var bm = new BitMatrix(bitArray);

//    console.log(bm.ascii());

    var decoder = new Decoder();
    return decoder.decode(bm);
}
