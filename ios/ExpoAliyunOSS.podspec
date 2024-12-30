require 'json'

package = JSON.parse(File.read(File.join(__dir__, '..', 'package.json')))

Pod::Spec.new do |s|
  s.name           = 'ExpoAliyunOSS'
  s.version        = package['version']
  s.summary        = package['description']
  s.description    = package['description']
  s.license        = package['license']
  s.author         = package['author']
  s.homepage       = package['homepage']
  s.platforms      = {
    :ios => '15.1',
    :tvos => '15.1',
    :osx => '10.14'
  }
  s.swift_version  = '5.4'
  s.source         = { git: 'https://github.com/likeSo/expo-aliyun-oss' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  s.dependency 'AliyunOSSiOS', '~> 2.10.22'

  s.frameworks = 'CoreTelephony', 'SystemConfiguration'
  s.libraries = 'resolv'


  # Swift/Objective-C compatibility
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
  }

  s.source_files = "**/*.{h,m,mm,swift,hpp,cpp}"
end
