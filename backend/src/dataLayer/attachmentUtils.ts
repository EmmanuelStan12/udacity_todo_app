import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)

// TODO: Implement the fileStogare logic
export class AttachmentUtils {
    constructor(
        private readonly s3Client = new XAWS.S3({ signatureVersion: 'v4' }),
        private readonly bucketName = process.env.ATTACHMENT_S3_BUCKET,
        private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION
    ) {}

    getAttachmentUrl(attachmentId: string): string {
        const attachmentUrl =  `https://${this.bucketName}.s3.amazonaws.com/${attachmentId}`;
        return attachmentUrl;
    }

    getUploadUrl(attachmentId: string): string {
        const uploadUrl = this.s3Client.getSignedUrl('putObject', {
            Bucket: this.bucketName,
            Key: attachmentId,
            Expires: parseInt(this.urlExpiration)
        })

        return uploadUrl;
    }

    
}