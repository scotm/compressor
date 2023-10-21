import { NextResponse } from 'next/server';
import sharp from 'sharp';
import { streamToBuffer } from '@/lib/stream/streamToBuffer';
import { PostReturnType } from '@/lib/types/PostReturnType';
import { storeFileinBlobStorage } from '@/lib/blob/azureBlobStorage';

export async function POST(req: Request): Promise<NextResponse<PostReturnType>> {
    if (!req.body) {
        return NextResponse.json({
            status: 'error',
            message: 'No body provided',
        });
    }
    const original_filename = req.headers.get('original-filename');
    if (!original_filename) {
        return NextResponse.json({
            status: 'error',
            message: 'No filename provided under the original-filename header',
        });
    }

    const body = req.body;
    const filename = original_filename.replace(/\.[^/.]+$/, '') + '.webp'; // replace extension with .webp

    const buffer = await streamToBuffer(body);
    let image: Buffer;
    try {
        image = await sharp(buffer, { failOnError: true }).toFormat('webp').toBuffer();
    } catch (e) {
        return NextResponse.json({
            status: 'error',
            message: 'Error converting image to webp',
        });
    }

    const blob = await storeFileinBlobStorage(filename, image, 'images');

    return NextResponse.json({
        status: 'success',
        old_filename: original_filename,
        blob,
    });
}
