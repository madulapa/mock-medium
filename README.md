# keycloak-nodejs-example

This is a Node.js REST application with checking permissions using keycloak.

This applications has REST API to work with _customers_, _admins_ and _posts_. All endpoints are protected
based on permissions that are configured using Keycloak.

## Users
The  user role has register and login functionalities. Users can create posts, update posts, retrieve their "feed", the most recent 10 posts.

## Admins
The  admin role has register and login functionalities. Admins can delete any post and access all posts made. 

## Posts
Posts are created and updated by users, deleted by admins, and accessed by both roles.

The application will use a combination of _(resource, scope)_ to check a permission. 
We will configure Keycloak to use polices are based on roles. 
But for the application a combination of _(resource, scope)_ is important only.
We can configure Keycloak using something other than roles, without changing the application.


## Keycloak Configuration

### Download Keycloak

- Download the last version of Keycloak
- Create a realm in the server
- Create a client
    - Configure the access type to confidential, client protocol to openid-connect 
    - Valid redirect URI is http://localhost:8080/client-name/*
    - Enable authorization and, service accounts, direct access grants, and standard flow
    - Create roles within this client (admin, user)

- Create roles within the realm (app_admin, app_user)
    - Enable composite roles and add corresponding client role
- Import the json file from your client to your program
    - Ex. 
        {
            "realm": "mock-medium",
            "auth-server-url": "http://localhost:8080/auth/",
            "ssl-required": "external",
            "resource": "nodejs-microservice",
            "verify-token-audience": true,
            "credentials": {
            "secret": "7105348b-0059-474e-8b14-cd6a44ea4587"
            },
            "use-resource-role-mappings": true,
            "confidential-port": 0,
            "policy-enforcer": {},
            "bearerOnly": "true"
        }
- Run keycloak server with ./standalone.sh in the bin folder