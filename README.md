# bank-statement-validator

A tool to validate bank statements.

## Tech Stack

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/) - s3 storage, postgres database
- [Vercel AI SDK](https://ai-sdk.dev/)
- [trigger.dev](https://trigger.dev/) - workflow orchestration
- [Prisma](https://www.prisma.io/) - database ORM and state based schema with migration generation

## Setup

Install dependencies

```bash
pnpm install
```

Start supabase (with docker running)

```bash
pnpx supabase start
```

Copy the `.env.example` file to `.env` and fill in the values.

```bash
cp .env.example .env
```

To get the .env values with `get-from-supabase-status`

```bash
pnpx supabase status
```

Create a [trigger.dev account](https://cloud.trigger.dev/) if you don't have one.

[Create a development API key](https://trigger.dev/docs/apikeys) and set it in the `.env` file.

```bash
TRIGGER_API_KEY=your-trigger-api-key
```

Start the development server

```bash
pnpm dev
```
