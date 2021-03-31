import { pascalCase, camelCase, getMessageType, realizeParametersForChannelWrapper, realizeParametersForChannelWithoutType, getClientToUse, renderJSDocParameters } from '../../utils/index';
// eslint-disable-next-line no-unused-vars
import { IntentMessage, ChannelParameter } from '@asyncapi/parser';

/**
 * Component which returns a publish to function for the client
 * 
 * @param {string} defaultContentType 
 * @param {string} channelPath to publish to
 * @param {IntentMessage[]} messages which is being published
 * @param {string} messageDescription 
 * @param {Object.<string, ChannelParameter>} channelParameters parameters to the channel
 */
export function Publish(defaultContentType, channelPath, messages, messageDescription, channelParameters) {
  return `
  /**
   * Publish to the \`${channelPath}\` channel 
   * 
   * ${messageDescription}
   * 
   * @param message to publish
   ${renderJSDocParameters(channelParameters)}
   */
    public publishTo${pascalCase(channelPath)}(
      message: ${getMessageType(messages)} 
      ${realizeParametersForChannelWrapper(channelParameters)}
    ): Promise<void> {
      ${getClientToUse(messages, defaultContentType)}

      if(nc) {
        return ${camelCase(channelPath)}Channel.publish(
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
