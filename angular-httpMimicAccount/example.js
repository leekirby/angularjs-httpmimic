
  /* Not tested!! */

  angular.module('example', ['ngHttpMimicAccount'])

    .run(function($httpMimicAccount) {

      var userArray = [
        {
          'id': 1,
          'emailAddress': 'test1@domainname.com'
        },
        {
          'id': 2,
          'emailAddress': 'test2@domainname.com'
        },
        {
          'id': 3,
          'emailAddress': 'test2@domainname.com'
        }
      ];

      $httpMimicAccount.importUsers(userArray).success(function(responseData) {
        $rootScope.accounts = responseData;
      });

    })

    .controller('AccountsCtrl', function($httpMimicAccount, $rootScope, $scope) {

      $scope.accountRegister = function() {

        if($scope.account !== undefined && $scope.account.emailAddress !== undefined) {

          var accountObject = {
            'emailAddress': $scope.account.emailAddress
          }

          $httpMimicAccount.post('/register', accountObject).success(function(responseData) {
            $rootScope.error = null;
          }).error(function(responseData) {
            $rootScope.error = responseData.message;
          });

        } else {

          $rootScope.error = 'Email address is not valid';

        }


      }

      $scope.accountSignIn = function() {

        if($scope.account !== undefined && $scope.account.emailAddress !== undefined) {

          var accountObject = {
            'emailAddress': $scope.account.emailAddress
          }

          $httpMimicAccount.post('/signin', accountObject).success(function(responseData) {
            $rootScope.error = null;
          }).error(function(responseData) {
            $rootScope.error = responseData.message;
          });

        } else {

          $rootScope.error = 'Email address is not valid';

        }

      }

      $scope.accountSignOut = function(id, token) {

        var accountObject = {
          'id': id,
          'token': token
        }

        $httpMimicAccount.post('/signout', accountObject).success(function(responseData) {
          $rootScope.error = null;
        }).error(function(responseData) {
          $rootScope.error = responseData.message;
        });

      }

    });
