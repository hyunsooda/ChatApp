
angular.module('ResSvc').value('mongoLabApiKey','본인APIKEY')
  .factory('RscFac',['$resource','mongoLabApiKey', function($resource,mongoLabApiKey) {
    var UserRsc = $resource('https://api.mongolab.com/api/1/databases/hyunsoo/collections/WebChat/:userID?apiKey=:apiKey', {
        apiKey: mongoLabApiKey
      }, {
        'update': {
          method: 'PUT'
        }
      }
    );
    return UserRsc;
  }]);


