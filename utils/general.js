import _ from 'lodash';
const {FormatHelpers} = require('@asyncapi/generator-model-sdk');
// eslint-disable-next-line no-unused-vars
import { IntentMessage, Schema, IntentAsyncAPIDocument} from '@asyncapi/parser';
const contentTypeJSON = 'application/json';
const contentTypeString = 'text/plain';
const contentTypeBinary = 'application/octet-stream';

/**
 * @typedef TemplateParameters
 * @type {object}
 * @property {boolean} generateTestClient - whether or not test client should be generated.
 * @property {boolean} promisifyReplyCallback - whether or not reply callbacks should be promisify.
 */

/**
 * Should the callbacks be promisify.
 * 
 * @param {TemplateParameters} params passed to the template
 * @returns {boolean} should it promisify callbacks
 */
export function shouldPromisifyCallbacks(params) {
  return params.promisifyReplyCallback;
}

export function camelCase(string) {
  return _.camelCase(string);
}
export function pascalCase(string) {
  string = _.camelCase(string);
  return string.charAt(0).toUpperCase() + string.slice(1);
}
export function kebabCase(string) {
  return _.kebabCase(string);
}

/**
 * Returns the schema file name
 * 
 * @param {string} schemaName 
 * @returns 
 */
export function getSchemaFileName(schemaName) {
  return FormatHelpers.toPascalCase(schemaName);
}

/**
 * Figure out if our message content type or default content type matches a given payload.
 * 
 * @param {string} messageContentType to check against payload
 * @param {string} defaultContentType to check against payload
 * @param {string} payload to check
 */
function containsPayload(messageContentType, defaultContentType, payload) {
  if (
    (messageContentType !== undefined &&
      messageContentType.toLowerCase() === payload) ||
    (defaultContentType !== undefined && defaultContentType === payload)
  ) {
    return true;
  }
  return false;
}
export function isBinaryPayload (messageContentType, defaultContentType) {
  return containsPayload(messageContentType, defaultContentType, contentTypeBinary);
}
export function isStringPayload(messageContentType, defaultContentType) {
  return containsPayload(messageContentType, defaultContentType, contentTypeString);
}
export function isJsonPayload(messageContentType, defaultContentType) {
  return containsPayload(messageContentType, defaultContentType, contentTypeJSON);
}

/**
 * Based on the payload type of the message choose a client
 * 
 * @param {IntentMessage[]} messages 
 * @param {string} defaultContentType 
 */
export function getClientToUse(messages, defaultContentType) {
  if (isBinaryPayload(messages[0].contentType(), defaultContentType)) {
    return 'const nc: Client = this.binaryClient!;';
  } else if (isStringPayload(messages[0].contentType(), defaultContentType)) {
    return 'const nc: Client = this.stringClient!;';
  }
  //Default to JSON client
  return 'const nc: Client = this.jsonClient!;';
}

/**
 * Checks if the messages has null type
 * 
 * @param {IntentMessage} message to check
 * @returns {boolean} does the payload contain null type 
 */
export function messageHasNotNullPayload(message) {
  return `${message.payload().type()}` !== 'null';
}

/**
 * Get message type ensure that the correct message type is returned.
 * 
 * @param {IntentMessage[]} messages to find the message type for
 */
export function getMessageType(messages) {
  const messageTypes = messages.map((message) => {
    if (`${message.payload().type()}` === 'null') {
      return 'null';
    } 
    return `${getSchemaFileName(message.payload().uid())}`;
  });
  return messageTypes.join('|');
}

export function containsBinaryPayload(document) {
  return document.hasContentType(contentTypeBinary);
}
export function containsStringPayload(document) {
  return document.hasContentType(contentTypeString);
}
export function containsJsonPayload(document) {
  const containsJsonPayload = document.hasContentType(contentTypeJSON);
  //Default to JSON type
  return containsJsonPayload || (!containsBinaryPayload(document) && !containsStringPayload(document));
}

/**
 * Convert JSON schema draft 7 types to typescript types 
 * 
 * @param {string} jsonSchemaType 
 * @param {string} property 
 */
export function toTsType(jsonSchemaType, property) {
  switch (jsonSchemaType.toLowerCase()) {
  case 'string':
    return 'string';
  case 'integer':
  case 'number':
    return 'Number';
  case 'boolean':
    return 'Boolean';
  case 'object':
    if (property) {
      return `${property.uid()}Schema`;
    }
    return 'any';
      
  default: return 'any';
  }
}

/**
 * Cast JSON schema variable to typescript type
 * 
 * @param {string} jsonSchemaType 
 * @param {string} variableToCast 
 */
export function castToTsType(jsonSchemaType, variableToCast) {
  switch (jsonSchemaType.toLowerCase()) {
  case 'string':
    return `"" + ${variableToCast}`;
  case 'integer':
  case 'number':
    return `Number(${variableToCast})`;
  case 'boolean':
    return `Boolean(${variableToCast})`;
  default: throw new Error(`Parameter type not supported - ${jsonSchemaType}`);
  }
}
