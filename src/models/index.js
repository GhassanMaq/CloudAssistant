// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';



const { User, Conversation } = initSchema(schema);

export {
  User,
  Conversation
};