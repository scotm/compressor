import { PutBlobResult } from '@vercel/blob';

export type PostReturnType =
    | {
          status: 'success';
          old_filename: string;
          blob: PutBlobResult;
      }
    | {
          status: 'error';
          message: string;
      };
