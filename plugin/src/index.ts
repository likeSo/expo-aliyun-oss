import { AndroidConfig, ConfigPlugin, withAndroidManifest, withAppDelegate, withInfoPlist } from 'expo/config-plugins';

/// https://docs.expo.dev/modules/config-plugin-and-native-module-tutorial/ 参考文档
const withAliyunOSSConfig: ConfigPlugin<{ ossAccessKeySecret: string, ossAccessKeyId: string, endPoint: string, bucket: string }> = (config, props) => {

    /// 把阿里云AK写入到InfoPlist
    config = withInfoPlist(config, conf => {
        conf.modResults['EXPO_ALIYUN_OSS_ACCESS_KEY_SECRET'] = props.ossAccessKeySecret;
        conf.modResults['EXPO_ALIYUN_OSS_ACCESS_KEY_ID'] = props.ossAccessKeyId;
        conf.modResults['EXPO_ALIYUN_OSS_ENDPOINT'] = props.endPoint;
        conf.modResults['EXPO_ALIYUN_OSS_BUCKET'] = props.bucket;
        return conf
    })

    /// 把阿里云AK写入到安卓Manifest
    config = withAndroidManifest(config, conf => {
        const mainApplication = AndroidConfig.Manifest.getMainApplicationOrThrow(conf.modResults)
        AndroidConfig.Manifest.addMetaDataItemToMainApplication(
            mainApplication,
            'EXPO_ALIYUN_OSS_ACCESS_KEY_SECRET',
            props.ossAccessKeySecret
        )
        AndroidConfig.Manifest.addMetaDataItemToMainApplication(
            mainApplication,
            'EXPO_ALIYUN_OSS_ACCESS_KEY_ID',
            props.ossAccessKeyId
        )
        AndroidConfig.Manifest.addMetaDataItemToMainApplication(
            mainApplication,
            'EXPO_ALIYUN_OSS_ENDPOINT',
            props.endPoint
        )
        AndroidConfig.Manifest.addMetaDataItemToMainApplication(
            mainApplication,
            'EXPO_ALIYUN_OSS_BUCKET',
            props.bucket
        )
        return conf
    })

    return config;
};

export default withAliyunOSSConfig;
