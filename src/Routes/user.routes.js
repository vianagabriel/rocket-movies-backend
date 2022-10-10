const { Router } = require('express');
const userRoutes = Router();
const UserController = require("../Controllers/userController");
const usersController = new UserController();

userRoutes.post('/', usersController.create);
userRoutes.put('/:id', usersController.update);

module.exports = userRoutes;