import { pascalCase, camelCase, getMessageType, realizeParametersForChannelWrapper, getClientToUse, realizeParametersForChannelWithoutType, renderJSDocParameters} from '../../utils/index';
// eslint-disable-next-line no-unused-vars
import { IntentMessage, ChannelParameter } from '@asyncapi/parser';

/**
 * Component which returns a request to function for the client
 * 
 * @param {string} defaultContentType 
 * @param {string} channelPath to request to 
 * @param {IntentMessage[]} requestMessages used to send the request
 * @param {IntentMessage[]} replyMessages which is receive in the reply
 * @param {string} messageDescription 
 * @param {Object.<string, ChannelParameter>} channelParameters parameters to the channel
 */
export function Request(defaultContentType, channelPath, requestMessages, replyMessages, messageDescription, channelParameters) {
  return `
    /**
     * Request to the \`${channelPath}\` channel 
     * 
     * ${messageDescription}
     * 
     * @param message to send
     ${renderJSDocParameters(channelParameters)}
     */
     public request${pascalCase(channelPath)}(
       message:${getMessageType(requestMessages)} 
        ${realizeParametersForChannelWrapper(channelParameters)}
     ): Promise<${getMessageType(replyMessages)}> {
      ${getClientToUse(requestMessages, defaultContentType)}
       if(nc){
         return ${camelCase(channelPath)}Channel.request(
           message, 
           nc
           ${Object.keys(channelParameters).length ? `,${realizeParametersForChannelWithoutType(channelParameters)}` : ''}
         );
       }else{
         return Promise.reject(NatsTypescriptTemplateError.errorForCode(ErrorCode.NOT_CONNECTED));
       }
     }
    `;
}
