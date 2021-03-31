import { pascalCase, camelCase, getMessageType, realizeParametersForChannelWithoutType, realizeParametersForChannelWrapper, getClientToUse, renderJSDocParameters} from '../../utils/index';
// eslint-disable-next-line no-unused-vars
import { Message, ChannelParameter } from '@asyncapi/parser';

/**
 * @typedef TemplateParameters
 * @type {object}
 * @property {boolean} generateTestClient - whether or not test client should be generated.
 * @property {boolean} promisifyReplyCallback - whether or not reply callbacks should be promisify.
 */

/**
 * Component which returns a reply to function for the client
 * 
 * @param {string} defaultContentType 
 * @param {string} channelPath to setup reply to
 * @param {Message[]} replyMessages used to reply to request
 * @param {Message[]} receiveMessages which is received by the request 
 * @param {string} messageDescription 
 * @param {Object.<string, ChannelParameter>} channelParameters parameters to the channel
 * @param {TemplateParameters} params passed template parameters 
 */
export function Reply(defaultContentType, channelPath, replyMessages, receiveMessages, messageDescription, channelParameters, params) {
  return `
  /**
   * Reply to the \`${channelPath}\` channel 
   * 
   * ${messageDescription}
   * 
   * @param onRequest called when request is received
   * @param onReplyError called when it was not possible to send the reply
   ${renderJSDocParameters(channelParameters)}
   * @param flush ensure client is force flushed after subscribing
   * @param options to subscribe with, bindings from the AsyncAPI document overwrite these if specified
   */
    public replyTo${pascalCase(channelPath)}(
        onRequest : (
          err?: NatsTypescriptTemplateError, 
          msg?: ${getMessageType(receiveMessages)}
          ${realizeParametersForChannelWrapper(channelParameters, false)}
        ) => ${params.promisifyReplyCallback.length && 'Promise<'}${getMessageType(replyMessages)}${ params.promisifyReplyCallback.length && '>'}, 
        onReplyError : (err: NatsTypescriptTemplateError) => void 
        ${realizeParametersForChannelWrapper(channelParameters)}, 
        flush?: boolean,
        options?: SubscriptionOptions
      ): Promise<Subscription> {
      return new Promise(async (resolve, reject) => {
        ${getClientToUse(receiveMessages, defaultContentType)}
        if (nc) {
          try {
            const sub = await ${ camelCase(channelPath) }Channel.reply(
              onRequest, 
              onReplyError, 
              nc
              ${Object.keys(channelParameters).length ? `,${realizeParametersForChannelWithoutType(channelParameters)}` : ''},
              options
            );
            if(flush){
              this.jsonClient!.flush(() => {
                resolve(sub);
              });
            }else{
              resolve(sub);
            }
          } catch (e) {
            reject(e);
          }
        } else {
          reject(NatsTypescriptTemplateError.errorForCode(ErrorCode.NOT_CONNECTED));
        }
      });
    }
  `;
}
