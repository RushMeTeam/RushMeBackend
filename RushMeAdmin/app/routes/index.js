/*
var  CognitoExpress = require("cognito-express"),
  AWS = require("aws-sdk"),
  AmazonCognitoIdentity = require('amazon-cognito-identity-js');
  const passport = require('passport');
const authURL = "https://auth.rushme.app/login?response_type=token&client_id=38cbnp857bmaspilo8km8aeod6&redirect_uri=https://127.0.0.1/in/dashboard";

// accessDynamoDB();
function accessDynamoDB() {
  try {
    if (cognitoUser != null) {
      cognitoUser.getSession(function(err, session) {
        if (err) {
          console.log(err);
          return;
        }

        console.log('session validity: ' + session.isValid());
        console.log('session token: ' + session.getIdToken().getJwtToken());

        AWS.config.region = 'us-east-1';
        AWS.config.credentials = new AWS.CognitoIdentityCredentials({
          IdentityPoolId : 'us-east-1_hp56TBp7o',
          Logins : {
            // Change the key below according to the specific region your user pool is in.
            "cognito-idp.us-east-1.amazonaws.com/us-east-1_hp56TBp7o" : session.getIdToken().getJwtToken()
          }
        });
        AWS.config.credentials.get(function(err){
          if (!err) {
            // Instantiate aws sdk service objects now that the credentials have been updated
            var docClient = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });
            var ddbTable = 'FraternityInfo';
            var params = {
              TableName: ddbTable
            };
            docClient.scan(params, function(err, data) {
              if (err) console.log(err);
              else console.log(data);
            });
          }
        });
      //   AWS.config.credentials.get(function(err) {
      //     if (!err) {
      //       var id = AWS.config.credentials.identityId;
      //       console.log('Cognito Identity ID '+ id);
      //
      //       // Instantiate aws sdk service objects now that the credentials have been updated
      //       var docClient = new AWS.DynamoDB.DocumentClient({ region: AWS.config.region });
      //       var params = {
      //         TableName: 'FraternityInfo',
      //         Item:{namekey:id}
      //       };
      //       docClient.put(params, function(err, data) {
      //         if (err)
  		// 	          console.error(err);
      //         else
  		// 	         console.log(data);
      //       });
      //     }
      //   });
      // });
    });
  } else {
      console.log("Cognito User is NULL");
      return;
    }
  } catch (e) {
    console.log(e);
    return;
  }
}

var poolData = {
  UserPoolId: "us-east-1_hp56TBp7o",
  ClientId: "4o9r7dvj3kiislsbh4cbhkf42",
};
// var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
*/
