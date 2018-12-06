exports.getGreenDetectCount = function(bytes) {
    var count = 0;

    count = bytes[2] << 8;
    count |= bytes[3];
    return count.toString();
}

exports.getRedDetectCount = function(bytes) {
    var count = 0;

    count = bytes[4] << 8;
    count |= bytes[5];
    return count.toString();
}

exports.getGreenBICount = function(bytes) {
    var count = 0;

    count = bytes[6] << 8;
    count |= bytes[7];
    return count.toString();
}

exports.getRFSignalCount = function(bytes) {
    var count = 0;

    count = bytes[8] << 8;
    count |= bytes[9];
    return count.toString();
}

/////////////////////////////////////////////////

exports.getLatitude = function(bytes) {
    var latitude = 0.0;
    var maxEastPosition = 8388607; // 2^23 - 1
    var maxWestPosition = 8388608; // -2^23

    latitude = bytes[8] << 16;
    latitude |= bytes[9] << 8;
    latitude |= bytes[10];
    if(latitude >= 0) {
        latitude /= maxEastPosition;
        latitude *= 180;
    } else {
        latitude /= maxWestPosition;
        latitude *= 180;
    }

    return latitude.toString();
}

exports.getLongitude = function(bytes) {
    var longitude = 0.0;
    var maxNorthPosition = 8388607;   // 2^23 - 1
    var maxSouthPosition = 8388608;   // -2^23


    longitude = bytes[5] << 16;
    longitude |= bytes[6] << 8;
    longitude |= bytes[7];
    if(longitude >= 0) {
        longitude /= maxNorthPosition;
        longitude *= 90;
    } else {
        longitude /= maxSouthPosition;
        longitude *= 90;
    }

    return longitude.toString();
}