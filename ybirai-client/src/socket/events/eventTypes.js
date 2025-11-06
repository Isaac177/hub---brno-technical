// Progress-related socket events
export const PROGRESS_EVENTS = {
  SEND: {
    UPDATE: 'updateProgress',      // Client -> Server: Send progress update
    BROADCAST: 'broadcastProgress', // Client -> Server: Request broadcast
    REQUEST_SYNC: 'requestSync'    // Client -> Server: Request progress sync
  },
  RECEIVE: {
    UPDATE: 'progressUpdate',      // Server -> Client: Receive progress update
    BROADCAST: 'progressBroadcast', // Server -> Client: Receive broadcast
    SYNC: 'progressSync'          // Server -> Client: Receive sync data
  }
};
