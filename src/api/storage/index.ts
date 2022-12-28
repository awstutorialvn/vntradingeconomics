import * as videoHandler from './handler';
import { apiHandler } from '/opt/core/lib/handler';

const presignedPutUrlHandler = apiHandler(videoHandler.presignedPutUrlHandler);

export { presignedPutUrlHandler };
