/*
 * Copyright 2008 ZXing authors
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

var BitSource = require('./dm_bitsource.js');

function StringBuilder() {
    this.str = '';
  
    this.append = function(s) {
        if(typeof s === 'number') {
            this.str += String.fromCharCode(s);
        } else {
            this.str += s;
        }
    }
    this.toString = function() {
        return this.str;
    }
    this.length = function() {
        return this.str.length;
    }
}

/**
 * <p>Data Matrix Codes can encode text as bits in one of several modes, and can use multiple modes
 * in one Data Matrix Code. This class decodes the bits back into text.</p>
 *
 * <p>See ISO 16022:2006, 5.2.1 - 5.2.9.2</p>
 *
 * @author bbrown@google.com (Brian Brown)
 * @author Sean Owen
 */
var DecodedBitStreamParser = module.exports = function() {


    var PAD_ENCODE = 0; // Not really a mode
    var ASCII_ENCODE = 1;
    var C40_ENCODE = 2;
    var TEXT_ENCODE = 3;
    var ANSIX12_ENCODE = 4;
    var EDIFACT_ENCODE = 5;
    var BASE256_ENCODE = 6;
    
    var Mode = {
        PAD_ENCODE: 0, // Not really a mode
        ASCII_ENCODE: 1,
        C40_ENCODE: 2,
        TEXT_ENCODE: 3,
        ANSIX12_ENCODE: 4,
        EDIFACT_ENCODE: 5,
        BASE256_ENCODE: 6
    };



  /**
   * See ISO 16022:2006, Annex C Table C.1
   * The C40 Basic Character Set (*'s used for placeholders for the shift values)
   */
    var C40_BASIC_SET_CHARS = [
    '*', '*', '*', ' ', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N',
    'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
  ];

  var C40_SHIFT2_SET_CHARS = [
    '!', '"', '#', '$', '%', '&', '\'', '(', ')', '*',  '+', ',', '-', '.',
    '/', ':', ';', '<', '=', '>', '?',  '@', '[', '\\', ']', '^', '_'
  ];

  /**
   * See ISO 16022:2006, Annex C Table C.2
   * The Text Basic Character Set (*'s used for placeholders for the shift values)
   */
    var TEXT_BASIC_SET_CHARS = [
    '*', '*', '*', ' ', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n',
    'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'
  ];

  // Shift 2 for Text is the same encoding as C40
    var TEXT_SHIFT2_SET_CHARS = C40_SHIFT2_SET_CHARS;

    var TEXT_SHIFT3_SET_CHARS = [
    '`', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N',
    'O',  'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '{', '|', '}', '~', String.fromCharCode(127)
  ];


  this.decode = function(bytes) {
    var bits = new BitSource(bytes);
    var result = new StringBuilder();
    var resultTrailer = new StringBuilder();
      var byteSegments = [];
//    List<byte[]> byteSegments = new ArrayList<>(1);
    var mode = ASCII_ENCODE;
    do {
      if (mode == ASCII_ENCODE) {
        mode = this.decodeAsciiSegment(bits, result, resultTrailer);
      } else {
        switch (mode) {
          case C40_ENCODE:
            throw new Error("C40 segment decoding not implemented");
//            this.decodeC40Segment(bits, result);
            break;
          case TEXT_ENCODE:
            throw new Error("Text segment decoding not implemented");
//            this.decodeTextSegment(bits, result);
            break;
          case ANSIX12_ENCODE:
            throw new Error("AnsiX12 segment decoding not implemented");
//            this.decodeAnsiX12Segment(bits, result);
            break;
          case EDIFACT_ENCODE:
            throw new Error("Edifact segment decoding not implemented");
//            this.decodeEdifactSegment(bits, result);
            break;
          case BASE256_ENCODE:
            throw new Error("Base256 segment decoding not implemented");
//            this.decodeBase256Segment(bits, result, byteSegments);
            break;
          default:
            throw new Error("format exception");
        }
        mode = ASCII_ENCODE;
      }
    } while (mode != PAD_ENCODE && bits.available() > 0);
    if (resultTrailer.length() > 0) {
      result.append(resultTrailer);
    }

      return result.toString();
//    return new DecoderResult(bytes, result.toString(), byteSegments.isEmpty() ? null : byteSegments, null);
  }

  /**
   * See ISO 16022:2006, 5.2.3 and Annex C, Table C.2
   */
  this.decodeAsciiSegment = function(bits, result, resultTrailer) {
    var upperShift = false;
    do {
      var oneByte = bits.readBits(8);
      if (oneByte == 0) {
        throw new Error("format exception");
      } else if (oneByte <= 128) {  // ASCII data (ASCII value + 1)
        if (upperShift) {
          oneByte += 128;
          //upperShift = false;
        }
        result.append(oneByte - 1);
        return Mode.ASCII_ENCODE;
      } else if (oneByte == 129) {  // Pad
        return Mode.PAD_ENCODE;
      } else if (oneByte <= 229) {  // 2-digit data 00-99 (Numeric Value + 130)
        var value = oneByte - 130;
        if (value < 10) { // pad with '0' for single digit values
          result.append('0');
        }
        result.append(value.toString());
      } else if (oneByte == 230) {  // Latch to C40 encodation
        return Mode.C40_ENCODE;
      } else if (oneByte == 231) {  // Latch to Base 256 encodation
        return Mode.BASE256_ENCODE;
      } else if (oneByte == 232) {
        // FNC1
        result.append(String.fromCharCode(29)); // translate as ASCII 29
      } else if (oneByte == 233 || oneByte == 234) {
        // Structured Append, Reader Programming
        // Ignore these symbols for now
        //throw ReaderException.getInstance();
      } else if (oneByte == 235) {  // Upper Shift (shift to Extended ASCII)
        upperShift = true;
      } else if (oneByte == 236) {  // 05 Macro
        result.append("[)>\u001E05\u001D");
        resultTrailer.insert(0, "\u001E\u0004");
      } else if (oneByte == 237) {  // 06 Macro
        result.append("[)>\u001E06\u001D");
        resultTrailer.insert(0, "\u001E\u0004");
      } else if (oneByte == 238) {  // Latch to ANSI X12 encodation
        return Mode.ANSIX12_ENCODE;
      } else if (oneByte == 239) {  // Latch to Text encodation
        return Mode.TEXT_ENCODE;
      } else if (oneByte == 240) {  // Latch to EDIFACT encodation
        return Mode.EDIFACT_ENCODE;
      } else if (oneByte == 241) {  // ECI Character
        // TODO(bbrown): I think we need to support ECI
        //throw ReaderException.getInstance();
        // Ignore this symbol for now
      } else if (oneByte >= 242) {  // Not to be used in ASCII encodation
        // ... but work around encoders that end with 254, latch back to ASCII
        if (oneByte != 254 || bits.available() != 0) {
          throw new Error("format exception");
        }
      }
    } while (bits.available() > 0);
    return Mode.ASCII_ENCODE;
  }

}
