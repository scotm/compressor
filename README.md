---
name: WebP drag and drop compressor
slug: compressor
description: Simple Next.js app that uses Next.js, sharp and Azure Blob for image uploads
framework: Next.js
css: Tailwind
---

## How to Use

### Clone and Deploy

Once that's done, create an .env.development.local file and add an **AzureWebJobsStorage** environment variable with an Azure Storage connection string in it.

Next, run Next.js in development mode:

```bash
pnpm dev
```

Deploy it to the cloud with [Vercel](https://vercel.com/new) ([Documentation](https://nextjs.org/docs/deployment)).
