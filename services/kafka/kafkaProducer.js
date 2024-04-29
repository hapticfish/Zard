// kafkaProducer.js
const { Kafka } = require('kafkajs');

const kafka = new Kafka({
    clientId: 'Zard_v001',
    brokers: ['kafka1:9092', 'kafka2:9092']
});

const producer = kafka.producer();

const connectProducer = async () => {
    await producer.connect();
    console.log("Kafka Producer connected");
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

