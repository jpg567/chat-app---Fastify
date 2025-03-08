const Message = require('../models/message.model')
const boom = require("boom");

const getAllMessages = async(req, rep)=> {
    try{
        const messages = await Message.find()
        rep.code(200).send(messages)
    } catch(err){
        throw boomify.boomify(err)
    }
}
const getOneMessage = async (req, rep) => {
    try {
        const message = await Message.findOne({ sender: req.body.sender, content: req.body.content });

        if (!message) {
            return rep.code(404).send({ error: 'Message not found' });
        }

        rep.send({ messageId: message._id });
    } catch (error) {
        console.error('Error fetching message:', error);
        rep.code(500).send({ error: 'Internal Server Error' });
    }
};

const createOneMessage = async(req, rep)=>{
    try{
        const message = new Message({
            sender: req.body.sender,
            content: req.body.content,
            group_name: req.body.group_name
        })
        await message.save()
        rep.code(201).send(message)
    } catch(err){
        throw boom.boomify(err)
    }
}
const deleteOneMessage = async (req, rep) => {
    const messageId = req.body.messageId;
    const username = req.cookies.username;
    console.log(username)
    if (!messageId) {
        return rep.code(400).send('Message ID is required');
    }

    try {
        // Find the message by ID
        const message = await Message.findById(messageId);

        // Check if the message exists
        if (!message) {
            return rep.code(404).send('Message not found');
        }

        // Check if the sender matches the username
        if (message.sender !== username) {
            return rep.code(403).send('You are not authorized to delete this message');
        }

        // Delete the message
        await Message.findByIdAndDelete(messageId);
        rep.code(200).send('Message deleted');
    } catch (error) {
        console.error('Error deleting message:', error);
        rep.code(500).send('Internal Server Error');
    }
};

  
module.exports = {
    getAllMessages,
    createOneMessage,
    deleteOneMessage,
    getOneMessage
}