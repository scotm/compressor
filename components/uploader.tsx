'use client';

import { useState, useMemo, ChangeEvent, FormEvent } from 'react';
import LoadingDots from './loading-dots';

import toast, { Toast } from 'react-hot-toast';

import { PutBlobResult } from '@vercel/blob';
import { Cloud } from './Cloud';

const DismissButton = (t: Toast) => (
    <button
        onClick={() => toast.dismiss(t.id)}
        className="absolute top-0 -right-2 inline-flex text-gray-400 focus:outline-none focus:text-gray-500 rounded-full p-1.5 hover:bg-gray-100 transition ease-in-out duration-150"
    >
        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path
                fillRule="evenodd"
                d="M5.293 5.293a1 1 0 011.414 0L10
        8.586l3.293-3.293a1 1 0 111.414 1.414L11.414
        10l3.293 3.293a1 1 0 01-1.414 1.414L10
        11.414l-3.293 3.293a1 1 0 01-1.414-1.414L8.586
        10 5.293 6.707a1 1 0 010-1.414z"
                clipRule="evenodd"
            />
        </svg>
    </button>
);

export default function Uploader() {
    const [files, setFiles] = useState<File[]>([]);

    const [dragActive, setDragActive] = useState(false);

    const [saving, setSaving] = useState(false);

    const checkAndSetFiles = (files: FileList | null) => {
        if (files) {
            const output: File[] = [];
            for (const file of files) {
                if (file.size / 1024 / 1024 > 50) {
                    toast.error('File size too big (max 50MB)');
                    return;
                } else {
                    output.push(file);
                }
            }
            setFiles(output);
        }
    };

    const onChangePicture = (event: ChangeEvent<HTMLInputElement>) => {
        checkAndSetFiles(event.target.files);
    };

    const onSuccessfulUpload = async (res: Response) => {
        if (res.status === 200) {
            const { url } = (await res.json()) as PutBlobResult;
            toast(
                (t) => (
                    <div className="relative">
                        <div className="p-2">
                            <p className="font-semibold text-gray-900">
                                File uploaded!
                            </p>
                            <p className="mt-1 text-sm text-gray-500">
                                Your file has been uploaded to{' '}
                                <a
                                    className="font-medium text-gray-900 underline"
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {url}
                                </a>
                            </p>
                        </div>
                        <DismissButton {...t} />
                    </div>
                ),
                { duration: 300000 }
            );
        } else {
            const error = await res.text();
            toast.error(error);
        }
        setSaving(false);
    };

    const saveDisabled = useMemo(() => {
        return saving;
    }, [saving]);

    return (
        <form
            className="grid gap-6"
            onSubmit={async (e: FormEvent<HTMLFormElement>) => {
                e.preventDefault();
                setSaving(true);
                if (!files) {
                    toast.error('No file selected');
                    setSaving(false);
                    return;
                }
                files.forEach((file) => {
                    fetch('/api/upload', {
                        method: 'POST',
                        headers: {
                            'content-type':
                                file?.type || 'application/octet-stream',
                        },
                        body: file,
                    }).then(onSuccessfulUpload);
                });
            }}
        >
            <div>
                <div className="space-y-1 mb-4">
                    <h2 className="text-xl font-semibold">Upload files</h2>
                </div>
                <label
                    htmlFor="image-upload"
                    className="group relative mt-2 flex h-72 cursor-pointer flex-col items-center justify-center rounded-md border border-gray-300 bg-white shadow-sm transition-all hover:bg-gray-50"
                >
                    <div
                        className="absolute z-[5] h-full w-full rounded-md"
                        onDragOver={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setDragActive(true);
                        }}
                        onDragEnter={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setDragActive(true);
                        }}
                        onDragLeave={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setDragActive(false);
                        }}
                        onDrop={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setDragActive(false);
                            checkAndSetFiles(e.dataTransfer.files);
                        }}
                    />
                    <div
                        className={`${
                            dragActive ? 'border-2 border-black' : ''
                        } absolute z-[3] flex h-full w-full flex-col items-center justify-center rounded-md px-10 transition-all bg-white opacity-100 hover:bg-gray-50`}
                    >
                        <Cloud dragActive={dragActive} />
                        <p className="mt-2 text-center text-sm text-gray-500">
                            Drag and drop or click to upload.
                        </p>
                        <p className="mt-2 text-center text-sm text-gray-500">
                            Max file size: 50MB
                        </p>
                        <span className="sr-only">Photo upload</span>
                    </div>
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                    <input
                        id="image-upload"
                        name="image"
                        type="file"
                        multiple={true}
                        accept="image/*"
                        className="sr-only"
                        onChange={onChangePicture}
                    />
                </div>
                {files && files.length > 0 && (
                    <div className="mt-2 justify-between">
                        <p className="text-sm text-gray-500">
                            {files.length} files selected
                        </p>
                        {files.map((file) => (
                            <p
                                key={file.name}
                                className="text-sm text-gray-500"
                            >
                                {file.name}
                            </p>
                        ))}
                        <button
                            className={
                                'border-black bg-black text-white hover:bg-white hover:text-black flex h-10 w-full items-center justify-center rounded-md border text-sm transition-all focus:outline-none'
                            }
                            onClick={() => setFiles([])}
                        >
                            Clear
                        </button>
                    </div>
                )}
            </div>

            <button
                disabled={saveDisabled}
                className={`${
                    saveDisabled
                        ? 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400'
                        : 'border-black bg-black text-white hover:bg-white hover:text-black'
                } flex h-10 w-full items-center justify-center rounded-md border text-sm transition-all focus:outline-none`}
            >
                {saving ? (
                    <LoadingDots color="#808080" />
                ) : (
                    <p className="text-sm">Confirm upload</p>
                )}
            </button>
        </form>
    );
}
