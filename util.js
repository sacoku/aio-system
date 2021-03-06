/** @description
 *
 * @param n
 * @param size
 * @returns {string}
 */
function toHexStr(n, size) {
    let s = n.toString(16);
    while (s.length < (size || 2)) {s = "0" + s;}
    return s;
}

function toDecStr(n, size) {
    let s = n.toString(10);
    while (s.length < (size || 2)) {s = "0" + s;}
    return s;
}

exports.toHexStr = toHexStr;
exports.toDecStr = toDecStr;

/** @description
 *
 * @param bytes
 * @returns {string}
 */
exports.getGreenDetectCount = function(bytes) {
    let count = bytes[2] << 8;
    count |= bytes[3];
    return count.toString();
}

/** @description
 *
 * @param bytes
 * @returns {string}
 */
exports.getRedDetectCount = function(bytes) {
    let count = bytes[4] << 8;
    count |= bytes[5];
    return count.toString();
}

/** @description
 *
 * @param bytes
 * @returns {string}
 */
exports.getGreenBICount = function(bytes) {
    let count = bytes[6] << 8;
    count |= bytes[7];
    return count.toString();
}

/** @description
 *
 * @param bytes
 * @returns {string}
 */
exports.getRFSignalCount = function(bytes) {
    let count = bytes[8] << 8;
    count |= bytes[9];
    return count.toString();
}

/////////////////////////////////////////////////

/** @description
 *
 * @param bytes
 * @returns {string}
 */
exports.getLatitude = function(bytes) {
    let maxEastPosition = 8388607; // 2^23 - 1
    let maxWestPosition = 8388608; // -2^23

    let latitude = bytes[8] << 16;
    latitude |= bytes[9] << 8;
    latitude |= bytes[10];
    if(latitude >= 0) {
        latitude /= maxEastPosition;
        latitude *= 180;
    } else {
        latitude /= maxWestPosition;
        latitude *= 180;
    }

    return latitude.toFixed(8).toString();
}

/** @description
 *
 * @param bytes
 * @returns {string}
 */
exports.getLongitude = function(bytes) {
    let maxNorthPosition = 8388607;   // 2^23 - 1
    let maxSouthPosition = 8388608;   // -2^23

    let longitude = bytes[5] << 16;
    longitude |= bytes[6] << 8;
    longitude |= bytes[7];
    if(longitude >= 0) {
        longitude /= maxNorthPosition;
        longitude *= 90;
    } else {
        longitude /= maxSouthPosition;
        longitude *= 90;
    }

    return longitude.toFixed(8).toString();
}

/** @description
 *
 * @param bytes
 * @returns {string}
 */
exports.getVersion = function(bytes) {
    let version = bytes[11] << 8;
    version |= bytes[12];
    return version.toString();
}

/** @description
 *
 * @param args
 * @returns {string}
 */
exports.getControlData = function(args) {
    let data = "40";

    data += toHexStr(args.dw, 2);
    data += toHexStr(args.broad, 2);
    data += toHexStr(args.st, 2);
    data += toHexStr(args.et, 2);
    data += toHexStr(args.sv, 2);
    data += toHexStr(args.ev, 2);

    return data;
}

