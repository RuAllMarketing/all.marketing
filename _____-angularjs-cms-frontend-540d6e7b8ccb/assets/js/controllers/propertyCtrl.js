'use strict';
/**
 * controllers for dynamic table
 * Remove/delete a table row dynamically 
 */

function initializeFileUploader($scope, FileUploader) {
    var uploaderImages = $scope.uploaderImages = new FileUploader({
        url: $scope.$root.ajaxUrls['upload-property-images']
    });

    // FILTERS

    uploaderImages.filters.push({
        name: 'imageFilter',
        fn: function (item/*{File|FileLikeObject}*/, options) {
            var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
            return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
        }
    });

    // CALLBACKS

    uploaderImages.onCompleteItem = function (fileItem, response, status, headers) {
        fileItem.uploadedFileName = response.files[0];
    };

    uploaderImages.onAfterCompleteAll = function(){};
    uploaderImages.onCompleteAll = function () {
        $scope.property.files = [];

        for (var i = 0; i < uploaderImages.queue.length; i++) {
            $scope.property.files.push(uploaderImages.queue[i].uploadedFileName);
        }

        uploaderImages.onAfterCompleteAll();
    };
}

app.controller("propertyCtrl", ['$scope', 'FileUploader', function ($scope, FileUploader) {
    initializeFileUploader($scope, FileUploader);

    $scope.items = [];
    $scope.property = {};
    $scope.listingData = true;
    $scope.editingData = false;
    $scope.errorMessage = false;

    $scope.updateRows = function(){
        $.get($scope.$root.ajaxUrls['list-user-property'], { email: $scope.$root.user.email, hash: $scope.$root.user.password }, function(response){
            response = JSON.parse(response);
            if(response.data){
                $scope.items = response.data;
            }
        });
    };
    $scope.updateRows();

    $scope.addRow = function () {
        if($scope.uploaderImages.getNotUploadedItems().length){
            $scope.uploaderImages.onAfterCompleteAll = function(){
                $scope.addRowAfterUploading();
            }

            $scope.uploaderImages.uploadAll();
        }else{
            $scope.addRowAfterUploading();
        }
    };
    $scope.addRowAfterUploading = function() {
        var postData = jQuery.extend($scope.property, { email: $scope.$root.user.email, hash: $scope.$root.user.password });
        $.post($scope.$root.ajaxUrls['add-user-property'], postData, function(response){
            response = JSON.parse(response);

            if(response.status == 'ok'){
                $scope.displayList();
                $scope.$apply();
            }else{
                $scope.errorMessage = response.error;
                $scope.$apply();
            }
        });
    };

    $scope.editRow = function () {
        if($scope.uploaderImages.getNotUploadedItems().length){
            $scope.uploaderImages.onAfterCompleteAll = function(){
                $scope.editRowAfterUploading();
            }

            $scope.uploaderImages.uploadAll();
        }else{
            $scope.editRowAfterUploading();
        }
    };

    $scope.editRowAfterUploading = function () {
        var postData = jQuery.extend($scope.property, { email: $scope.$root.user.email, hash: $scope.$root.user.password });
        $.post($scope.$root.ajaxUrls['update-user-property'], postData, function(response){
            response = JSON.parse(response);

            if(response.status == 'ok'){
                $scope.displayList();
                $scope.$apply();
            }else{
                $scope.errorMessage = response.error;
                $scope.$apply();
            }
        });
    };

    $scope.displayList = function(){
        $scope.listingData = true;
        $scope.editingData = false;
        $scope.uploaderImages.queue = [];

        $scope.updateRows();
    };

    $scope.showAddForm = function(){
        $scope.listingData = false;
        $scope.editingData = false;
        $scope.property = {};
        $scope.errorMessage = false;
    };

    $scope.showEditForm = function(index){
        $scope.listingData = false;
        $scope.editingData = true;
        $scope.errorMessage = false;
        $scope.property = $scope.items[index];

        for(var i in $scope.property){
            if(i == 'images'){
                continue;
            }

            if($scope.property[i]){
                $scope.property[i] = $scope.property[i].toString();
            }
        }
    };

    $scope.removeImageOnEditForm = function(image){
        if(!$scope.property.removeImages){
            $scope.property.removeImages = [];
        }

        $scope.property.removeImages.push(image); 
        $scope.property.images.splice($scope.property.images.indexOf(image), 1);
    };
}]);
