const { Schema, model } = require('mongoose');

const messageSchema = new Schema(
    { 
        sender: { type: String },
        content: { type: String },
        group_name: { type: String, required: true }
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

module.exports = model('Message', messageSchema);
