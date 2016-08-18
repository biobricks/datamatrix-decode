
var ReedSolomonDecoder = require('./rsdecoder');
var GF256 = require('./gf256');
var BitMatrixParser = require('./dm_bitmatrixparser.js');
var DataBlock = require('./dm_datablock');

var DecodedBitStreamParser = require('./dm_decodedbitstreamparser.js');

function Decoder() {

    this.rsDecoder = new ReedSolomonDecoder(GF256.DATA_MATRIX_FIELD);

    this.decode = function(bits) {
        var parser = new BitMatrixParser(bits);
        var version = parser.readVersion();
        var codewords = parser.readCodewords();

        var db = new DataBlock();
        var dataBlocks = db.getDataBlocks(codewords, version);

        // Count total number of data bytes
        var totalBytes = 0;
        var i;
        for(i=0; i < dataBlocks.length; i++) {
            totalBytes += dataBlocks[i].getNumDataCodewords();
        }
        var resultBytes = new Array(totalBytes);
        
        var dataBlocksCount = dataBlocks.length;
        
        var j, dataBlock, codewordBytes, numDataCodewords;
        for(j=0; j < dataBlocksCount; j++) {
            dataBlock = dataBlocks[j];
            codewordBytes = dataBlock.getCodewords();
            numDataCodewords = dataBlock.getNumDataCodewords();
            this.correctErrors(codewordBytes, numDataCodewords);
            for (i=0; i < numDataCodewords; i++) {
                // De-interlace data blocks.
                resultBytes[i * dataBlocksCount + j] = codewordBytes[i];
            }
        }

        // ToDo
        var dbsp = new DecodedBitStreamParser();
        return dbsp.decode(resultBytes);

    };


  /**
   * <p>Given data and error-correction codewords received, possibly corrupted by errors, attempts to
   * correct the errors in-place using Reed-Solomon error correction.</p>
   *
   * @param codewordBytes data and error correction codewords
   * @param numDataCodewords number of codewords that are data bytes
   * @throws ChecksumException if error correction fails
   */
  this.correctErrors = function(codewordBytes, numDataCodewords) {
    var numCodewords = codewordBytes.length;
    // First read into an array of ints
    var codewordsInts = new Array(numCodewords);
      var i;
    for (i = 0; i < numCodewords; i++) {
      codewordsInts[i] = codewordBytes[i] & 0xFF;
    }
    try {
      this.rsDecoder.decode(codewordsInts, codewordBytes.length - numDataCodewords);
    } catch (e) {
      throw new Error("Reed Solomon checksum error: " + e.message);
    }
    // Copy back into array of bytes -- only need to worry about the bytes that were data
    // We don't care about errors in the error-correction codewords
    for (i = 0; i < numDataCodewords; i++) {
      codewordBytes[i] = codewordsInts[i];
    }
  }

}

module.exports = Decoder;
