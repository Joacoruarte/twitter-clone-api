const express = require('express');
const cors = require('cors');
const port = process.env.PORT ?? 3001;
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');

dotenv.config();
const userRoutes = require('./routes/userRoutes');
const tweetRoutes = require('./routes/tweetRoutes');
console.log(process.env.NODE_ENV);
const app = express();
app.disable('x-powered-by')
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json())
app.use(cors({ 
  origin: [process.env.BASE_URL_FRONT_DEVELOPMENT, process.env.BASE_URL_FRONT_PRODUCTION], 
  credentials: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE']
 }));
app.get('/', (req, res) => res.json({ message: 'Hello World' }));
app.use('/tweets', tweetRoutes);
app.use('/users', userRoutes);

app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});
