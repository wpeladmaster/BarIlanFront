import Amplify from 'aws-amplify';

Amplify.configure({
  Auth: {
    region: 'us-east-1_yFeAbcXhB',
    userPoolId: 'us-east-1_yFeAbcXhB',
    userPoolWebClientId: '47oeprabl0kv6j1rftoggkcmdu',
  },
  Storage: {
    AWSS3: {
      bucket: 'barilan24elad',
      region: 'us-east-1',
    },
  },
});
