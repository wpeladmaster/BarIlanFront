import Amplify from 'aws-amplify';

Amplify.configure({
  Auth: {
    region: 'us-east-1_zXmU8v3CU',
    userPoolId: 'us-east-1_zXmU8v3CU',
    userPoolWebClientId: '6mh9igv6qb8mjttb5ploesjfe',
  },
  Storage: {
    AWSS3: {
      bucket: 'barilan24elad',
      region: 'us-east-1',
    },
  },
});
