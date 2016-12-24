const mongo = require('mongodb');
const url = 'mongodb://localhost:27017/novel';
const _ = require('lodash');

module.exports = {
    init,
    repository
};

function init(entities) {
    const cnnc = mongo.MongoClient.connect(url, { db: { bufferMaxEntries: 0 } });
    return cnnc.then(db => {
        const repositories = {};
        entities.forEach(entity => {
            repositories[entity] = repository(db.collection(entity));
        });
        return repositories;
    });
}


function repository(collection) {
    const _collection = collection;
    return {
        insert: insert,
        update: update,
        remove: remove,
        get: get,
        getAll: getAll
    };

    function insert(document) {
        document.rev = 0;
        return _collection.insert(document);
    }

    function update(document) {
        // get current document
        return _collection.find({
            _id: document._id,
            deleted: { $exists: false }
        }, { 'revisions': 0 }).next().then(oldDoc => {
            console.log(`old rev: ${oldDoc.rev} | new rev: ${document.rev}`);
            if (oldDoc.rev > document.rev) {
                throw new Error(`The document ${document.title} has been updated by something else since you got this version.`);
            }
            const update = {
                $inc: { 'rev': 1 },
                $push: { revisions: { '$each': [oldDoc], '$slice': -10 } },
                $set: _.omit(document, ['_id', 'revisions', 'rev'])
            };
            return _collection.updateOne({ _id: document._id, deleted: { $exists: false } }, update).then(result => {
                if (result.matchedCount !== 1 || result.modifiedCount !== 1) {
                    throw new Error(`The document ${JSON.stringify(document)} may have been updated by something else since you got this version. Unexpected match or modified count: ${result}`);
                }
                return result;
            });
        });
    }

    function remove(id) {
        return _collection.updateOne({ _id: id }, { $set: { deleted: true } });
    }

    function get(id) {
        return _collection.find({ _id: id, deleted: { $exists: false } }, { revisions: 0 }).next();
    }

    function getAll() {
        return _collection.find({ deleted: { $exists: false } }, { revisions: 0 }).toArray();
    }
}