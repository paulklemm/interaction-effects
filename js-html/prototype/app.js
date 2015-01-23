(function() {
var app = angular.module('cube', ['flow']);

// Constructor Code
app.run(function($rootScope, $http) {
  // Load the file containing all servers
  $http.get('config.json')
    .then(function(result){
      // Create rSessions Array
      $rootScope.rSessions = [];
      // and fill it with new Server connections
      result.data.servers.forEach(function(server){
        $rootScope.rSessions.push(new RCUBE.RSession(server.url, server.name));
      });
      // $rootScope.dataset = new RCUBE.Dataset(result.data.dataURL);
    });
});

app.config(['flowFactoryProvider', function (flowFactoryProvider) {
  flowFactoryProvider.defaults = {
    target: '/upload',
    // Test Chunks looks for already uploaded chunks before
    // uploading them again. This may be suitable for large data sets
    testChunks: true,
    permanentErrors:[404, 500, 501]
  };
  // You can also set default events:
  flowFactoryProvider.on('catchAll', function (event) {
    // Uncomment to see all Flow Events
    console.log('catchAll', arguments);
  });
  // Can be used with different implementations of Flow.js
  // flowFactoryProvider.factory = fustyFlowFactory;
}]);

app.directive('fileUpload', function(){
  return {
    restrict: 'E',
    templateUrl: 'directives/file-upload.html',
    controller: function($scope){
      this.visible = true;
      this.uploadEnabled = false;
      // Has to be defined on the Scope, because `input`s don't have an angular change event
      // See https://stackoverflow.com/questions/17922557/angularjs-how-to-check-for-changes-in-file-input-fields
      uploader = this;
      $scope.fileNameChanged = function(){
        uploader.uploadEnabled = true;
      };

      $scope.uploader = {};
      this.upload = function() {
        $scope.uploader.flow.upload();
      };
      $scope.uploader.controllerFn = function ($flow, $file, $message) {
        console.log($file);
        console.log($flow);
        console.log($message);
      }
    },
    controllerAs: 'myUploader'
  };
});

app.factory('CreateHeatmap', function() {

  // # http://markdalgleish.com/2013/06/using-promises-in-angularjs-views/
  var createHeatmap = function(callback) {
    myRSession = new RCUBE.RSession("http://localhost:1226/ocpu");
    var start = new Date().getTime();
    myRSession.loadDataset("/Users/paul/Desktop/patients-100k.csv", function(session){
      myRSession.calculateRSquaredValues(myRSession._datasetSession, function(_session){
        var end = new Date();
        var time = (end.getTime() - start) / (1000);
        console.log("[" + end.getHours() + ":" + end.getMinutes() + ":" + end.getSeconds() + "] Execution time " + ": " + time + " seconds");
        $.getJSON(myRSession._rSquaredSession.loc + "R/.val/json" , function(data){
          myRSession._rSquaredJSON = data;
          myJSON = data;
          // Test: Create RSquared Values
          var rSquared = data;
          var names = ["gender","age","diab","hypertension","stroke","chd","smoking","bmi"];
          myHeatmap = new RCUBE.Heatmap(".my-heatmap", rSquared, names);
          callback(myHeatmap);
        });
      });
    });
  };
  return {
    createHeatmap: createHeatmap
  };
});

app.controller("HeatmapController", function($scope, CreateHeatmap){
  var heatmap = this;
  // http://jimhoskins.com/2012/12/17/angularjs-and-apply.html
  // CreateHeatmap.createHeatmap(function(heatmapVis) {
  //   $scope.$apply(heatmap.visible = true);
  //   $scope.heatmapVis = heatmapVis;
  // });
});

})();
