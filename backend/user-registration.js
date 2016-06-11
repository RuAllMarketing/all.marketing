function registerUser(req){
    var dataToInsert = {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        password: md5(req.body.password),
        active: false,
        activation_hash: md5(req.body.name + req.body.email + req.body.phone + req.body.password + timestamp())
    };

    function sendConfirmLinkEmail(destAddress, activationHash){
        var link = config.emailConfirmLink.replace('%hash%', activationHash);
        var text = 'Здравствуйте, вы были зарегистрированы на сайте ' 
                 + config.siteName 
                 + ', чтобы подтвердить регистрацию перейдите по ссылке <a href="'
                 + link + '">' + link + '</a>';

        var mailOptions = {
            from: config.smtpFrom, // sender address
            to: destAddress, // list of receivers
            subject: 'Регистрация на сайте ' + config.siteName, // Subject line
            text: text, // plaintext body
            html: text// html body
        };

        mailTransporter.sendMail(mailOptions, function(error, info){
            if(error){
                throw error;
            }
            console.log('Message sent: ' + info.response);
        });
    }

    try{
        db.query('INSERT INTO users SET ?', dataToInsert, function(err, result) {
            if (err) throw err;

            console.log(result.insertId, 'Confirmation hash is', dataToInsert.activation_hash);
            sendConfirmLinkEmail(dataToInsert.email, dataToInsert.activation_hash);
        });

        return true;
    }catch(e){
        return false;
    }
}

app.post('/register-user', function (req, res) {
    validateFieldExistence(req, res, 'name',  'Пожалуйста введите имя', function(){
        validateFieldExistence(req, res, 'email', 'Пожалуйста введите email', function(){
            validateFieldExistence(req, res, 'phone', 'Пожалуйста введите номер телефона', function(){
                validateFieldExistence(req, res, 'password', 'Пожалуйста введите пароль', function(){
                    validateFieldExistence(req, res, 'password_again', 'Пожалуйста введите повтор пароля', function(){
                        if(!req.body.agree || req.body.agree != 'true'){
                            return endResponseWithError(res,  'Пожалуйста подтвердите свое согласие на регистрацию');
                        }

                        if(req.body.password == req.body.password_again){
                            if(registerUser(req)){
                                successResponse(res);
                            }else{
                                endResponseWithError(res, 'Неизвестная ошибка');
                            }
                        }else{
                            endResponseWithError(res, 'Пароль и повтор пароля должны совпадать');
                        }
                    });
                });
            });
        });
    });
});

