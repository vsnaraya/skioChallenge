var amqp = require("amqplib/callback_api");
const args = require("yargs").argv;

const sendMessage = (n) => {
    var queue = "skioTest";
    var msg = "make api call";

    amqp.connect("amqp://localhost", function (err0, connection) {
      if (err0) {
        throw err0;
      }
      connection.createChannel(function (err1, channel) {
        if (err1) {
          throw err1;
        }

        channel.assertQueue(queue, {
          durable: false,
        });

        for (var i = 0; i < n; i++) {
          channel.sendToQueue(queue, Buffer.from(msg));
          console.log("sending to queue");
        }

        // https://stackoverflow.com/questions/39281268/node-js-imqplib-sendtoqueue-to-rabbitmq-is-hanging
        setTimeout(function () {
          channel.connection.close();
        }, 500);
      });
    });
  }

try {
  const numberOfRequests = args.numberOfRequests;
  if (!numberOfRequests || !Number.isInteger(numberOfRequests)) {
    throw new Error("please use numberOfRequests flag");
  }
  sendMessage(numberOfRequests);
} catch (e) {
  console.log(e.toString());
}
