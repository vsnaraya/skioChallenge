var amqp = require("amqplib/callback_api");
const args = require("yargs").argv;

var RATE_LIMIT_TIMER;
var RATE_LIMIT_REQUEST_LIMIT;

const checkRateLimiting = (requestsSent) => {
  return (
    requestsSent.length > 0 &&
    (Date.now() - requestsSent[0]) / 1000 < RATE_LIMIT_TIMER &&
    requestsSent.length >= RATE_LIMIT_REQUEST_LIMIT
  );
};

const updateRequestHistory = (requestsSent) => {
  if ((Date.now() - requestsSent[0]) / 1000 > RATE_LIMIT_TIMER) {
    requestsSent.shift();
  }
};

const startConsumer = (timeLimit, requestLimit) => {
  RATE_LIMIT_TIMER = timeLimit;
  RATE_LIMIT_REQUEST_LIMIT = requestLimit;
  
  const queue = "skioTest";
  amqp.connect("amqp://localhost", function (err0, connection) {
    if (err0) {
      throw err0;
    }
    connection.createChannel(function (err1, channel) {
      if (err1) {
        throw err1;
      }
      
      console.log("consumer has started");
      channel.assertQueue(queue, {
        durable: false,
      });

      // keep track of requests sent
      var requestsSent = [];

      setInterval(() => {
        const isRateLimited = checkRateLimiting(requestsSent);
        if (!isRateLimited) {
          channel.get(queue, { noAck: true }, (err, msg) => {
            if (err) {
              throw err;
            }
            if (msg !== false) {
              requestsSent.push(Date.now());
              // api call goes heree.
              console.log("making api call..");
            }
          });
        } else {
          console.log("being rate limited....");
        }
        // remove any requests no longer in the rate limit window
        updateRequestHistory(requestsSent);
      }, 1000);
    });
  });
};

try {
  const requestTimeLimit = args.timeLimit;
  const requestLimit = args.requestLimit;

  if (!requestTimeLimit || !requestLimit) {
    throw new Error("please use requestTimeLimit & requestLimit flag");
  }
  startConsumer(requestTimeLimit, requestLimit);
} catch (e) {
  console.log(e.toString());
}
