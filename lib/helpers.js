/**
 * Public: test function to filter out malformed packets
 *
 * Parameters:
 *
 *   fragments - Array of packet data (e.g. [ 'This is a ugly text entry', 'i' ])
 *
 * Returns true for a valid packet and false otherwise
 */
function is_valid_packet(fragments) {

    // test for existing metrics type
    if (fragments[0] === undefined) {
        return false;
    }

   switch (fragments[0]) {
    case "debug":
        return true;
    case "info": 
        return true;
    case "notice": 
        return true;
    case "warning": 
        return true;
    case "err": 
        return true;
    case "crit": 
        return true;
    case "alert": 
        return true;
    case "emerg": 
        return true;
    }

    return false;
}

exports.is_valid_packet = is_valid_packet;
