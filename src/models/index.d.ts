import { ModelInit, MutableModel, __modelMeta__, ManagedIdentifier } from "@aws-amplify/datastore";
// @ts-ignore
import { LazyLoading, LazyLoadingDisabled, AsyncCollection } from "@aws-amplify/datastore";





type EagerUser = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<User, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly username: string;
  readonly conversations?: (Conversation | null)[] | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyUser = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<User, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly username: string;
  readonly conversations: AsyncCollection<Conversation>;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type User = LazyLoading extends LazyLoadingDisabled ? EagerUser : LazyUser

export declare const User: (new (init: ModelInit<User>) => User) & {
  copyOf(source: User, mutator: (draft: MutableModel<User>) => MutableModel<User> | void): User;
}

type EagerConversation = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Conversation, 'id'>;
    readOnlyFields: 'updatedAt';
  };
  readonly id: string;
  readonly userID: string;
  readonly message: string;
  readonly response: string;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  readonly userConversationsId?: string | null;
}

type LazyConversation = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Conversation, 'id'>;
    readOnlyFields: 'updatedAt';
  };
  readonly id: string;
  readonly userID: string;
  readonly message: string;
  readonly response: string;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  readonly userConversationsId?: string | null;
}

export declare type Conversation = LazyLoading extends LazyLoadingDisabled ? EagerConversation : LazyConversation

export declare const Conversation: (new (init: ModelInit<Conversation>) => Conversation) & {
  copyOf(source: Conversation, mutator: (draft: MutableModel<Conversation>) => MutableModel<Conversation> | void): Conversation;
}