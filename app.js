const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const exphbs = require('express-handlebars');
const keys = require('./config/keys');
const path = require('path');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const port = process.env.PORT || 5000;

// Load models
require('./models/User');
require('./models/Story');

// passport config
require('./config/passport')(passport); 

// Loading routes
const index = require('./routes/index');
const auth = require('./routes/auth');
const stories = require('./routes/stories');

// Handlebar helpers
const {
	truncate,
	stripTags,
	formatDate,
	select,
	editIcon
} = require('./helpers/hbs');

// Map global promises
mongoose.Promise = global.Promise;
// mongoose connect
mongoose.connect(keys.mongoURI, { useNewUrlParser: true } )
	.then(() => console.log('MongoDB connected...') )
	.catch(err => console.log(err) );

const app = express();

// BodyParser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Method Override middleware
app.use(methodOverride('_method'));

// Handlebars middleware
app.engine('handlebars', exphbs( {
	helpers: {
		truncate: truncate,
		stripTags: stripTags,
		formatDate: formatDate,
		select: select,
		editIcon: editIcon
	},
	defaultLayout: 'main'
} ));
app.set('view engine', 'handlebars');

app.use(cookieParser());
app.use(session( {
	secret: 'secret',
	resave: false,
	saveUninitialized: false
} ));

// passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Set global variables
app.use((req, resp, next) => {
	resp.locals.user = req.user || null;
	next();
});

// set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Use Routes
app.use('/', index);
app.use('/auth', auth);
app.use('/stories', stories);

app.listen(port, () => {
	console.log(`Server started on port ${port}`);
});
