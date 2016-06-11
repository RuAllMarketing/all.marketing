var statusesTranslation = require('./user-property-model.js').statusesTranslation;
var fs = require('fs');

function withUserPropertyList(userId, callback){
    db.query('SELECT * FROM property WHERE `owner_id` = ?', [userId], function(error, results, fields){
        if(error){
            return callback(null);
        }

        for(var i=0;i<results.length;i++){
            results[i].displayStatus = statusesTranslation[results[i].status];
        }

        callback(results);
    });
}

app.get('/list-user-property', function (req, res) {
    withUserByEmailAndPasswordHash(req.query.email, req.query.hash, function(user){
        if(user){
            withUserPropertyList(user.id, function(items){
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

                    res.end(JSON.stringify({data: items}));
                }else{
                    endResponseWithError(res, 'Error occured during getting list of items');
                }
            });
        }else{
            endResponseWithError(res, 'Error occured on authentication step');
        }
    });
});

function addUserProperty(ownerId, notFilteredData, callback){
    var dataToInsert = {
        town: notFilteredData.town,
        address: notFilteredData.address,
        rooms_count: notFilteredData.rooms_count,
        house_type: notFilteredData.house_type,
        floor: notFilteredData.floor,
        floors_count: notFilteredData.floors_count,
        area_size: notFilteredData.area_size,
        cadastral_id: notFilteredData.cadastral_id,
        description: notFilteredData.description,
        price: notFilteredData.price,
        status: 'waitingForApprovement',
        owner_id: ownerId
    };

    db.query('INSERT INTO property SET ?', dataToInsert, function(err, result) {
        callback(err, result);
    });
}

function moveImagesToPropertyFolder(propertyId, files){
    var targetDir = 'property-images/' + propertyId;

    fs.stat(targetDir, function(err){
        if(err){
            fs.mkdir(targetDir);
        }

        for (var i = 0; i < files.length; i++) {
            var ext = files[i]['original'].split('.').pop();
            fs.rename('uploads/' + files[i].name, targetDir + '/' + files[i].name + '.' + ext);
        }
    });
}

app.post('/add-user-property', function (req, res) {
    withUserByEmailAndPasswordHash(req.body.email, req.body.hash, function(user){
        if(user){
            validateFieldExistence(req, res, 'address', 'Пожалуйста введите адрес', function(){
                addUserProperty(user.id, req.body, function(err, result){
                    if(err){
                        endResponseWithError(res, 'Ошибка во время сохранения данных');
                    }else{

                        moveImagesToPropertyFolder(result.insertId, req.body.files);

                        successResponse(res);
                    }
                });
            });
        }else{
            endResponseWithError(res, 'Error occured on authentication step');
        }
    });
});

function withUserPropertyItem(userId, propertyId, callback){
    db.query('SELECT * FROM property WHERE `owner_id` = ? AND `id` = ?', [userId, propertyId], function(error, results, fields){
        if(error || results.length < 1){
            return callback(null);
        }

        callback(results[0]);
    });
}

function updateUserProperty(propertyId, notFilteredData, callback){
    var dataToUpdate = {
        town: notFilteredData.town,
        address: notFilteredData.address,
        rooms_count: notFilteredData.rooms_count,
        house_type: notFilteredData.house_type,
        floor: notFilteredData.floor,
        floors_count: notFilteredData.floors_count,
        area_size: notFilteredData.area_size,
        cadastral_id: notFilteredData.cadastral_id,
        description: notFilteredData.description,
        price: notFilteredData.price,
    };

    db.query('UPDATE property SET ? WHERE `id` = ?', [dataToUpdate, propertyId], function(err, result) {
        callback(err, result);
    });
}

app.post('/update-user-property', function (req, res) {
    withUserByEmailAndPasswordHash(req.body.email, req.body.hash, function(user){
        if(user){
            withUserPropertyItem(user.id, req.body.id, function(property){
                if(property){
                    if(property.status == 'approved'){
                        endResponseWithError(res, 'Already approved by administrator, cannot edit');
                    }else{
                        validateFieldExistence(req, res, 'address', 'Пожалуйста введите адрес', function(){
                            updateUserProperty(req.body.id, req.body, function(err, result){
                                moveImagesToPropertyFolder(req.body.id, req.body.files || []);
                                try{
                                    req.body.removeImages.forEach(function(item){
                                        var file = item.split('/').pop();
                                        if(fs.readdirSync('property-images/' + req.body.id).indexOf(file) != -1){
                                            fs.unlinkSync('property-images/' + req.body.id + '/' + file);
                                        }
                                    });
                                }catch(e){
                                }
                                successResponse(res);
                            });
                        });
                    }
                }else{
                    endResponseWithError(res, 'Element not found');
                }
            });
        }else{
            endResponseWithError(res, 'Error occured on authentication step');
        }
    });
});

function withTopPropertyList(callback){
    db.query('SELECT * FROM property WHERE status = \'approved\' ORDER BY publishing_time DESC LIMIT 0, 6', function(error, results, fields){
        if(error){
            return callback(null);
        }

        for(var i=0;i<results.length;i++){
            results[i].displayStatus = statusesTranslation[results[i].status];
            delete results[i].cadastral_id;
        }

        callback(results);
    });
}

app.get('/top-property-list', function (req, res) {
    withTopPropertyList(function(items){
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
    });
});

