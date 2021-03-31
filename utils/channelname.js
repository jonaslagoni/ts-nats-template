// eslint-disable-next-line no-unused-vars
import { ChannelParameter } from '@asyncapi/parser';

/**
 * Convert RFC 6570 URI with parameters to NATS topic. 
 * 
 * @param {Object.<string, ChannelParameter>} parameters 
 * @param {string} channelPath 
 * @returns 
 */
export function realizeChannelName(parameters, channelPath) {
  let returnString = `\`${  channelPath  }\``;
  returnString = returnString.replace(/\//g, '.');
  for (const paramName in parameters) {
    returnString = returnString.replace(`{${paramName}}`, `\${${paramName}}`);
  }
  return returnString;
}
  
/**
 * Realize channel name to NATS topic without replacing parameters
 * 
 * @param {string} channelPath 
 */
export function realizeChannelNameWithoutParameters(channelPath) {
  return realizeChannelName(null, channelPath);
}
  
