const sequelize = require('./database');
const User=require('../models/User')


//sync the the models with the db
sequelize.sync({ force: false }) // `force: false` ensures that tables are not dropped
  .then(() => {
    console.log('Database & tables created!');
  })
  .catch(err => {
    console.error('Error creating database & tables:', err);
  });