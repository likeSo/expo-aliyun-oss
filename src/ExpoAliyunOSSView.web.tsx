import * as React from 'react';

import { ExpoAliyunOSSViewProps } from './ExpoAliyunOSS.types';

export default function ExpoAliyunOSSView(props: ExpoAliyunOSSViewProps) {
  return (
    <div>
      <iframe
        style={{ flex: 1 }}
        src={props.url}
        onLoad={() => props.onLoad({ nativeEvent: { url: props.url } })}
      />
    </div>
  );
}
