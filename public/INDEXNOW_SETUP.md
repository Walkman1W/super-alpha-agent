# IndexNow Setup Instructions

This file explains how to set up IndexNow for your Super Alpha Agent deployment.

## What is IndexNow?

IndexNow is a protocol that allows websites to instantly notify search engines when content is added, updated, or deleted. This helps search engines discover your content faster.

## Supported Search Engines

- Bing
- Yandex
- Other search engines that support the IndexNow protocol

## Setup Steps

### Step 1: Generate a Key

Generate a random 64-character hexadecimal key:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Example output:
```
a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456
```

### Step 2: Add to Environment Variables

Add the key to your `.env` file:

```env
INDEXNOW_KEY=a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456
```

### Step 3: Create Key Verification File

Create a text file in the `public/` directory named with your key:

```bash
# Replace with your actual key
echo "a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456" > public/a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456.txt
```

This file must be accessible at:
```
https://agentsignals.ai/a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456.txt
```

### Step 4: Deploy

Deploy your changes to production. The key file will be automatically served by Next.js from the `public/` directory.

### Step 5: Verify

1. Visit your key file URL to ensure it's accessible
2. Submit a test agent and check the logs for IndexNow notifications
3. (Optional) Register your site with [Bing Webmaster Tools](https://www.bing.com/webmasters) to view submission history

## How It Works

Once configured, IndexNow will automatically notify search engines when:

1. A new agent is submitted via `/api/submit-agent`
2. An agent is published after email verification via `/api/verify-and-publish`

The notifications happen asynchronously and won't block the main flow if they fail.

## Troubleshooting

### Key file not accessible

Make sure the file is in the `public/` directory and the filename exactly matches your `INDEXNOW_KEY` environment variable.

### No notifications in logs

Check that:
- `INDEXNOW_KEY` is set in your environment
- `NEXT_PUBLIC_SITE_URL` is set correctly
- The key file is accessible via HTTPS

### Search engines not indexing faster

- It may take time for search engines to start using IndexNow data
- Register your site with search engine webmaster tools
- Ensure your content is high quality and follows SEO best practices

## More Information

- [IndexNow Official Documentation](https://www.indexnow.org/)
- [Bing Webmaster Tools](https://www.bing.com/webmasters)
- [Yandex Webmaster](https://webmaster.yandex.com/)
