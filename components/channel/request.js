import { OnSendingData } from './OnSendingData';
import { OnReceivingData } from './OnReceivingData';
import { realizeChannelName, getMessageType, realizeParametersForChannelWrapper, messageHasNotNullPayload, renderJSDocParameters } from '../../utils/index';
// eslint-disable-next-line no-unused-vars
import { Message, ChannelParameter } from '@asyncapi/parser';

/**
 * Component which returns a function which create a request to the given channel
 * 
 * @param {string} defaultContentType 
 * @param {string} channelPath to request to
 * @param {Message} requestMessage used to send the request
 * @param {Message} replyMessage which is receive in the reply
 * @param {Object.<string, ChannelParameter>} channelParameters parameters to the channel
 */
export function Request(defaultContentType, channelPath, requestMessage, replyMessage, channelParameters) {
  //Include timeout if specified in the document
  let includeTimeout =  '';
  const natsBindings = requestMessage.bindings('nats');
  if (requestMessage.hasBinding('nats') && 
      natsBindings.requestReply && 
      natsBindings.requestReply.timeout) {
    includeTimeout = `timeout = '${natsBindings.requestReply.timeout}';`;
  }

  //Determine the request operation based on whether the message type is null
  let requestOperation = `msg = await client.request(${realizeChannelName(channelParameters, channelPath)}, timeout, null)`;
  if (messageHasNotNullPayload(requestMessage.payload())) {
    requestOperation = `
    ${OnSendingData(requestMessage, defaultContentType)}
    msg = await client.request(${realizeChannelName(channelParameters, channelPath)}, timeout, dataToSend)
    `;
  }

  //Determine the request callback operation based on whether the message type is null
  let requestCallbackOperation = 'resolve(null);';
  if (messageHasNotNullPayload(replyMessage.payload())) {
    requestCallbackOperation =  `
    let receivedData : any = msg.data;
    try{
      ${OnReceivingData(replyMessage, defaultContentType)}
    }catch(e){
      reject(e)
      return;
    }
    resolve(receivedData);
    `;
  }

  return `
  /**
   * Internal functionality to send request to the \`${channelPath}\` channel 
   * 
   * @param requestMessage to send
   * @param client to send request with
   ${renderJSDocParameters(channelParameters)}
   */
    export function request(
      requestMessage: ${getMessageType(requestMessage)},
      client: Client
      ${realizeParametersForChannelWrapper(channelParameters)}
      ): Promise<${getMessageType(replyMessage)}> {
      return new Promise(async (resolve, reject) => {
        let timeout = undefined;
        ${includeTimeout}
        let msg;
        let dataToSend : any = requestMessage;
        try {
          ${requestOperation}
        }catch(e){
          reject(NatsTypescriptTemplateError.errorForCode(ErrorCode.INTERNAL_NATS_TS_ERROR, e));
          return;
        }
        ${requestCallbackOperation}
      })
    }
    `;
}
