//
//  ExpoAliyunOSSModuleTypes.swift
//  ExpoAliyunOSS
//
//  Created by Aron on 2025/9/9.
//

import ExpoModulesCore

struct CreateBucketOptions: Record {
    @Field
    var bucketName = ""
    @Field
    var permission: String?
    @Field
    var storageClass: String?
}
