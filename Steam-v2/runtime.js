import { emit } from './bus.js';
import { runSerial } from './queue.js';

export async function dispatch(ctx, command) {
  if (!command || !ctx?.message?.isGroup) {
    return false;
  }

  const task = () => command.execute(ctx);

  await emit('command:before', { ctx, command });

  const result = command.serial === true
    ? await runSerial(ctx.message.chatId, task)
    : await task();

  await emit('command:after', { ctx, command, result });

  return result;
}
