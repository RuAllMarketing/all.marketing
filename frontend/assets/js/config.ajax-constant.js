'use strict';

/**
 * Config constant
 */
app.constant('AJAX_URLS', {
    'user-register': 'http://localhost:8080/register-user',
    'user-activate': 'http://localhost:8080/activate-user/%hash%',
    'user-login':  'http://localhost:8080/user-login',
    'list-user-property':  'http://localhost:8080/list-user-property',
    'add-user-property':  'http://localhost:8080/add-user-property',
    'update-user-property':  'http://localhost:8080/update-user-property',
    'upload-property-images':  'http://localhost:8080/upload-images-for-property',
    'list-top-property':  'http://localhost:8080/top-property-list'
});

