## Expo Aliyun OSS
阿里云OSS SDK for React Native, Expo.

## 引言
上传文件到阿里云本身不难，用fetch配合formdata即可实现，那为什么还要单独写一个包？

首先，React Native上传，在移动端和web端有差异，web端可以直接上传`File`对象，而移动端需要一个`Blob`对象，也就是类似于这样的对象：
`{uri, name, type}`。
其次，你可能需要配置阿里云鉴权，需要计算`Authorization`以及`Signature`，反正我是想想都头大，所以有了这个库。

最后，阿里云对formdata的解析方式可能跟标准协议不一致，我在上传的时候一直报FieldItemTooLong问题，这里要感谢[这位博主](https://phyng.com/2024/05/27/aliyun-oss.html)。

此框架分别调用了安卓和iOS以及NodeJS的原生阿里云包。不只是文件上传，目标是支持所有阿里云原生SDK的功能。

## 安装 Install

```shell
npx expo install expo-aliyun-oss
```

请注意，expo go不支持带有原生代码的三方框架，你应该使用`npx expo run:ios`，编译原生代码并启动项目。

## 配置 Configure

阿里云需要配置`accessKeyId`以及`accessKeySecret`等字段才可以使用。
有两种方式配置这些字段，分别是静态配置（在`app.json`内配置）和动态配置（手动调用初始化接口）。两个方式都能用，任选其一即可。

### 静态配置

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
请注意，环境变量在项目中会被直接替换为明文的内容，官方也不建议把key和secret这种东西放在环境变量内，所以在web端，可以使用代码的方式进行动态初始化。

静态配置写完了后直接使用就行了，鉴权以及初始化的部分就算是完成了。

### 动态配置

手动调用`initWithAK`或者`initWithSTS`方法即可，动态配置的好处是可以延迟初始化。


## 使用 Usage

如果你已经配置好了Config Plugin，那么直接使用就行了，初始化部分已经完成了。
否则在以下的两个初始化方法中任选一个即可。

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
   * 使用阿里云AK初始化。生命周期内只需要初始化一次，好用，但是安全性较低。目前阿里云官方不推荐这种初始化方式。
   * @param ossAccessKeySecretID 阿里云Access Key ID
   * @param ossAccessKeySecret 阿里云Access Key Secret
   * @param bucket 阿里云bucket
   * @param endpoint 阿里云endpoint，比如oss-cn-beijing.aliyuncs.com
   */
  initWithAK(
    ossAccessKeySecretID: string,
    ossAccessKeySecret: string,
    bucket: string,
    endpoint: string
  ): void;

  /**
   * 使用阿里云STS临时安全令牌初始化。token存在有效期限制，生命周期内可以多次初始化。
   * @param ossAccessKeySecretID 阿里云Access Key ID
   * @param ossAccessKeySecret 阿里云Access Key Secret
   * @param token 临时token
   * @param bucket 阿里云bucket
   * @param endpoint 阿里云endpoint，比如oss-cn-beijing.aliyuncs.com
   */
  initWithSTS(
    ossAccessKeySecretID: string,
    ossAccessKeySecret: string,
    token: string,
    bucket: string,
    endpoint: string
  ): void;

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

## 常见问题

### Failure [INSTALL_PARSE_FAILED_MANIFEST_MALFORMED: Failed parse during installPackageLI: /data/app/vmdl2029164326.tmp/base.apk (at Binary XML file line #60): <meta-data> requires an android:value or android:resource attribute]

请正确按照文档配置config plugin.

## 联系我
QQ群：682911244

## 线路图 Roadmap

- [x] 使用STS临时安全令牌的方式初始化阿里云
- [ ] `.listBuckets()`
- [ ] `.createBucket()`
