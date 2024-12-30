## Expo Aliyun OSS

> Expo Aliyun OSS是阿里云OSS上传的expo包，主要用来上传文件到阿里云服务器的。上传文件到阿里云本身不难，用fetch配合formdata即可实现，那为什么还要单独写一个包？
>
> 首先，React Native上传，在移动端和web端有差异，web端可以直接上传`File`对象，而移动端需要一个`Blob`对象，也就是类似于这样的对象：
> `{uri, name, type}`。
> 其次，你可能需要配置阿里云鉴权，需要计算`Authorization`以及`Signature`，反正我是想想都头大，所以有了这个库。
>
> 最后，阿里云对formdata的解析方式可能跟标准协议不一致，我在上传的时候一直报FieldItemTooLong问题，这里要感谢[这位博主](https://phyng.com/2024/05/27/aliyun-oss.html)。
>
> 此框架分别调用了安卓和iOS以及NodeJS的原生阿里云包。

## 安装 Install

```shell
npx expo install expo-aliyun-oss
```

## 配置 Configure

阿里云需要配置`accessKeyId`以及`accessKeySecret`等字段才可以使用。

对于安卓和iOS，使用`expo config plugin`，在`app.json`内配置这两个字段，如下所示：

```json
    "plugins": [
      [
        "expo-aliyun-oss",
        {
          "ossAccessKeySecret": "ossAccessKeySecret",
          "ossAccessKeyId": "ossAccessKeyId",
          "endPoint": "endPoint",
          "bucket": "bucket"
        }
      ]
    ]
```

Expo config plugin不支持web。所以使用环境变量来配置。请注意，expo环境变量必须以`EXPO_PUBLIC`开头：

```shell
EXPO_PUBLIC_ALIYUN_OSS_ACCESS_KEY_ID=ossAccessKeyId
EXPO_PUBLIC_ALIYUN_OSS_ACCESS_KEY_SECRET=ossAccessKeySecret
EXPO_PUBLIC_ALIYUN_OSS_ENDPOINT=endPoint
EXPO_PUBLIC_ALIYUN_OSS_BUCKET=bucket
```

配置好了后直接使用就行了，鉴权以及初始化的部分就算是完成了。

请注意，环境变量在项目中会被直接替换为明文的内容，官方也不建议把key和secret这种东西放在环境变量内，所以在web端，可以使用`initWithAK`方法进行动态初始化：

```ts
initWithAK(ossAccessKeySecretID: string, ossAccessKeySecret: string, bucket: string, endpoint: string): void;
```





## 使用 Usage

```ts
import ExpoAliyunOSS from 'expo-aliyun-oss';
import * as ImagePicker from 'expo-image-picker'

const result = await ImagePicker.launchImageLibraryAsync({ selectionLimit: 1 })
if (!result.canceled) {
  const fileKey = "images/xxx.png"
	const uploadResult = await ExpoAliyunOSS.uploadAsync(result.asset[0].uri, fileKey)	
  const uploadedUri = "https://bucket.endpoint/fileKey"
}
```



## 上传进度条 Upload progress



```tsx
function App() {
  const onUploadProgress = useEvent(ExpoAliyunOSS, 'uploadProgress');
  
  // onUploadProgress {uploadedSize, totalSize, fileKey}
}
```





## API

```ts
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
```

## 线路图 Roadmap

- [ ] 使用STS临时安全令牌的方式初始化阿里云
- [ ] `.listBuckets()`
- [ ] `.createBucket()`
