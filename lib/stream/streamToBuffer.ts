export async function streamToBuffer(stream: ReadableStream<Uint8Array>) {
    const reader = stream.getReader();
    const chunks: Uint8Array[] = [];

    while (true) {
        const { done, value } = await reader.read();
        if (done) {
            break;
        }
        if (value) {
            chunks.push(value);
        }
    }

    const concatenated = new Uint8Array(chunks.reduce((acc: number[], val) => acc.concat(Array.from(val)), []));
    return Buffer.from(concatenated);
}
