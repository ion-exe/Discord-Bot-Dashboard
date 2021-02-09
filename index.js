const client = require('./bot/bot.js').client
const express = require('express');
var bodyParser = require('body-parser');
const app = express();
const db = require('quick.db');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
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


app.get('/authorize/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
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
  let guild = null;
  req.session.user.guilds.forEach(function (x) {
    if (id === x.id) guild = client.guilds.cache.get(x.id);
  })
  if (!guild) return res.redirect('/') ;
  let channels = guild.channels.cache;
  res.render('manage.ejs', {guild: guild, user: req.session.user, pageTitle: 'Manage Server', done: false, channels: channels, regged: [db.get(`c_${guild.id}`)] || [], bot: client})
});
app.post('/prefix/:id', (req, res) => {
  if (!req.session.user) return console.log('wait what');
  let id = req.params['id'];
  if (!client.guilds.cache.get(id)) return res.send('oh weird');
  let guild = client.guilds.cache.get(id);
  let pref = req.body.prefix || (db.get(`prefix_${id}`) || '!');
  db.set(`prefix_${id}`, pref); 
  res.render('manage.ejs', {guild: client.guilds.cache.get(id), user: req.session.user, pageTitle: 'Manage Server', done: true, channels: guild.channels.cache, regged: db.get(`c_${guild.id}`) || [], bot: client})
});

app.post('/send/:id', (req, res) => {
  let id = req.params['id'];
  console.log(id)
  console.log(Object.keys(client.channels.fetch("id")))
  client.channels.fetch(id, true).then(channel => {console.log(Object.keys(channel));channel.send(req.body['msg-'+channel.id])}).catch(console.error)
  res.render('manage.ejs', {guild: client.guilds.cache.get(id), user: req.session.user, pageTitle: 'Manage Server', done: true, channels: guild.channels.cache, regged: db.get(`c_${guild.id}`) || [], bot: client})
  
})
app.listen(port, () => console.info(`Listening on port ${port}`));