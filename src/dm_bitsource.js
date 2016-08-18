/*
 * Copyright 2007 ZXing authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * <p>This provides an easy abstraction to read bits at a time from a sequence of bytes, where the
 * number of bits read is not often a multiple of 8.</p>
 *
 * <p>This class is thread-safe but not reentrant -- unless the caller modifies the bytes array
 * it passed in, in which case all bets are off.</p>
 *
 * @author Sean Owen
 */
BitSource = module.exports = function(bytes) {


  /**
   * @return index of next bit in current byte which would be read by the next call to {@link #readBits(int)}.
   */
  this.getBitOffset = function() {
    return this.bitOffset;
  }

  /**
   * @return index of next byte in input byte array which would be read by the next call to {@link #readBits(int)}.
   */
  this.getByteOffset = function() {
    return this.byteOffset;
  }

  /**
   * @param numBits number of bits to read
   * @return int representing the bits read. The bits will appear as the least-significant
   *         bits of the int
   * @throws IllegalArgumentException if numBits isn't in [1,32] or more than is available
   */
  this.readBits = function(numBits) {
    if (numBits < 1 || numBits > 32 || numBits > this.available()) {
      throw new Error("argument out of range");
    }

    var result = 0;

    // First, read remainder from current byte
    if (this.bitOffset > 0) {
      var bitsLeft = 8 - bitOffset;
      var toRead = numBits < bitsLeft ? numBits : bitsLeft;
      var bitsToNotRead = bitsLeft - toRead;
      var mask = (0xFF >> (8 - toRead)) << bitsToNotRead;
      result = (bytes[this.byteOffset] & mask) >> bitsToNotRead;
      numBits -= toRead;
      this.bitOffset += toRead;
      if (this.bitOffset == 8) {
        this.bitOffset = 0;
        this.byteOffset++;
      }
    }

    // Next read whole bytes
    if (numBits > 0) {
      while (numBits >= 8) {
        result = (result << 8) | (bytes[this.byteOffset] & 0xFF);
        this.byteOffset++;
        numBits -= 8;
      }

      // Finally read a partial byte
      if (numBits > 0) {
        var bitsToNotRead = 8 - numBits;
        var mask = (0xFF >> bitsToNotRead) << bitsToNotRead;
        result = (result << numBits) | ((bytes[byteOffset] & mask) >> bitsToNotRead);
        this.bitOffset += numBits;
      }
    }

    return result;
  }

  /**
   * @return number of bits that can be read successfully
   */
  this.available = function() {
    return 8 * (bytes.length - this.byteOffset) - this.bitOffset;
  }

    this.bytes = bytes;
    this.bitOffset = 0;
    this.byteOffset = 0;
}
