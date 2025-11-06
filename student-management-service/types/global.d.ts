import MessageQueueService from "../services/messageQueue";

declare global {
    namespace Express {
         interface Application {
            messageQueue: MessageQueueService;
        }
    }
}
