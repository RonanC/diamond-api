// controller module with scope and http components
// http component will consume the REST service at /greeting
// if succesful the json data returned will be assigned to the data variable
// $scope.greeting is a model object (we can bind this to the html)


function Default($scope, $http) {
    $http.get('http://localhost:8000/').
        success(function(data) {
            $scope.diamond = data;
        });
}

function GetId($scope, $http) {
    $http.get('http://localhost:8000/').
        success(function(data) {
            $scope.diamond = data;
        });
}
