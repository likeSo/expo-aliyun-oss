export type ExpoAliyunOSSModuleEvents = {
  uploadProgress: (params: ChangeEventPayload) => void;
};

export type ChangeEventPayload = {
  uploadedSize: number;
  totalSize: number;
  fileKey: string;
};

export interface CreateBucketOptions {
  bucketName: string;
  permission?: BucketAccessPermission;
  storageClass?: BucketStorageClass;
}

export type BucketAccessPermission =
  | "private"
  | "public-read"
  | "public-read-write"
  | "default";

export type BucketStorageClass = "standard" | "ia" | "archive";
