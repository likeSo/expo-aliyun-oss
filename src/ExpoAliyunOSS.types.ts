export type ExpoAliyunOSSModuleEvents = {
  uploadProgress: (params: ChangeEventPayload) => void;
};

export type ChangeEventPayload = {
  uploadedSize: number;
  totalSize: number;
  fileKey: string
};
