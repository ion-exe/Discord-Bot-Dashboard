const client = require('./bot/bot.js').client

const express = require('express');
var bodyParser = require('body-parser');
const app = express();
const db = require('quick.db');
app.use(bodyParser.json())
let port = require('./config.js').port || 3000;
app.set('port', port);
const session = require('express-session');
const passport = require('passport');
passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(obj, done) {
  done(null, obj);
});
const Strategy = require('passport-discord').Strategy;
const { clientId, clientSecret, scopes, redirectUri } = require('./config.js');
passport.use(new Strategy({
    clientID: clientId,
    clientSecret: clientSecret,
    callbackURL: redirectUri,
    scope: scopes,
    prompt: 'consent'
}, function(accessToken, refreshToken, profile, done) {
    process.nextTick(function() {
        return done(null, profile);
    });
}));


app.set('view engine', 'ejs');
app.use(express.static('static'));
app.use(session({
    secret: 'meow meow im a cow',
    resave: false,
    saveUninitialized: false,
    expires: 604800000,
}));
app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => {
    res.render('index', { pageTitle: 'Dashboard', user: req.session.user || null
});
});
app.get('/authorize', passport.authenticate('discord', { scope: scopes, prompt: 'consent' }), function(req, res) {});
app.get('/callback', passport.authenticate('discord', { failureRedirect: '/' }), function(req, res) { req.session.user = req.user; req.session.user.tag = req.user.username + '#' + req.user.discriminator; res.redirect('/') })


app.get('/logout', (req, res) => {
    req.session.destroy();
});
app.get('/servers', function(req, res) {
  if (!req.session.user) return res.redirect('/authorize');
  console.log(Object.keys(req.session.user.guilds[0]))
  res.render('servers.ejs', {
    servers: req.session.user.guilds.filter(x=>(x.owner && client.guilds.cache.get(x.id))),
    user: req.session.user,
    tag: req.session.user.tag,
    pageTitle: 'Servers'
  })
})
app.get('/manage/:id', function(req, res) {
  if (!req.session.user) return res.redirect('/authorize');
  let id = req.params['id'];
  let g = null;
  req.session.user.guilds.forEach(function (x) {
    if (id === x.id) g = x;
  })
  if (!g) return res.redirect('/') ;
  
  res.render('manage.ejs', {guild: g, user: req.session.user, pageTitle: 'Manage Server'})
});
app.post('/manage/:id', (req, res) => {
  let id = req.params['id'];
  let rolesName = req.body.role;
  let roleColor = req.body.roleColor.toUpperCase;
  let user = req.session.user;
  client.guilds.cache.get(id).roles.cache.create({
    data: {
      name: rolesName,
      color: roleColor
    },
    reason: 'Generated from dashboard'
  })
});
app.post('/send/:id', (req, res) => {
  if (!req.session.user) return res.send('get outta here you bot');
  let id = req.params['id'];
  client.channels.cache.get(id).send((req.body.message || 'hi'))
})
app.listen(port, () => console.info(`Listening on port ${port}`));