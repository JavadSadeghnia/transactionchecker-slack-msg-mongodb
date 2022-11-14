const mongoose = require("mongoose")

//const ethAccountRE = /^0x[a-fA-F0-9]{40}$/;
const userSchema = new mongoose.Schema({
    walletAddress: {
        type: String,
        minLength: 42,
        maxLength: 42,
        //immutable: true,
        required: true,
    },
    slackID: {
        type: String,
        minLength: 11,
        maxLength: 11,
        //immutable: true,
        required: true,
    },
})

module.exports = mongoose.model("User", userSchema)
