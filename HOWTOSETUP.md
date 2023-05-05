# How to setup ⚙

1. Install the packages.

   ```bash
   npm install
   ```

2. Go to <https://www.notion.so/my-integrations>, create new integration and copy the `token`.

   ![integration1](https://user-images.githubusercontent.com/56145204/236415042-04d127f5-4235-4219-94c1-676908a5e81f.png)

   ![integration2](https://user-images.githubusercontent.com/56145204/236415157-e20bc05a-04ed-4603-b122-a7b5a2e6ab82.png)
   
   At a minimum, your Integration's capabilities should allow READ-ONLY rules. This means that only you, as the owner, can modify it.

   ![integration3](https://user-images.githubusercontent.com/56145204/236415304-7267137c-fe10-4b9a-bcf0-636b94a6a5c7.png)

3. Clone the Notion template from here: <https://alpiez.notion.site/c1a0af74562d4405b3d857f1e270b1d8?v=47a30b1931ec4e3fa55f54ce6865bbe1>

4. After cloning, connect your template to your integration.

   ![connect](https://user-images.githubusercontent.com/56145204/236415353-c6073842-da7e-451d-886c-782b03f06476.png)

5. After connecting, share your template to public and copy your `database ID`

   ![databaseid](https://user-images.githubusercontent.com/56145204/236415446-08670e85-bd02-42f9-a3a6-e48c330e81ea.png)

6. Add `.env` at the root folder and copy and paste the code below. Then replace `your_integration_token_here` and `your_database_id_here` with the integration token and database ID you just copied above.

   ![env](https://user-images.githubusercontent.com/56145204/236416019-c7fcf55f-69e7-4932-9412-6dfe1be51b67.png)

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
