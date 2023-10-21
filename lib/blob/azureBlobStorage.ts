import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';
import { PutBlobResult } from '@vercel/blob';

export async function storeFileinBlobStorage(
    blob_name: string,
    blob: ArrayBuffer,
    directory_name: string,
): Promise<PutBlobResult> {
    const container_name = directory_name;
    const containerClient = await getContainerClient(container_name);
    return await uploadBlob(containerClient, blob_name, blob);
}

export async function fileAlreadyExists(blob_name: string, directory_name: string) {
    const container_name = directory_name;
    const serviceClient = CreateBlobServiceClient();
    const containerClient = serviceClient.getContainerClient(container_name);
    const blockBlobClient = containerClient.getBlockBlobClient(blob_name);
    const blobExists = await blockBlobClient.exists();
    return blobExists;
}

async function getContainerClient(container_name: string) {
    const blobServiceClient = CreateBlobServiceClient();
    const containerClient = blobServiceClient.getContainerClient(container_name);

    // Check if the container exists
    const containerExists = await containerClient.exists();
    if (!containerExists) {
        // Create the container
        await containerClient.create({ access: 'blob' });
    }
    return containerClient;
}

async function uploadBlob(
    containerClient: ContainerClient,
    blob_name: string,
    blob: ArrayBuffer,
): Promise<PutBlobResult> {
    const blockBlobClient = containerClient.getBlockBlobClient(blob_name);
    // Does it already exist?
    const blobExists = await blockBlobClient.exists();
    if (blobExists) {
        return { url: blockBlobClient.url, pathname: blockBlobClient.name, contentType: '', contentDisposition: '' };
        // await blockBlobClient.delete();
    }
    const response = await blockBlobClient.upload(blob, blob.byteLength);
    const url = blockBlobClient.url;
    return { url, pathname: blockBlobClient.name, contentType: '', contentDisposition: '' };
}

function CreateBlobServiceClient(): BlobServiceClient {
    const connection_string = process.env['AzureWebJobsStorage'];
    if (!connection_string) throw new Error('AzureWebJobsStorage is not set');
    const blobServiceClient = BlobServiceClient.fromConnectionString(connection_string);
    return blobServiceClient;
}
