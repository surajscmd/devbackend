const express = require("express");
const { Chat } = require("../model/chat");
const { userAuth } = require("../middleware/auth");

const chatRouter = express.Router();


chatRouter.get("/chat/:targetUserId", userAuth, async(req, res) => { 
    const { targetUserId } = req.params;
    console.log(targetUserId);
    const userId = req.user._id;
      try {
        let chat = await Chat.findOne({
          participants: {
            $all: [userId, targetUserId],
          },
        }).populate({
            path: "messages.senderId",
            select: "firstName lastName",
        });
        if (!chat) {
          chat = new Chat({
            participants: [userId, targetUserId],
            messages: [],
          });
        }
        await chat.save();
        res.status(200).send(chat);
      } catch (error) {
        console.log(error); 
      }
});

module.exports = chatRouter;