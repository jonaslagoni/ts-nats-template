import { OnSendingData } from './OnSendingData';
import { realizeChannelName, getMessageType, realizeParametersForChannelWrapper, messageHasNotNullPayload, renderJSDocParameters } from '../../utils/index';
// eslint-disable-next-line no-unused-vars
import { Message, ChannelParameter } from '@asyncapi/parser';

/**
 * Component which returns a function which publishes to the given channel
 * 
 * @param {string} defaultContentType 
 * @param {string} channelPath to publish to
 * @param {Message[]} messages which is being published
 * @param {Object.<string, ChannelParameter>} channelParameters parameters to the channel
 */
export function Publish(defaultContentType, channelPath, messages, channelParameters) {
  //Determine the publish operation based on whether the message type is null
  let publishOperation = `await nc.publish(${realizeChannelName(channelParameters, channelPath)}, null);`;
  if (messageHasNotNullPayload(message.payload())) {
    publishOperation = `
      ${OnSendingData(message, defaultContentType)}
      await client.publish(${realizeChannelName(channelParameters, channelPath)}, dataToSend);
    `;
  }
  return `
  /**
   * Internal functionality to publish message to channel 
   * ${channelPath}
   * 
   * @param message to publish
   * @param client to publish with
   ${renderJSDocParameters(channelParameters)}
   */
    export function publish(
      message: ${getMessageType(messages)},
      client: Client
      ${realizeParametersForChannelWrapper(channelParameters)}
      ): Promise<void> {
      return new Promise<void>(async (resolve, reject) => {
        try{
          let dataToSend : any = message;
          ${publishOperation}
          resolve();
        }catch(e){
          reject(NatsTypescriptTemplateError.errorForCode(ErrorCode.INTERNAL_NATS_TS_ERROR, e));
        }
      });
    };
    `;
}
