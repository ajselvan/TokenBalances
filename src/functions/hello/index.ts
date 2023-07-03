import schema from './schema';

export default {
<<<<<<< HEAD
  handler: `${__dirname.split(process.cwd())[1].substring(1)}/file.main`,
=======
  handler: `${__dirname.split(process.cwd())[1].substring(1)}/handler.main`,
>>>>>>> origin/develop
  events: [
    {
      http: {
        method: 'get',
        path: 'hello',
        request: {
          schemas: {
            'application/json': schema,
          },
        },
      },
    },
  ],
  // Remove this if you want to disable Canary Deployments
  deploymentSettings: {
    type: 'Linear10PercentEvery1Minute',
    alias: 'Live',
    alarms: ['Hello5XXErrorsAlarm', 'HelloFunctionErrorsAlarm'],
  },
};
