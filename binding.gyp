{
  "targets": [
    {
      "target_name": "nativeAddon",
      "sources": [ "src/native/main.cc" ],
      "include_dirs": ["<!(node -p \"require('node-addon-api').include_dir\")"],
      "defines": [ 'NAPI_DISABLE_CPP_EXCEPTIONS' ],
    }
  ]
}
