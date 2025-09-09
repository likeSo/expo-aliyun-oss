package expo.modules.aliyunoss

import android.content.pm.PackageManager
import android.util.Base64
import com.alibaba.sdk.android.oss.ClientConfiguration
import com.alibaba.sdk.android.oss.ClientException
import com.alibaba.sdk.android.oss.OSSClient
import com.alibaba.sdk.android.oss.ServiceException
import com.alibaba.sdk.android.oss.callback.OSSCompletedCallback
import com.alibaba.sdk.android.oss.callback.OSSProgressCallback
import com.alibaba.sdk.android.oss.common.auth.OSSPlainTextAKSKCredentialProvider
import com.alibaba.sdk.android.oss.common.auth.OSSStsTokenCredentialProvider
import com.alibaba.sdk.android.oss.model.CannedAccessControlList
import com.alibaba.sdk.android.oss.model.CreateBucketRequest
import com.alibaba.sdk.android.oss.model.CreateBucketResult
import com.alibaba.sdk.android.oss.model.DeleteMultipleObjectRequest
import com.alibaba.sdk.android.oss.model.DeleteMultipleObjectResult
import com.alibaba.sdk.android.oss.model.ListBucketsRequest
import com.alibaba.sdk.android.oss.model.ListBucketsResult
import com.alibaba.sdk.android.oss.model.PutObjectRequest
import com.alibaba.sdk.android.oss.model.PutObjectResult
import com.alibaba.sdk.android.oss.model.StorageClass
import expo.modules.kotlin.Promise
import expo.modules.kotlin.exception.CodedException
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.net.URL

class ExpoAliyunOSSModule : Module() {
    var ossClient: OSSClient? = null
    var bucketName: String? = null
    var endpoint: String? = null

