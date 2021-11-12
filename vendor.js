'use strict';

const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-west-2' });
const faker = require('faker');
const { Consumer } = require('sqs-consumer');

const sns = new AWS.SNS();

const topic = 'arn:aws:sns:us-west-2:036709950084:pickup.fifo';
const vendorUrl = 'https://sqs.us-west-2.amazonaws.com/036709950084/flowers';

setInterval(async () => {
  const order = {
    orderId: faker.datatype.uuid(),
    customer: faker.name.findName(),
    vendorId: vendorUrl,
  };

  const payload = {
    Message: JSON.stringify(order),
    TopicArn: topic, // required for telling where to send a notification
    MessageGroupId: 'flowers',
    MessageDeduplicationId: faker.datatype.uuid(),
  };

  sns
    .publish(payload)
    .promise()
    .then(data => {
      console.log('PICKUP', data);
    })
    .catch(e => {
      console.log(e);
    });
}, 5000);

const vendor = Consumer.create({
  queueUrl: vendorUrl,
  handleMessage: async message => {
    const msg = JSON.parse(message.Body);
    console.log('Thank you for delivering,', msg.orderId);
  },
  pollingWaitTimeMs: 3000,
});

vendor.start();
