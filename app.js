var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
const { keycloak, session} = require('./kc.js');
const { default: KeycloakAdminClient } = require("keycloak-admin");
var log = require('morgan');
var log4js = require("log4js");
var logger = log4js.getLogger();
logger.level = process.env.LOGGER_LEVEL; 

const{admin: adminRouter, user:userRouter, post:postRouter} = require('./routes');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(log('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session);
app.use(keycloak.middleware());

app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/user', userRouter);
app.use('/api/v1/post', postRouter);

//user login 
app.post('/api/v1/login', (req,res)=> {
  const {username, password} = req.body; 

  return keycloak.grantManager.obtainDirectly(username,password).then(grant => {
    console.log(grant);
        //keycloak.storeGrant(grant, req, res);
      return res.json({access_token:grant.access_token.token})
  }).catch(err => {
    logger.error(err);
    return res.status(500).json({error: 'error occured'});
  })
});

const adminClient = new KeycloakAdminClient(); 

//user registration 
app.post('/api/v1/register', async (req,res)=> {
  //this.adminClient = new kcAdminClient();
  const{username, email, roleName, password} = req.body; 
  //const user = await this.adminClient.users.find({username}); 
    try{
      await adminClient.auth({
        username: 'admin',
        password: 'admin',
        grantType: 'password',
        clientId: 'admin-cli',
      });
      adminClient.setConfig({
        realmName: 'mock-medium',
      });
      const newUser = await adminClient.users.create({
        username: username, 
        email: email,
        //realmRoles:role,
        enabled:true
      });
  
      const user = await adminClient.users.findOne({id: newUser.id});
      await adminClient.users.resetPassword({
        id: user.id,
        credential: {
          temporary: false, 
          type: 'password', 
          value: password,
        },
      });

      const role = await adminClient.roles.findOneByName({name: roleName});
      await adminClient.users.addRealmRoleMappings({
        id: user.id, 
        roles:
        [
          {
            id: role.id,
            name: role.name,
          },
        ],
      });
      const clients = await adminClient.clients.find({});
      //console.log(r)
      await adminClient.users.addClientRoleMappings({
        id: user.id,
        clientUniqueId: 'f387830e-4aee-46a1-b66a-733403bccfb2',
        roles: [
          {
            id: role.id,
            name: role.name,
          },
        ],
      });
      return res.json(user);
    } catch(err){
      logger.error(err);
      return res.status(400).json();
    }

});

app.get('/', (req, res) => {
  res.json({status:"Mock-medium server is running"});
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
