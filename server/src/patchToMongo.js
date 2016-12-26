'use strict';

/**
 * Altered from https://github.com/stjosephcontent/jsonpatch-to-mongodb/blob/master/index.js.
 * to better match the spec: https://tools.ietf.org/html/rfc6902#page-4
 * @param patches - json patch array;
 * @param id - mongo object id
 * @param userContext - should be created by route, contains info about this user
 * @returns {{}} - mongodb updates
 */
module.exports = function(patches, id) {
    let result = {};
    let update = {};
    update.$pushAll = {};
    update.$pushAll['meta.patches'] = [];
    let currentTime = new Date().toISOString();
    let objectId = id;
    result.filter = { '_id': objectId };

    // Removing leading slash and convert remainder to dots
    let toDot = function(path) {
        return path.replace(/\//g, '.').replace(/^\./, '');
    };

    function setMetaData(p) {
        update.$set['meta.modifiedTime'] = currentTime;
        update.$pushAll['meta.patches'].push({ 'time': currentTime, 'patch': p });
    }

    patches.map(function(p) {
        switch (p.op) {
            case 'add': {
                let lastSegmentOfPath = p.path.substr(p.path.lastIndexOf('/') + 1);
                if (lastSegmentOfPath === '-' || !isNaN(parseInt(lastSegmentOfPath, 10))) {
                    let path = p.path.substr(0, p.path.lastIndexOf('/'));
                    if (!update.$push) {
                        update.$push = {};
                    }
                    if (!update.$set) {
                        update.$set = {};
                    }
                    if (!update.$push[toDot(path)]) {
                        update.$push[toDot(path)] = { $each: [] };
                    }
                    update.$push[toDot(path)].$each.push(p.value);
                } else {
                    if (!update.$set) {
                        update.$set = {};
                    }
                    update.$set[toDot(p.path)] = p.value;
                }
                setMetaData(p);
                break;
            }
            case 'remove':
                if (!update.$unset) {
                    update.$unset = {};
                }
                if (!update.$set) {
                    update.$set = {};
                }
                update.$unset[toDot(p.path)] = 1;
                setMetaData(p);
                break;
            case 'replace':
                if (!update.$set) {
                    update.$set = {};
                }
                update.$set[toDot(p.path)] = p.value;
                setMetaData(p);
                break;
            case 'test':
                result.filter[toDot(p.path)] = p.value;
                break;
            default:
                throw new Error('Unsupported Operation! op = ' + p.op);
        }
    });
    result.updates = update;
    return result;
};