export default {
  type: 'object',
  properties: {
    name: { type: 'string' },
    queryStringParameters: {
      type: 'object',
      properties: {
<<<<<<< HEAD
        chainId: { type: 'string', enum: ['0', '1', '2', '3', '4', '5', '6','8'] },
=======
        chainId: { type: 'string', enum: ['0', '1', '2', '3', '4', '5', '6'] },
>>>>>>> origin/develop
      },
      additionalProperties: false,
    },
  },
  required: ['name'],
} as const;
