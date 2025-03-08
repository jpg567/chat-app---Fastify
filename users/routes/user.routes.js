const userController = require('../controllers/user.controller')

const routes = [
    {
        method:"GET",
        url: "/",
        handler: userController.getAllUsers
    },
    {
        method: "GET",
        url: '/:username',
        handler: userController.getOneUser
    },
    {
        method: "POST",
        url: "/add-user",
        handler: userController.createOneUser
    },
    {
        method: "PUT",
        url: "/:id",
        handler: userController.updateOneUser
    },
    {
        method: "DELETE",
        url: "/:id",
        handler: userController.deleteOneUser
    },
    {
        method: "POST",
        url: "/login",
        handler: userController.login
    },
    {
        method: "POST",
        url: "/logout",
        handler: userController.logout
    },
    
]


module.exports = routes
