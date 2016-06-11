var statusesTranslation = require('./user-property-model.js').statusesTranslation;
var fs = require('fs');

function withAdminByNameAndPasswordHash(name, passwordHash, callback){
    db.query('SELECT * FROM admins WHERE `username` = ? AND MD5(`password`) = ?', [name, passwordHash], function(error, results, fields){
        if(error || results.length < 1){
            return callback(null);
        }

        callback(results[0]);
    });
}

function withAllPropertyList(callback){
    db.query('SELECT property.*, users.phone as user_phone, users.email as user_email, users.name as user_name FROM property LEFT JOIN users ON users.id = property.owner_id ORDER BY property.id DESC', function(error, results, fields){
        if(error){
            return callback(null);
        }

        for(var i=0;i<results.length;i++){
            results[i].displayStatus = statusesTranslation[results[i].status];
        }

        callback(results);
    });
}

app.get('/list-all-property', function (req, res) {
    withAdminByNameAndPasswordHash(req.query.name, req.query.hash, function(user){
        if(user){
            withAllPropertyList(function(items){
                if(items){
                    for (var i = 0; i < items.length; i++) {
                        items[i].images = [];

                        try{
                            fs.readdirSync('property-images/' + items[i].id).forEach(function(item){
                                items[i].images.push('property-images/' + items[i].id + '/' + item);
                            });
                        }catch(e){
                        }
                    };

                    res.end(JSON.stringify({data: items}))
                }else{
                    endResponseWithError(res, 'Error occured during getting list of items');
                }
            });
        }else{
            endResponseWithError(res, 'Error occured on authentication step');
        }
    });
});

app.get('/delete-property', function (req, res) {
    withAdminByNameAndPasswordHash(req.query.name, req.query.hash, function(user){
        if(user){
            db.query('DELETE FROM property WHERE `id` = ?', [req.query.id], function(error, results, fields){
                successResponse(res);
            });
        }else{
            endResponseWithError(res, 'Error occured on authentication step');
        }
    });
});

app.get('/approve-property', function (req, res) {
    withAdminByNameAndPasswordHash(req.query.name, req.query.hash, function(user){
        if(user){
            db.query('UPDATE property SET `status` = ?, `publishing_time` = UNIX_TIMESTAMP() WHERE `id` = ?', ['approved', req.query.id], function(error, results, fields){
                successResponse(res);
            });
        }else{
            endResponseWithError(res, 'Error occured on authentication step');
        }
    });
});

app.get('/decline-property', function (req, res) {
    withAdminByNameAndPasswordHash(req.query.name, req.query.hash, function(user){
        if(user){
            db.query('UPDATE property SET status = ? WHERE `id` = ?', ['declined', req.query.id], function(error, results, fields){
                successResponse(res);
            });
        }else{
            endResponseWithError(res, 'Error occured on authentication step');
        }
    });
});
