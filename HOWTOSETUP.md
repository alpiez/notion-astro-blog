# How to setup

1. Install the packages.

   ```bash
   npm install
   ```

2. Go to <https://www.notion.so/my-integrations>, create new integration and copy the `token`.

   ![img-integration](/docs/integration1.png)

   ![img-integration](/docs/integration2.png) At minimal, your Integration's capabilities should allow READ-ONLY rules. This means no one can modify except you since you are the owner.

   ![img-integration](/docs/integration3.png)

3. Clone the Notion template from here: <https://alpiez.notion.site/c1a0af74562d4405b3d857f1e270b1d8?v=47a30b1931ec4e3fa55f54ce6865bbe1>

4. After cloning, connect your template to your integration.

   ![img-connect](/docs/connect.png)

5. After connecting, share your template to public and copy your `database ID`

   ![img-databaseid](/docs/databaseid.png)

6. Add `.env` at the root folder and copy and paste the code below. Then replace `your_integration_token_here` and `your_database_id_here` with the integration token and database ID you just copied above.

   ![img-env](/docs/env.png)

   ```Shell
   #.env

   # notion-astro-blog integration
   SECRET_NOTION_KEY="your_integration_token_here"
   # notion-astro-blog
   SECRET_NOTION_DATABASE_ID="your_database_id_here"
   ```

7. Finally, you now can run website!

   ```bash
   npm run dev
   ```
