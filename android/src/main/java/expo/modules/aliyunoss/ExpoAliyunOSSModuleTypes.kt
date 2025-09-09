package expo.modules.aliyunoss

import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record

class CreateBucketOptions: Record {
 @Field
 var bucketName = ""
 @Field
 var permission: String? = null
 @Field
 var storageClass: String? = null
}