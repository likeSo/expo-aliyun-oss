import type { StyleProp, ViewStyle } from 'react-native';

export type OnLoadEventPayload = {
  url: string;
};

export type ExpoAliyunOSSModuleEvents = {
  uploadProgress: (params: ChangeEventPayload) => void;
};

export type ChangeEventPayload = {
  uploadedSize: number;
  totalSize: number;
  fileKey: string
};

export type ExpoAliyunOSSViewProps = {
  url: string;
  onLoad: (event: { nativeEvent: OnLoadEventPayload }) => void;
  style?: StyleProp<ViewStyle>;
};
