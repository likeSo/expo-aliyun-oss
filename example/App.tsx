import { useEvent } from 'expo';
import ExpoAliyunOSS, { ExpoAliyunOSSView } from 'expo-aliyun-oss';
import { Button, SafeAreaView, ScrollView, Text, View, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker'
import { useState } from 'react';

export default function App() {
  const onUploadProgress = useEvent(ExpoAliyunOSS, 'uploadProgress');
  const [imageFile, setImageFile] = useState<ImagePicker.ImagePickerAsset>()

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.container}>
        <Text style={styles.header}>Module API Example</Text>
        <Group name="Constants">
          <Text>{ExpoAliyunOSS.PI}</Text>
        </Group>
        <Group name="Events">
          <Text>上传进度：{onUploadProgress?.uploadedSize}/{onUploadProgress?.totalSize}；{onUploadProgress?.fileKey}</Text>
        </Group>
        <Group name='Pick Image'>
          <Button title='选择图片' onPress={async () => {
            const result = await ImagePicker.launchImageLibraryAsync({ selectionLimit: 1 })
            if (!result.canceled) {
              setImageFile(result.assets[0])
            }
          }} />

          {
            Boolean(imageFile) && <Image source={{ uri: imageFile?.uri }} style={{ width: 80, height: 80 }} />
          }

          <Button title='上传' onPress={() => {
            if (imageFile) {
              const fileKey = `app-uploaded-files/test-${Math.random()}-${imageFile.fileName}`
              ExpoAliyunOSS.uploadAsync(imageFile.uri, fileKey)
                .then(result => { 
                  console.log('上传结果：' + result)
                  Alert.alert(`上传结果：${JSON.stringify(result)}`) 
                  /// 文件URL = https://bucket.endpoint/fileKey
                  console.log(`文件路径大致是：https://chat-bucket-vv.oss-cn-beijing.aliyuncs.com/${fileKey}`)
                })
                .catch(reason => { 
                  console.log(`上传失败：${reason}`)
                  Alert.alert(`上传失败：${reason}`)
                 })
            }
          }} />

        </Group>
      </ScrollView>
    </SafeAreaView>
  );
}

function Group(props: { name: string; children: React.ReactNode }) {
  return (
    <View style={styles.group}>
      <Text style={styles.groupHeader}>{props.name}</Text>
      {props.children}
    </View>
  );
}

const styles = {
  header: {
    fontSize: 30,
    margin: 20,
  },
  groupHeader: {
    fontSize: 20,
    marginBottom: 20,
  },
  group: {
    margin: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
  },
  container: {
    flex: 1,
    backgroundColor: '#eee',
  },
  view: {
    flex: 1,
    height: 200,
  },
};
