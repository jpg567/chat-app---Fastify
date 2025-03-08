const messagecontroller = require('../controllers/message.controller')

const routes = [
    {
        method: "GET",
        url: "/",
        handler: messagecontroller.getAllMessages
    },
    {
        method: "POST",
        url: "/get-message",
        handler: messagecontroller.getOneMessage
    },
    {
        method: "POST",
        url: "/add-message",
        handler: messagecontroller.createOneMessage
    },
    {
        method: "POST",
        url: "/delete-message",
        handler: messagecontroller.deleteOneMessage
    },
]
module.exports = routes