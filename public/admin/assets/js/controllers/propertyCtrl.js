'use strict';
/**
 * controllers for dynamic table
 * Remove/delete a table row dynamically 
 */

app.controller("propertyCtrl", ['$scope', '$http', function ($scope, $http) {
    $scope.items = [];
    $scope.property = {};
    $scope.listingData = true;
    $scope.viewingData = false;
    $scope.errorMessage = 'test';

    $scope.updateRows = function(){
        $.get($scope.$root.ajaxUrls['admin-list-all-property'], { name: $scope.$root.user.name, hash: $scope.$root.user.hash }, function(response){
            response = JSON.parse(response);
            if(response.data){
                $scope.items = response.data;
                $scope.$apply();
            }
        });
    };
    $scope.updateRows();

    $scope.removeRow = function (id) {
        if(confirm('Уверены что хотите удалить обьявление ?')){
            $.get($scope.$root.ajaxUrls['admin-delete-property'], { name: $scope.$root.user.name, hash: $scope.$root.user.hash, id: id }, function(response){
                $scope.updateRows();
            });
        }
    };

    $scope.displayList = function(){
        $scope.listingData = true;
        $scope.viewingData = false;

        $scope.updateRows();
    };

    $scope.showPropertyForm = function(index){
        $scope.listingData = false;
        $scope.viewingData = true;
        $scope.errorMessage = false;
        $scope.property = $scope.items[index];
        $scope.property.display_house_type = {1: "кирпичный", 2: "панельный", 3: "Блочный", 4: "Монолитный", 5: "Деревянный"}[$scope.property.house_type]
        $scope.property.display_rooms_count = $scope.property.rooms_count;

        if($scope.property.display_rooms_count == 'studio'){
            $scope.property.display_rooms_count = 'Студия';
        }else if($scope.property.display_rooms_count == 'more_than_9'){
            $scope.property.display_rooms_count = '> 9';
        }
    };

    $scope.approveProperty = function (id) {
        $.get($scope.$root.ajaxUrls['admin-approve-property'], { name: $scope.$root.user.name, hash: $scope.$root.user.hash, id: id }, function(response){
            $scope.displayList();
        });
    };

    $scope.declineProperty = function (id) {
        $.get($scope.$root.ajaxUrls['admin-decline-property'], { name: $scope.$root.user.name, hash: $scope.$root.user.hash, id: id }, function(response){
            $scope.displayList();
        });
    };
}]);
