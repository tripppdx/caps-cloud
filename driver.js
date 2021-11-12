'use strict';

const { Consumer } = require('sqs-consumer');
const { Producer } = require('sqs-producer');

const faker = require('faker');
const queueUrl =
  'https://sqs.us-west-2.amazonaws.com/036709950084/packages.fifo';

const driver = Consumer.create({
  queueUrl: queueUrl,
  handleMessage: async message => {
    // console.log(message);
    const msg = JSON.parse(message.Body);
    const order = JSON.parse(msg.Message);
    console.log('Picked up: ', order);

    setTimeout(async () => {
      const producer = Producer.create({
        queueUrl: order.vendorId,
        region: 'us-west-2',
      });

      await producer.send({
        id: faker.datatype.uuid(),
        body: JSON.stringify(order),
      });

      console.log(`${order.orderId} delivered`);
    }, 4000);
  },
  pollingWaitTimeMs: 3000,
});

driver.start();
