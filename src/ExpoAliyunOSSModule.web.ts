import { registerWebModule, NativeModule } from 'expo';

import { ExpoAliyunOSSModuleEvents } from './ExpoAliyunOSS.types';
import { Buffer } from 'buffer'

const OSS = require('ali-oss')

class ExpoAliyunOSSModule extends NativeModule<ExpoAliyunOSSModuleEvents> {
  ossAccessKeyId: string;
  ossAccessKeySecret: string;
  endpoint: string;
  bucket: string;
  ossClient?: any;

  constructor() {
    super()
    this.ossAccessKeyId = process.env.EXPO_PUBLIC_ALIYUN_OSS_ACCESS_KEY_ID;
    this.ossAccessKeySecret = process.env.EXPO_PUBLIC_ALIYUN_OSS_ACCESS_KEY_SECRET;
    this.endpoint = process.env.EXPO_PUBLIC_ALIYUN_OSS_ENDPOINT;
    this.bucket = process.env.EXPO_PUBLIC_ALIYUN_OSS_BUCKET;
    if (this.ossAccessKeyId && this.ossAccessKeySecret) {
      this.ossClient = new OSS({
        accessKeyId: this.ossAccessKeyId,
        accessKeySecret: this.ossAccessKeySecret,
        authorizationV4: true,
        bucket: this.bucket,
        endpoint: this.endpoint
      })
    }
  }

  uploadAsync(fileUriOrBase64: string, remoteFilePath: string): Promise<any> {
    if (!this.ossClient) {
      return Promise.reject('OSS client not initialized')
    }
    if (!fileUriOrBase64) {
      return Promise.reject('File content cannot be empty!');
    }
    let resolvedFileInfo
    if (fileUriOrBase64.startsWith('data:')) {
      resolvedFileInfo = Buffer.from(fileUriOrBase64, 'base64')
    } else {
      resolvedFileInfo = fileUriOrBase64.replaceAll('file://', '')
    }
    return this.ossClient!.put(remoteFilePath, resolvedFileInfo);
  }
  deleteObjectsAsync(fileKeys: string[]): Promise<any> {
    if (!this.ossClient) {
      return Promise.reject('OSS client not initialized')
    }
    return this.ossClient.deleteMulti(fileKeys, { quiet: true })
  }


}

export default registerWebModule(ExpoAliyunOSSModule);
