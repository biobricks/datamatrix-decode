
A port of the DataMatrix 2D barcode decoding capability from ZXing to javascript. Uses some code from Lazar Laszlo's [jsqrcode](https://github.com/LazarSoft/jsqrcode).

This module does not include any of the detection / image recognition functionality. This module is what you use to extract the encoded data from a DataMatrix 2D barcode once you know the (boolean) value of each square/element in a barcode.

Currently only supports ASCII encoded data.

# Usage

See example.js

# Copyright and License

Copyright: 

* See [ZXing AUTHORS file as of August 18th 2016](https://github.com/zxing/zxing/blob/9cf93792d429ab397e5d52a9482b9f3308dd1de7/AUTHORS)
* Copyright Lazar Lazlo 2011-2016
* Copyright 2015-2016 BioBricks Foundation.

License: Apache License Version 2.0