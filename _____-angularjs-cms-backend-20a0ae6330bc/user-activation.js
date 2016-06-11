
function activateUser(userId, callback){
    db.query('UPDATE users SET `active` = ? WHERE id = ?', [true, userId], function(error, results, fields){
        callback();
    });
}

function withUserByHash(hash, callback){
    db.query('SELECT * FROM users WHERE `activation_hash` = ?', [hash], function(error, results, fields){
        if(results.length > 0){
            callback(results[0]);
        }else{
            callback(null);
        }
    });
}

app.get('/activate-user/*', function (req, res) {
    var hash = req.params[0];
    withUserByHash(hash, function(user){
        if(!user){
            return endResponseWithError(res, 'Can\'t find user');
        }

        activateUser(user.id, function(){
            res.end(JSON.stringify({'status': 'ok', 'name': user.name, 'email': user.email, 'password': user.password}));
        });
    });
});

