# keycloak-nodejs-configuration

This is a Node.js REST application with authentication and authorization using keycloak.

This applications has REST API to work with _customers_, _admins_ and _posts_. All endpoints are protected
based on permissions that are configured using Keycloak.

## Users
The  user role has register and login functionalities. Users can create posts, update posts, retrieve their "feed", the most recent 10 posts.

## Admins
The  admin role has register and login functionalities. Admins can delete any post and access all posts made. For the purpose of this implementation delete is only for the admin, but it should also be defined for the user role. 

## Posts
Posts are created and updated by users, deleted by admins, and accessed by both roles.


## Keycloak Configuration

### Download Keycloak
- Download the last version of Keycloak, extract and run keycloak server with `./standalone.sh` in the bin folder
- Open console at: http://localhost:8080/auth/admin/master/console/
- Create a realm in the server called mock-medium
- Create a client nodejs-microservice
    - Configure the access type to confidential, client protocol to openid-connect
    - Enable authorization and, service accounts, direct access grants
    - Create roles within this client (admin, user)
- Create roles within the realm (app_admin, app_user)
    - Enable composite roles and add corresponding client role (above step)

- Import the json file from your client to your program
    - Example 
   ```json
        {
            "realm": "mock-medium",
            "auth-server-url": "http://localhost:8080/auth/",
            "ssl-required": "external",
            "resource": "nodejs-microservice",
            "verify-token-audience": true,
            "credentials": {
              "secret": "XXXXXXX-XXXX-XXX...."
            },
            "use-resource-role-mappings": true,
            "confidential-port": 0,
            "policy-enforcer": {},
            "bearerOnly": "true"
        }
       ```