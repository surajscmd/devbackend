const cron = require('node-cron');
const { subDays , startOfDay, endOfDay} = require( "date-fns");
const ConnectionRequestModel = require('../model/connectionRequest');
const sendEmail = require('./sendEmail');
// this 
cron.schedule('0 8 * * * ', async() => {
    try {
        const yesterday = subDays(new Date(), 1);
        const yeaterdayStart = startOfDay(yesterday);
        const yeaterdayEnd = endOfDay(yesterday);
        console.log(yeaterdayStart);

        const pendingRequests = await ConnectionRequestModel.find({
            status: "interested",
            createdAt: {
                $gte: yeaterdayStart,
                $lt: yeaterdayEnd,
            },
        }).populate("fromUserId toUserId");
        const listOfEmails = [...new Set(pendingRequests.map(req=> req.toUserId.emailID))];
         

        for (const email of listOfEmails){
            try {
                const res = await sendEmail.run( 
                    "New Friend Request pending for " + email, "There are so many friends request pending, please login to devconnect and check the pending requests"                
                );
                // console.log(res)
            } catch (error) {
                console.log(error)
            }
        }

    } catch (error) {
        console.log(error)
    }

  });