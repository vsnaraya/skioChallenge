# Skio Backend Engineering Challenge 


# Prerequisites
    - Node: >=16
    - npm >= 8
    - rabbitMQ installed (https://www.rabbitmq.com/install-homebrew.html)


#  Installation 
    - clone repo 
    - npm install 


# Usage 
    - start rabbitMQ server (brew services start rabbitmq)
    - start the consumer: node recieve.js --requestLimit={} --timeLimit={}(in seconds)
    - start the sender in a seperate tab: node send.js --numberOfRequests={}

    - to view the queue at any time navigate to http://localhost:15672/#/queues the queueName is skioTest 


# High Level Design 

    Recieve.js
      - Wrapped the rate limited api call in logic to check if we are currently being rate limited. This logic runs every 1 second to check if it is being rate limited, if not check it will check if any messages are in the rabbitMQ queue and make API call if so.

      - To check if rate limiting is in effect, it will keep  track of the time each request was sent in the last requestTimeLimit interval. Added logic to remove any requests if it is outside the last requestTimeLimit interval, since we no longer need to track those requests (Sliding Window Rate Limitting assumed)


    - Send.js 
      - simulates calls to the API by sending user inputted number of messages to the queue







