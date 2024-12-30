import { requireNativeView } from 'expo';
import * as React from 'react';

import { ExpoAliyunOSSViewProps } from './ExpoAliyunOSS.types';

const NativeView: React.ComponentType<ExpoAliyunOSSViewProps> =
  requireNativeView('ExpoAliyunOSS');

export default function ExpoAliyunOSSView(props: ExpoAliyunOSSViewProps) {
  return <NativeView {...props} />;
}
