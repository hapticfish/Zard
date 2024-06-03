// kafkaProducer.js
const { Kafka } = require('kafkajs');
require('dotenv').config({ path: '../.env' });

const kafka = new Kafka({
    clientId: 'Zard_v001',
    brokers: ['localhost:9092', 'localhost:9093'],
    ssl: true,
    sasl: {
        mechanism: 'scram-sha-256',
        username: process.env.KAFKA_BROKER_USERNAME,
        password: process.env.KAFKA_BROKER_PASSWORD
    }
});

const producer = kafka.producer();

const connectProducer = async () => {
    await producer.connect();
    console.log("Kafka Producer connected with SASL_SS");
};

const send = async ({ topic, messages }) => {
    await producer.send({
        topic,
        messages: messages.map(msg => ({ value: JSON.stringify(msg) }))
    });
    console.log(`Messages sent to ${topic}`);
};

module.exports = { connectProducer, send, producer };

//TODO get Brokers and signed up for kafka the clusters to which they connect
//todo configure kafka client

//todo GO BACK TO CONFIGURING KAFKA BROKER!!!!