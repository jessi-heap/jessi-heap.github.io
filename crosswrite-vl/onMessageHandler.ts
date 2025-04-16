import { HEAP_WEB_APP_URI, VisualLabelerStatus } from './constants';
import { VisualLabeler } from './VisualLabeler';

/*
 * The VL gets initiated via postMessage events from the heapanalytics.com domain.
 */
const postMessageHandler = (event: MessageEvent) => {
  if (event.origin !== HEAP_WEB_APP_URI) {
    return;
  }

  if (typeof event.data !== 'object') {
    return;
  }

  if (event.data.message !== 'init') {
    return;
  }

  if (!event.source) {
    return;
  }

  sendReceivedInitMessageTo(event.source);

  VisualLabeler.getInstance().initialize(event);
};

const sendReceivedInitMessageTo = (source: MessageEventSource) => {
  source.postMessage(
    {
      type: 'status',
      value: VisualLabelerStatus.ReceivedInitMessage,
    },
    { targetOrigin: '*' },
  );
};

export const initOnMessageHandler = () => {
  window.addEventListener('message', postMessageHandler);
};
