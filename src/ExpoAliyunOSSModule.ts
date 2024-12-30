import { NativeModule, requireNativeModule } from 'expo';

import { ExpoAliyunOSSModuleEvents } from './ExpoAliyunOSS.types';

declare class ExpoAliyunOSSModule extends NativeModule<ExpoAliyunOSSModuleEvents> {
  /**
   * 异步上传文件
   * @param fileUriOrBase64 文件本地URI或者Base64格式的文件内容
   * @param fileKey 文件在阿里云OSS的存储目录，包含路径和文件名
   */
  uploadAsync(fileUriOrBase64: string, fileKey: string): Promise<any>;
  /**
   * 批量删除文件
   * @param fileKeys 待删除的文件列表
   */
  deleteObjectsAsync(fileKeys: string[]): Promise<any>
  // initWithAK(ossAccessKeySecretID: string, ossAccessKeySecret: string): Promise<void>
}

// This call loads the native module object from the JSI.
export default requireNativeModule<ExpoAliyunOSSModule>('ExpoAliyunOSS');
