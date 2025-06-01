import amqp from 'amqplib'

const RABBITMQ = process.env.RABBITMQ_URL;

async function executeInBackground(queue: any, payload: any) {
  if (!RABBITMQ) {
    throw new Error('RABBITMQ_URL environment variable is not defined');
  }
  const connection = await amqp.connect(RABBITMQ);
  const channel = await connection.createChannel();
  await channel.assertQueue(queue, { durable: false });
  channel.sendToQueue(queue, Buffer.from(JSON.stringify(payload)));
}

export default executeInBackground