import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import sharp from 'sharp';
import { Readable } from 'stream';
import { streamToBuffer } from '../../../lib/stream/streamToBuffer';
import { PostReturnType } from '../../../lib/types/PostReturnType';

// export const runtime = 'edge';

const contentType = 'image/webp';

export async function POST(req: Request): Promise<NextResponse<PostReturnType>> {
    if (!req.body) {
        return NextResponse.json({
            status: 'error',
            message: 'No body provided',
        });
    }
    const old_filename = req.headers.get('x-filename');
    if (!old_filename) {
        return NextResponse.json({
            status: 'error',
            message: 'No filename provided under the x-filename header',
        });
    }

    const body = req.body;
    const filename = old_filename.replace(/\.[^/.]+$/, '') + '.webp'; // replace extension with .webp

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

    const blob = await put(filename, Readable.from(image), {
        contentType,
        access: 'public',
    });

    return NextResponse.json({
        status: 'success',
        old_filename,
        blob,
    });
}
