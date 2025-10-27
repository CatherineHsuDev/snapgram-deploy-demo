import { Client, Account, Databases, Storage, Avatars } from "appwrite";
// https://appwrite.io/docs/references/cloud/client-web/databases
// env error --> vite-env.d.ts
export const appwriteConfig = {
  projectId: import.meta.env.VITE_APPWRITE_PROJECT_ID,
  url: import.meta.env.VITE_APPWRITE_URL,
  databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID,
  storageId: import.meta.env.VITE_APPWRITE_STORAGE_ID,
  userCollectionId: import.meta.env.VITE_APPWRITE_USER_COLLECTION_ID,
  postCollectionId: import.meta.env.VITE_APPWRITE_POST_COLLECTION_ID,
  savesCollectionId: import.meta.env.VITE_APPWRITE_SAVES_COLLECTION_ID,
};

export const client = new Client();

client.setEndpoint(appwriteConfig.url); // Your API Endpoint
client.setProject(appwriteConfig.projectId); // Your project ID

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const avatars = new Avatars(client);
