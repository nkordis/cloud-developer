import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { createLogger } from '../../utils/logger'

const logger = createLogger('todosStorage')
const XAWS = AWSXRay.captureAWS(AWS)

export class TodoStorage {

    constructor(
        private readonly bucketName = process.env.TODOS_S3_BUCKET,
        private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION,
        private s3 = new XAWS.S3({
            signatureVersion: 'v4'
        })
    ) { }

    getUploadUrl(todoId: string) {
        logger.info('Getting the url to upload the bucket')

        return this.s3.getSignedUrl('putObject', {
            Bucket: this.bucketName,
            Key: todoId,
            Expires: parseInt(this.urlExpiration)
        })
    }

    getBucketName() {
        return this.bucketName;
    }

}