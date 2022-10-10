require('express-async-errors');

const AppError = require('./Utils/AppError');
const routes = require('./Routes');
const express = require('express');
const app = express();
const PORT = 3000;
const migrationsRun = require('./Database/sqlite/migrations');

migrationsRun();
app.use(express.json());
app.use(routes);

app.use((error, request, response, next ) => {
   if(error instanceof AppError){
     return response.status(error.statusCode).json({
        status: 'error',
        message: error.message
     })
   }

   console.log(error);

   return response.status(500).json({
      status: 'error',
      message: 'Internal server error',
   })
})

app.listen(PORT, () => console.log(`Server is running on Port ${PORT}`));

