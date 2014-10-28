
(function(window, angular, undefined) {'use strict';

  var ngHttpMimicAccount = angular.module('ngHttpMimicAccount', []);

  ngHttpMimicAccount.factory('$httpMimicAccount', ['$q', function($q) {


    var $_accounts = [];
    var $_nextAccountId = 0;

    var factoryFunctions = {};


    factoryFunctions.importUsers = function(usersObject) {

      var responseError = false;
      var responseObject = {
        'message': 'httpMimicAccount: '
      };

      if(usersObject !== undefined && usersObject.length > 0) {

        $_accounts = usersObject;

        for (var i = 0; i < $_accounts.length; i++) {
          if ($_accounts[i].id > $_nextAccountId) {
            $_nextAccountId = $_accounts[i].id;
          }
        }

        $_nextAccountId++;

        for (var i = 0; i < $_accounts.length; i++) {
          $_accounts[i].authToken = '';
        }

       responseObject = $_accounts;

      };

      return factoryFunctions.promiseWrapper(responseObject, responseError);

    }


    factoryFunctions.process = function(resource, data) {

      var responseError = false;
      var responseObject = {
        'message': 'httpMimicAccount: '
      };

      var account = null;

      var resourceArray = [];

      if(resource === undefined && resource.length <= 1) {

        console.error('GET ' + location + url + ' 404 (Not Found)');
        errorObject = 'Resource not given';

      } else {

        resourceArray = resource.substr(1).split('/');

        if(resourceArray.length >= 1) {

          switch(resourceArray[0]) {

            case 'signin':

              for (var i = 0; i < $_accounts.length; i++) {
                if($_accounts[i].emailAddress === data.emailAddress) {

                  if($_accounts[i].authToken !== '') {
                    responseError = true;
                    responseObject.message += 'User already signed in';
                  }

                  $_accounts[i].authToken = factoryFunctions.generateUUID();
                  account = $_accounts[i];

                }
              }

              if(account === null) {
                responseError = true;
                responseObject.message += 'Email address not found.';
              } else {
                responseObject = account;
              }

              break;

            case 'register':

              for (var i = 0; i < $_accounts.length; i++) {
                if($_accounts[i].emailAddress === data.emailAddress) {
                  responseError = true;
                  responseObject.message += 'Email address already being used.';
                }
              }

              if(responseError === false) {

                account = {
                  'id': $_nextAccountId++,
                  'emailAddress': data.emailAddress,
                  'password': 'passw0rd',
                  'authToken': factoryFunctions.generateUUID()
                }

                $_accounts.push(account);

                responseObject = account;

              }

              break;

            case 'signout':

              for (var i = 0; i < $_accounts.length; i++) {
                if($_accounts[i].id === data.id) {

                  if($_accounts[i].authToken === data.token) {
                    $_accounts[i].authToken = '';
                    responseObject.message += 'User signed out.';
                  } else {
                    responseError = true;
                    responseObject.message += 'User is not signed in.';
                  }

                }
              }

              break;

            case 'accounts':
              responseObject = $_accounts;

              break;

            default:

              responseError = true;
              responseObject.message += 'resource not found (404)';

          }

        }

      }

      return factoryFunctions.promiseWrapper(responseObject, responseError);

    };


    factoryFunctions.promiseWrapper = function(responseObject, responseError) {

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

    factoryFunctions.post = function(resource, data) {
      return factoryFunctions.process(resource, data);
    }


    /* UUID Generator - http://stackoverflow.com/a/8809472 */

    factoryFunctions.generateUUID = function() {

      var d = new Date().getTime();

      var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x7|0x8)).toString(16);
      });

      return uuid;

    }


    return factoryFunctions;


  }]);


})(window, window.angular);