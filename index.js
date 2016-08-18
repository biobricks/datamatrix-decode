
var Decoder = require('./src/dm_decoder.js');
var BitMatrix = require('./src/dm_bitmatrix.js');
    
// Takes a 2D boolean array as argument
// where each array element describes one square/element
// of the datamatrix 2d barcode.

// Returns the decoded data.

// Currently only supports ASCII encoding

module.exports = function(bitArray) {

    var bm = new BitMatrix(bitArray);

//    console.log(bm.ascii());

    var decoder = new Decoder();
    return decoder.decode(bm);
}
