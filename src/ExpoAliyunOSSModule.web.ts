import { registerWebModule, NativeModule } from "expo";

import {
  CreateBucketOptions,
  ExpoAliyunOSSModuleEvents,
} from "./ExpoAliyunOSS.types";
import { Buffer } from "buffer";

const OSS = require("ali-oss");

class ExpoAliyunOSSModule extends NativeModule<ExpoAliyunOSSModuleEvents> {
  ossAccessKeyId: string;
  ossAccessKeySecret: string;
  endpoint: string;
  bucket: string;
  ossClient?: any;
  region?: string;

  constructor() {
    super();
    this.ossAccessKeyId = process.env.EXPO_PUBLIC_ALIYUN_OSS_ACCESS_KEY_ID;
    this.ossAccessKeySecret =
      process.env.EXPO_PUBLIC_ALIYUN_OSS_ACCESS_KEY_SECRET;
    this.endpoint = process.env.EXPO_PUBLIC_ALIYUN_OSS_ENDPOINT;
    this.bucket = process.env.EXPO_PUBLIC_ALIYUN_OSS_BUCKET;
    this.region = this.endpoint
      ?.replaceAll("http://", "")
      .replaceAll("https://", "")
      .replaceAll(".aliyuncs.com", "");
    if (this.ossAccessKeyId && this.ossAccessKeySecret) {
      this.ossClient = new OSS({
        accessKeyId: this.ossAccessKeyId,
        accessKeySecret: this.ossAccessKeySecret,
        authorizationV4: true,
        bucket: this.bucket,
        region: this.region,
      });
    }
  }

  initWithAK(
    ossAccessKeySecretID: string,
    ossAccessKeySecret: string,
    bucket: string,
    endpoint: string
  ): void {
    this.ossAccessKeyId = ossAccessKeySecretID;
    this.ossAccessKeySecret = ossAccessKeySecret;
    this.endpoint = endpoint;
    this.bucket = bucket;
    this.region = this.endpoint
      ?.replaceAll("http://", "")
      .replaceAll("https://", "")
      .replaceAll(".aliyuncs.com", "");
    if (this.ossAccessKeyId && this.ossAccessKeySecret) {
      this.ossClient = new OSS({
        accessKeyId: this.ossAccessKeyId,
        accessKeySecret: this.ossAccessKeySecret,
        authorizationV4: true,
        bucket: this.bucket,
        region: this.region,
      });
    }
  }

  initWithSTS(
    ossAccessKeySecretID: string,
    ossAccessKeySecret: string,
    token: string,
    bucket: string,
    endpoint: string
  ): void {
    this.ossAccessKeyId = ossAccessKeySecretID;
    this.ossAccessKeySecret = ossAccessKeySecret;
    this.endpoint = endpoint;
    this.bucket = bucket;
    this.region = this.endpoint
      ?.replaceAll("http://", "")
      .replaceAll("https://", "")
      .replaceAll(".aliyuncs.com", "");
    if (this.ossAccessKeyId && this.ossAccessKeySecret) {
      this.ossClient = new OSS({
        accessKeyId: this.ossAccessKeyId,
        accessKeySecret: this.ossAccessKeySecret,
        authorizationV4: true,
        bucket: this.bucket,
        region: this.region,
        stsToken: token,
      });
    }
  }

  uploadAsync(fileUriOrBase64: string, remoteFilePath: string): Promise<any> {
    if (!this.ossClient) {
      return Promise.reject("OSS client not initialized");
    }
    if (!fileUriOrBase64) {
      return Promise.reject("File content cannot be empty!");
    }
    let resolvedFileInfo;
    if (fileUriOrBase64.startsWith("data:")) {
      resolvedFileInfo = Buffer.from(fileUriOrBase64.split(",")[1], "base64");
    } else {
      resolvedFileInfo = fileUriOrBase64.replaceAll("file://", "");
    }
    return this.ossClient!.put(remoteFilePath, resolvedFileInfo);
  }
  deleteObjectsAsync(fileKeys: string[]): Promise<any> {
    if (!this.ossClient) {
      return Promise.reject("OSS client not initialized");
    }
    return this.ossClient.deleteMulti(fileKeys, { quiet: true });
  }

  createBucket(options: CreateBucketOptions): Promise<void> {
    if (!this.ossClient) {
      return Promise.reject("OSS client not initialized");
    }
    const storageClass =
      options.storageClass?.replace(/^\w/, (c) => c.toUpperCase()) ||
      "Standard";
    return this.ossClient.putBucket(options.bucketName, {
      storageClass,
      acl: options.permission,
      // dataRedundancyType: options.dataRedundancyType,
    });
  }

  listBuckets(): Promise<any[]> {
    if (!this.ossClient) {
      return Promise.reject("OSS client not initialized");
    }
    return this.ossClient.listBuckets();
  }
}

export default registerWebModule(ExpoAliyunOSSModule);
