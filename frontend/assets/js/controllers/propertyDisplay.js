'use strict';
/**
 * controllers for dynamic table
 * Remove/delete a table row dynamically 
 */

app.controller("propertyDisplay", ['$scope', '$uibModal', function ($scope, $uibModal) {
    $scope.property = {};
    $scope.items = [];
    $scope.updateRows = function(){
        $.getJSON($scope.$root.ajaxUrls['list-top-property'], function(response){
            if(response.data){
                $scope.items = response.data;
                $scope.firstRowItems = response.data.slice(0, 3);
                $scope.secondRowItems = response.data.slice(3, 6);
                $scope.$apply();
            }
        });
    };
    $scope.updateRows();
}]);
