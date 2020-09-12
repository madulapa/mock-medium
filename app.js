var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
const { default: KeycloakAdminClient } = require("keycloak-admin");
var log = require('morgan');
var log4js = require("log4js");
var logger = log4js.getLogger();
logger.level = process.env.LOGGER_LEVEL; 

const keycloak = require('./kc.js').init();

const{admin: adminRouter, user:userRouter, post:postRouter} = require('./routes');
var app = express();
app.use((req, res, next) => {
  req.headers.authorization = req.headers.authorization || '';
  return next();
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(log('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(/\/((?!login|register).)*/, keycloak.middleware());

app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/user', userRouter);
app.use('/api/v1/post', postRouter);

const adminClient = new KeycloakAdminClient(); 

(async function () {
  try {

    let authRes = await adminClient.auth({
      username: 'admin',
      password: 'admin',
      grantType: 'password',
      clientId: 'admin-cli',
    });

    adminClient.setConfig({
      realmName: 'mock-medium',
    });

    console.log('authRes', authRes);
  } catch (e) {
    console.log(e);
  }
})();

//user login 
app.post('/api/v1/login', (req,res)=> {
  const {username, password} = req.body; 

  return keycloak.grantManager.obtainDirectly(username,password).then(grant => {
    console.log(grant);
      return res.json({access_token:grant.access_token.token})
  }).catch(err => {
    logger.error(err);
    return res.status(500).json({error: 'error occured'});
  })
});



//user registration 
app.post('/api/v1/register', async (req,res)=> {
  const{username, email, roleName, password} = req.body; 
    try{
      const newUser = await adminClient.users.create({
        username: username, 
        email: email,
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
      return res.json(user);
    } catch(err){
      logger.error(err);
      return res.status(400).json(err.response.data);
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
