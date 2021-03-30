import { File } from '@asyncapi/generator-react-sdk';
import { Events } from '../../../components/events';
import { getStandardClassCode, getStandardHeaderCode } from '../../../components/index/standard';
import { Publish } from '../../../components/index/publish';
import { Subscribe } from '../../../components/index/subscribe';
import { Reply } from '../../../components/index/reply';
import { Request } from '../../../components/index/request';
import { isRequestReply, isReplier, isRequester, isPubsub} from '../../../utils/index';
// eslint-disable-next-line no-unused-vars
import { IntentAsyncAPIDocument, ChannelParameter } from '@asyncapi/parser';

/**
 * @typedef TemplateParameters
 * @type {object}
 * @property {boolean} generateTestClient - whether or not test client should be generated.
 * @property {boolean} promisifyReplyCallback - whether or not reply callbacks should be promisify.
 */

/**
 * @typedef RenderArgument
 * @type {object}
 * @property {IntentAsyncAPIDocument} asyncapi received from the generator.
 * @property {TemplateParameters} params received from the generator.
 */

/**
 * Return the correct channel functions for the test client on whether a channel is `pubSub` or `requestReply`
 * 
 * @param {IntentAsyncAPIDocument} asyncapi 
 * @param {TemplateParameters} params 
 */
// eslint-disable-next-line sonarjs/cognitive-complexity
function getChannelWrappers(asyncapi, params) {
  let channelWrappers = [];
  channelWrappers = asyncapi.channels().map((channel) => {
    const publishMessage = channel.messagesPublishes();
    const subscribeMessage = channel.messagesSubscribes();
    const defaultContentType = asyncapi.defaultContentType();
    const channelDescription = channel.description();
    const channelParameters = channel.parameters();
    const channelPath = channel.path();
    if (isRequestReply(channel)) {
      if (isRequester(channel)) {
        return Reply(defaultContentType, 
          channelPath, 
          publishMessage,
          subscribeMessage,
          channelDescription,
          channelParameters,
          params
        );
      }
      if (isReplier(channel)) {
        return Request(
          defaultContentType, 
          channelPath, 
          publishMessage,
          subscribeMessage,
          channelDescription,
          channelParameters
        );
      }
    }

    if (isPubsub(channel)) {
      if (channel.hasSubscribe()) {
        return Subscribe(
          defaultContentType, 
          channelPath, 
          subscribeMessage, 
          channelDescription, 
          channelParameters);
      }
      if (channel.hasPublish()) {
        return Publish(
          defaultContentType, 
          channelPath, 
          publishMessage, 
          channelDescription, 
          channelParameters);
      }
    }
  });
  return channelWrappers;
}

/**
 * Function to render file.
 * 
 * @param {RenderArgument} param0 render arguments received from the generator.
 */
export default function indexFile({ asyncapi, params }) {
  return (
    <File name="index.ts">
      {`
${getStandardHeaderCode(asyncapi, '../', './testchannels')}

export declare interface NatsAsyncApiTestClient {
  ${Events()}
}
/**
 * @class NatsAsyncApiTestClient
 * 
 * The test/mirror client which is the reverse to the normal NatsAsyncApiClient.
 */
export class NatsAsyncApiTestClient extends events.EventEmitter{
  ${getStandardClassCode(asyncapi)}
  ${getChannelWrappers(asyncapi, params).join('')}
}
      `}
    </File>
  );
}
