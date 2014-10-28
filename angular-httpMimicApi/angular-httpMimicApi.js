
(function(window, angular, undefined) {'use strict';

  var ngHttpMimicApi = angular.module('ngHttpMimicApi', []);

  ngHttpMimicApi.factory('$httpMimicApi', ['$http', '$location', '$q', function($http, $location, $q) {


    var $_collections = {};

    var factoryFunctions = {};


    factoryFunctions.init = function(collectionsArray) {

      var responseObject = {
        'message': 'httpMimicApi: '
      };

      var deferred = $q.defer();
      var promise = deferred.promise;

      if(collectionsArray === undefined) {

        deferred.reject(responseObject.message += 'no collections given on initiation.');

      } else {

        var collections = [];

        if(!angular.isArray(collectionsArray)) {
          collections.push(collectionsArray);
        } else {
          collections = collectionsArray;
        }

        var httpCalls = [];

        angular.forEach(collections, function(collection) {
          httpCalls.push($http.get(collection.url).success(function(data, status, headers, config) {
            $_collections[collection.name] = data;
          }));
        });

        $q.all(httpCalls).then(
          function(results) {
            deferred.resolve($_collections) 
          },
          function(errors) {
            deferred.reject(errors);
          }
        );

      }

      promise.success = function(fn) {
        promise.then(fn);
        return promise;
      }

      promise.error = function(fn) {
        promise.then(null, fn);
        return promise;
      }

      return promise;

    }


    factoryFunctions.process = function(method, resource, data) {

      var location = $location.protocol() + '://' + $location.host() + ':' + $location.port();

      var responseError = false;
      var responseObject = {
        'message': 'httpMimicApi: '
      };

      var collectionId = {};
      var collectionObjects = {};
      var collectionObjectKey = null;

      var objectId = 0;
      var objectDataObject = {};

      var resourceArray = [];

      if(resource === undefined && resource.length <= 1) {

        console.error('GET ' + location + url + ' 404 (Not Found)');
        responseObject.message += 'Resource not given';

      } else {

        resourceArray = resource.substr(1).split('/');

        if(resourceArray.length >= 1) {

          collectionId = resourceArray[0];

          if(collectionId === undefined || $_collections[collectionId] === undefined) {
            console.error('GET ' + location + resource + ' 404 (Not Found)');
            responseError = true;
            responseObject.message += 'Resource not found';
          } else {
            collectionObjects = $_collections[collectionId];
          }

          if(responseError !== true) {

            if(resourceArray.length === 2) {

              objectId = ''+resourceArray[1];

              for (var i = 0; i < collectionObjects[collectionId].length; i++) {
                if(collectionObjects[collectionId][i].id === objectId) {
                  collectionObjectKey = i;
                }
              }

            }

            switch(method) {

              case 'DELETE':

                if(resourceArray.length === 2 && collectionObjectKey !== null) {
                  $_collections[collectionId][collectionId].splice(collectionObjectKey, 1);
                  responseObject.message += 'Object deleted';
                }

                break;

              case 'GET':

                if(resourceArray.length === 1) {
                  responseObject = collectionObjects;
                } else if(resourceArray.length === 2) {
                  responseObject[collectionId] = collectionObjects[collectionId][collectionObjectKey];
                }

                break;

              case 'POST':

                var nextObjectId = 0;

                for (var i = 0; i < collectionObjects[collectionId].length; i++) {
                  if (collectionObjects[collectionId][i].id > nextObjectId) {
                    nextObjectId = collectionObjects[collectionId][i].id;
                  }
                }

                objectDataObject = data;
                objectDataObject.id = nextObjectId;

                $_collections[collectionId][collectionId].push(objectDataObject);
                responseObject[collectionId] = objectDataObject;

                break;

              case 'PUT':

                objectDataObject = data;

                if(resourceArray.length === 2 && collectionObjectKey !== null) {
                  $_collections[collectionId][collectionId][collectionObjectKey] = objectDataObject;
                  responseObject[collectionId] = objectDataObject;
                }

                break;

            }
          }
        }

      }


      /* Create promise and return responseObject */

      var deferred = $q.defer();
      var promise = deferred.promise;

      if(responseError === true) {
        deferred.reject(responseObject);
      }

      if(responseError === false && responseObject !== null) {
        deferred.resolve(responseObject);
      }

      promise.success = function(fn) {
        promise.then(fn);
        return promise;
      }

      promise.error = function(fn) {
        promise.then(null, fn);
        return promise;
      }

      return promise;

    }


    /* HTTP wrapper functions */

    factoryFunctions.get = function(resource) {
      return factoryFunctions.process('GET', resource);
    }

    factoryFunctions.delete = function(resource) {
      return factoryFunctions.process('DELETE', resource);
    }

    factoryFunctions.post = function(resource, data) {
      return factoryFunctions.process('POST', resource, data);
    }

    factoryFunctions.put = function(resource, data) {
      return factoryFunctions.process('PUT', resource, data);
    }


    return factoryFunctions;


  }]);


})(window, window.angular);