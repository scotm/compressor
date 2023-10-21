'use client';

import { useState, useMemo, ChangeEvent, FormEvent } from 'react';
import LoadingDots from './loading-dots';

import toast from 'react-hot-toast';

import { PutBlobResult } from '@vercel/blob';
import { Cloud } from './Cloud';
import { DismissButton } from './DismissButton';
import { PostReturnType } from '@/lib/types/PostReturnType';

type UploadedFiles = {
    file: File;
    url: string | null;
};

function successToast(url: string) {
    toast(
        (t) => (
            <div className="relative">
                <div className="p-2">
                    <p className="font-semibold text-gray-900">File uploaded!</p>
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
                <DismissButton t={t} toast={toast} />
            </div>
        ),
        { duration: 300000 },
    );
}

const Uploader: React.FC = () => {
    const [files, setFiles] = useState<UploadedFiles[]>([]);
    const [dragActive, setDragActive] = useState(false);
    const [saving, setSaving] = useState(false);

    const checkAndSetFiles = (files: FileList | null) => {
        if (files) {
            const output: UploadedFiles[] = [];
            for (const file of files) {
                if (file.size / 1024 / 1024 > 50) {
                    toast.error('File size too big (max 50MB)');
                    return;
                } else {
                    output.push({ file, url: null });
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
            const response = (await res.json()) as PostReturnType;
            switch (response.status) {
                case 'error':
                    toast.error(response.message);
                    return;
                case 'success':
                    break;
            }
            const { url } = response.blob as PutBlobResult;
            const file = files.find((file) => file.file.name === response.old_filename);
            if (!file) {
                toast.error('Something went wrong after uploading the file. Please try again.');
                return;
            }
            file.url = url;
            setFiles([...files]);
            successToast(url);
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
                files.forEach(({ file }) => {
                    fetch('/api/upload', {
                        method: 'POST',
                        headers: {
                            'content-type': file.type || 'application/octet-stream',
                            'x-filename': file.name,
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
                        <p className="mt-2 text-center text-sm text-gray-500">Drag and drop or click to upload.</p>
                        <p className="mt-2 text-center text-sm text-gray-500">Max file size: 50MB</p>
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
                    <div className="mt-2 grid grid-cols-2">
                        <p className="col-span-2 text-sm text-gray-500">{files.length} files selected</p>
                        {files.map(({ file, url }) => (
                            <>
                                <p key={file.name} className="text-sm text-gray-500">
                                    {file.name}
                                </p>
                                {url ? (
                                    <a
                                        key={url}
                                        className="text-sm text-gray-500 hover:text-red-500 font-bold"
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Download
                                    </a>
                                ) : (
                                    <p className="text-sm text-gray-500"></p>
                                )}
                            </>
                        ))}
                        <button
                            className={
                                'border-black bg-black text-white hover:bg-white hover:text-black flex h-10 w-full items-center justify-center rounded-md border text-sm transition-all focus:outline-none col-span-2'
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
                {saving ? <LoadingDots color="#808080" /> : <p className="text-sm">Confirm upload</p>}
            </button>
        </form>
    );
};

export default Uploader;
