module.exports.saveBook = function (connection, title, author, text, callback) {
    connection.collection('text').save({
        title: title,
        author: author,
        text: text
    }, callback);
};

module.exports.findBookByTitleCached = function (connection, redis, title, callback) {
    redis.get(title, function (err, reply) {
        if (err) callback(null);
        else if (reply) //Book exists in cache
        callback(JSON.parse(reply));
       
        else {
            console.log('from mongo')
            //Book doesn't exist in cache - we need to query the main database
            connection.collection('text').findOne({
                title: title
            }, function (err, doc) {
                if (err || !doc) callback(null);
                else {
                    redis.set(title, JSON.stringify(doc), function () {
                        callback(doc);
                    });
                }
            });
        }
    });
};