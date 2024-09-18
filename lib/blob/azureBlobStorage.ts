import { BlobServiceClient, ContainerClient, BlobHTTPHeaders } from '@azure/storage-blob';
import { PutBlobResult } from '@vercel/blob';

export async function storeFileinBlobStorage(
    blob_name: string,
    blob: ArrayBuffer,
    directory_name: string = 'default',
): Promise<PutBlobResult> {
    const container_name = directory_name;
    const containerClient = await getContainerClient(container_name);
    return await uploadBlob(containerClient, blob_name, blob);
}

export async function fileAlreadyExists(blob_name: string, directory_name: string) {
    const container_name = directory_name;
    const serviceClient = await CreateBlobServiceClient();
    const containerClient = serviceClient.getContainerClient(container_name);
    const blockBlobClient = containerClient.getBlockBlobClient(blob_name);
    const blobExists = await blockBlobClient.exists();
    return blobExists;
}

async function getContainerClient(container_name: string) {
    const blobServiceClient = await CreateBlobServiceClient();
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
    clobber: boolean = true,
): Promise<PutBlobResult> {
    const blockBlobClient = containerClient.getBlockBlobClient(blob_name);
    // Does it already exist?
    const blobExists = await blockBlobClient.exists();
    if (blobExists) {
        // If it does, do we clobber it?
        if (clobber) {
            await blockBlobClient.delete();
        } else {
            // If we don't clobber it, return the existing blob
            return {
                url: blockBlobClient.url,
                pathname: blockBlobClient.name,
                downloadUrl: blockBlobClient.url,
                contentType: '',
                contentDisposition: '',
            };
        }
    }
    const http_headers: BlobHTTPHeaders = {
        blobContentType: 'image/webp',
        blobContentDisposition: `attachment; filename=<${blob_name}>`,
    };

    await blockBlobClient.upload(blob, blob.byteLength, {
        blobHTTPHeaders: http_headers,
    });
    return { url: blockBlobClient.url, pathname: blockBlobClient.name, contentType: '', contentDisposition: '', downloadUrl:  blockBlobClient.url };
}

async function CreateBlobServiceClient(): Promise<BlobServiceClient> {
    const connection_string = process.env['AzureWebJobsStorage'];
    if (!connection_string) throw new Error('AzureWebJobsStorage is not set');
    const blobServiceClient = BlobServiceClient.fromConnectionString(connection_string);
    const properties = await blobServiceClient.getProperties();
    properties.defaultServiceVersion = '2023-11-03';
    await blobServiceClient.setProperties(properties);
    return blobServiceClient;
}
