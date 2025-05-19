import ExpoModulesCore
import AliyunOSSiOS

public class ExpoAliyunOSSModule: Module {
    
    var ossClient: OSSClient?
    var bucketName: String?
    var endpoint: String?
    
    // Each module class must implement the definition function. The definition consists of components
    // that describes the module's functionality and behavior.
    // See https://docs.expo.dev/modules/module-api for more details about available components.
    public func definition() -> ModuleDefinition {
        
        // Sets the name of the module that JavaScript code will use to refer to the module. Takes a string as an argument.
        // Can be inferred from module's class name, but it's recommended to set it explicitly for clarity.
        // The module will be accessible from `requireNativeModule('ExpoAliyunOSS')` in JavaScript.
        Name("ExpoAliyunOSS")
        
        OnCreate {
            if let ossAccessKeySecret = Bundle.main.object(forInfoDictionaryKey: "EXPO_ALIYUN_OSS_ACCESS_KEY_SECRET") as? String,
                let ossAccessKeyId = Bundle.main.object(forInfoDictionaryKey: "EXPO_ALIYUN_OSS_ACCESS_KEY_ID") as? String,
               let endpoint = Bundle.main.object(forInfoDictionaryKey: "EXPO_ALIYUN_OSS_ENDPOINT") as? String,
               let bucket = Bundle.main.object(forInfoDictionaryKey: "EXPO_ALIYUN_OSS_BUCKET") as? String
            {
                let credential = OSSPlainTextAKSKPairCredentialProvider(plainTextAccessKey: ossAccessKeyId, secretKey: ossAccessKeySecret)
                let config = OSSClientConfiguration()
                // TODO: 配置请求超时等信息
                ossClient = OSSClient(endpoint: endpoint, credentialProvider: credential, clientConfiguration: config)
                
                self.endpoint = endpoint
                self.bucketName = bucket
            }
        }
        
        Function("initWithAK") { (ossAccessKeySecretID: String,
                                  ossAccessKeySecret: String,
                                  bucket: String,
                                  endpoint: String) in
            let credential = OSSPlainTextAKSKPairCredentialProvider(plainTextAccessKey: ossAccessKeySecretID,
                                                                    secretKey: ossAccessKeySecret)
            let config = OSSClientConfiguration()
            // TODO: 配置请求超时等信息
            ossClient = OSSClient(endpoint: endpoint, credentialProvider: credential, clientConfiguration: config)
            self.endpoint = endpoint
            self.bucketName = bucket
        }

        Function("initWithSTS") { (ossAccessKeySecretID: String,
                                  ossAccessKeySecret: String,
                                      token: String,
                                  bucket: String,
                                  endpoint: String) in
                
        }
        
        // Sets constant properties on the module. Can take a dictionary or a closure that returns a dictionary.
        Constants([
            "PI": Double.pi
        ])
        
        // Defines event names that the module can send to JavaScript.
        Events("uploadProgress")
        
        
        AsyncFunction("uploadAsync") { (fileUriOrBase64: String, fileKey: String, promise: Promise) in
            if ossClient != nil, bucketName != nil {
                let request = OSSPutObjectRequest()
                request.bucketName = bucketName!
                request.objectKey = fileKey
                if fileUriOrBase64.starts(with: "data:") {
                    request.uploadingData = Data(base64Encoded: fileUriOrBase64, options: .ignoreUnknownCharacters)
                } else {
                    request.uploadingFileURL = URL(fileURLWithPath: fileUriOrBase64.replacingOccurrences(of: "file://", with: ""))
                }
                request.uploadProgress = { [weak self] bytesSent, totalBytesSent, totalBytesExpectedToSend in
                    self?.sendEvent("uploadProgress", [
                        "uploadedSize": totalBytesSent,
                        "totalSize": totalBytesExpectedToSend,
                        "fileKey": fileKey
                    ])
                }
                let uploadTask = ossClient!.putObject(request)
                uploadTask.continue({ task in
                    if task.error != nil {
                        promise.reject(task.error!)
                    } else {
                        promise.resolve(task.result)
                    }
                })
            }
        }
        
        AsyncFunction("deleteObjectsAsync") {(fileKeys: [String], promise: Promise) in
            if ossClient != nil, bucketName != nil {
                let request = OSSDeleteMultipleObjectsRequest()
                request.keys = fileKeys
                request.bucketName = self.bucketName!
                let task = ossClient?.deleteMultipleObjects(request)
                task?.continue({ task in
                    if task.error != nil {
                        promise.reject(task.error!)
                    } else {
                        promise.resolve(task.result)
                    }
                })
            }
        }
        
        
        // // Enables the module to be used as a native view. Definition components that are accepted as part of the
        // // view definition: Prop, Events.
        // View(ExpoAliyunOSSView.self) {
        //     // Defines a setter for the `url` prop.
        //     Prop("url") { (view: ExpoAliyunOSSView, url: URL) in
        //         if view.webView.url != url {
        //             view.webView.load(URLRequest(url: url))
        //         }
        //     }
            
        //     Events("onLoad")
        // }
    }
}