    // Each module class must implement the definition function. The definition consists of components
    // that describes the module's functionality and behavior.
    // See https://docs.expo.dev/modules/module-api for more details about available components.
    override fun definition() = ModuleDefinition {
        // Sets the name of the module that JavaScript code will use to refer to the module. Takes a string as an argument.
        // Can be inferred from module's class name, but it's recommended to set it explicitly for clarity.
        // The module will be accessible from `requireNativeModule('ExpoAliyunOSS')` in JavaScript.
        Name("ExpoAliyunOSS")

        // Sets constant properties on the module. Can take a dictionary or a closure that returns a dictionary.
        Constants(
            "PI" to Math.PI
        )

        OnCreate {
            val applicationInfo = appContext.reactContext?.packageManager?.getApplicationInfo(
                appContext.reactContext?.packageName.toString(),
                PackageManager.GET_META_DATA
            );
            val ossAccessKeySecret =
                applicationInfo?.metaData?.getString("EXPO_ALIYUN_OSS_ACCESS_KEY_SECRET")
            val ossAccessKeyId =
                applicationInfo?.metaData?.getString("EXPO_ALIYUN_OSS_ACCESS_KEY_ID")
            val _endpoint = applicationInfo?.metaData?.getString("EXPO_ALIYUN_OSS_ENDPOINT")
            val bucket = applicationInfo?.metaData?.getString("EXPO_ALIYUN_OSS_BUCKET")
            if (ossAccessKeyId != null && ossAccessKeySecret != null) {
                val credentialProvider =
                    OSSPlainTextAKSKCredentialProvider(ossAccessKeyId, ossAccessKeySecret)
                val configuration = ClientConfiguration()
                // TODO: 设置请求超时等信息
                ossClient =
                    OSSClient(appContext.reactContext, _endpoint, credentialProvider, configuration)
            }
            bucketName = bucket
            endpoint = _endpoint
        }

        Function("initWithAK") { ossAccessKeySecretID: String, ossAccessKeySecret: String, bucket: String, _endpoint: String ->
            val credentialProvider =
                OSSPlainTextAKSKCredentialProvider(ossAccessKeySecretID, ossAccessKeySecret)
            val configuration = ClientConfiguration()
            // TODO: 设置请求超时等信息
            ossClient =
                OSSClient(appContext.reactContext, _endpoint, credentialProvider, configuration)
            bucketName = bucket
            endpoint = _endpoint
        }

        Function("initWithSTS") { ossAccessKeySecretID: String,
                                  ossAccessKeySecret: String,
                                  token: String,
                                  bucket: String,
                                  _endpoint: String ->
            val credentialProvider = OSSStsTokenCredentialProvider(
                ossAccessKeySecretID,
                ossAccessKeySecret,
                token
            )
            val configuration = ClientConfiguration()
            // TODO: 设置请求超时等信息
            ossClient =
                OSSClient(appContext.reactContext, _endpoint, credentialProvider, configuration)
            bucketName = bucket
            endpoint = _endpoint
        }

        AsyncFunction("uploadAsync") { fileUriOrBase64: String, fileKey: String, promise: Promise ->
            val request: PutObjectRequest
            if (fileUriOrBase64.startsWith("data:")
            ) {
                /// 按照base64处理
                val byteArray = Base64.decode(fileUriOrBase64, Base64.DEFAULT)
                request = PutObjectRequest(bucketName, fileKey, byteArray)
            } else {
                /// 按照文件路径处理
                /// 上传文件需要的是本地文件路径，而不是 file uri
                val resolvedFilePath = fileUriOrBase64.replace("file://", "")
                request = PutObjectRequest(bucketName, fileKey, resolvedFilePath)
            }
            request.progressCallback = object : OSSProgressCallback<PutObjectRequest> {
                override fun onProgress(
                    request: PutObjectRequest?,
                    currentSize: Long,
                    totalSize: Long
                ) {
                    sendEvent(
                        "uploadProgress",
                        mapOf(
                            "uploadedSize" to currentSize,
                            "totalSize" to totalSize,
                            "fileKey" to fileKey
                        )
                    )
                }
            }
            val task = ossClient?.asyncPutObject(
                request,
                object : OSSCompletedCallback<PutObjectRequest, PutObjectResult> {
                    override fun onSuccess(request: PutObjectRequest?, result: PutObjectResult?) {
                        promise.resolve(result?.toString())
                    }

                    override fun onFailure(
                        request: PutObjectRequest?,
                        clientException: ClientException?,
                        serviceException: ServiceException?
                    ) {
                        val throwable = clientException ?: serviceException
                        promise.reject(
                            CodedException(
                                "Resource: ${fileKey} upload failed. Client Exception：${clientException.toString()}，Service Exception: ${serviceException.toString()}",
                                throwable
                            )
                        );
                    }
                })
        }


        AsyncFunction("deleteObjectsAsync") { fileKeys: List<String>, promise: Promise ->
            if (bucketName != null && ossClient != null) {
                val request = DeleteMultipleObjectRequest(bucketName, fileKeys, true)
                ossClient?.asyncDeleteMultipleObject(
                    request,
                    object :
                        OSSCompletedCallback<DeleteMultipleObjectRequest, DeleteMultipleObjectResult> {
                        override fun onSuccess(
                            request: DeleteMultipleObjectRequest?,
                            result: DeleteMultipleObjectResult?
                        ) {
                            promise.resolve(result.toString())
                        }

                        override fun onFailure(
                            request: DeleteMultipleObjectRequest?,
                            clientException: ClientException?,
                            serviceException: ServiceException?
                        ) {
                            val throwable = clientException ?: serviceException
                            promise.reject(
                                CodedException(
                                    "Resource: ${fileKeys} delete failed. Client Exception：${clientException.toString()}，Service Exception: ${serviceException.toString()}",
                                    throwable
                                )
                            )
                        }

                    })
            }
        }

        AsyncFunction("listBuckets") { promise: Promise ->
            if (ossClient != null) {
                val request = ListBucketsRequest()
                ossClient?.asyncListBuckets(
                    request,
                    object : OSSCompletedCallback<ListBucketsRequest, ListBucketsResult> {
                        override fun onSuccess(
                            request: ListBucketsRequest?,
                            result: ListBucketsResult?
                        ) {
                            if (result != null && result.buckets != null) {
                                val buckets = result.buckets.map { it ->
                                    return@map mapOf(
                                        "name" to it.name,
                                        "location" to it.location,
                                        "creationDate" to it.createDate.time,
                                        "storageClass" to it.storageClass
                                    )
                                }
                                promise.resolve(buckets)
                            } else {
                                promise.reject(
                                    CodedException(
                                        "ERR_NO_BUCKETS",
                                        "No Buckets found",
                                        null
                                    )
                                )
                            }
                        }

                        override fun onFailure(
                            request: ListBucketsRequest?,
                            clientException: ClientException?,
                            serviceException: ServiceException?
                        ) {
                            val throwable = clientException ?: serviceException
                            promise.reject(
                                CodedException(
                                    "Cannot list buckets. Client Exception：${clientException.toString()}，Service Exception: ${serviceException.toString()}",
                                    throwable
                                )
                            )
                        }

                    })
            }
        }

        AsyncFunction("createBucket") { options: CreateBucketOptions, promise: Promise ->
            if (ossClient != null) {
                val request = CreateBucketRequest(options.bucketName)
                request.bucketACL = when (options.permission) {
                    "private" -> CannedAccessControlList.Private
                    "public-read" -> CannedAccessControlList.PublicRead
                    "public-read-write" -> CannedAccessControlList.PublicReadWrite
                    else -> CannedAccessControlList.Default
                }

                request.bucketStorageClass = when (options.storageClass) {
                    "archive" -> StorageClass.Archive
                    "ia" -> StorageClass.IA
                    else -> StorageClass.Standard
                }
                ossClient?.asyncCreateBucket(request, object : OSSCompletedCallback<CreateBucketRequest, CreateBucketResult> {
                    override fun onSuccess(
                        request: CreateBucketRequest?,
                        result: CreateBucketResult?
                    ) {
                        promise.resolve()
                    }

                    override fun onFailure(
                        request: CreateBucketRequest?,
                        clientException: ClientException?,
                        serviceException: ServiceException?
                    ) {
                        val throwable = clientException ?: serviceException
                        promise.reject(
                            CodedException(
                                "Cannot create bucket. Client Exception：${clientException.toString()}，Service Exception: ${serviceException.toString()}",
                                throwable
                            )
                        )
                    }

                })
            }
        }

        // Defines event names that the module can send to JavaScript.
        Events("uploadProgress")
    }
}
