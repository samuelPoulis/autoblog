# Automation Setup Guide

Follow these steps to configure and run the automation:

## Step 1: Download the Scripts
- Download the .zip file and save it to your desired project folder
- Unzip the file inside of the folder

## Step 2: Configure to website

Edit the environment variables:

- Open the `.env` file with any text editor.
- Update the variables with your specific configuration, the prompts are inside.

## Step 3: Install dependencies

- Right click on the blog_automation folder and open it inside a terminal
- Run the command `npm install` inside that file directory.
- NOTE: You must have NodeJS installed on your computer.

## Step 4: WordPress Setup

Add the following PHP code to your WordPress site. Use a plugin like **Code Snippets** or directly insert it into your active theme's `functions.php` file or a custom plugin. Make sure you have Rank Math installed on that Wordpress website.

```php
// Start of code snippet.
add_action('rest_api_init', function () {
    register_rest_route('custom/v1', '/rank-math-keywords', [
        'methods' => 'GET',
        'callback' => function () {
            global $wpdb;

            $results = $wpdb->get_results("
                SELECT DISTINCT meta_value
                FROM {$wpdb->postmeta}
                WHERE meta_key = 'rank_math_focus_keyword'
                AND meta_value != ''
            ");

            $keywords = [];
            foreach ($results as $row) {
                $row_keywords = explode(',', $row->meta_value);
                foreach ($row_keywords as $keyword) {
                    $keywords[] = trim($keyword);
                }
            }

            return array_values(array_unique($keywords));
        },
    ]);
});

function allow_rank_math_meta_fields_update() {
    register_post_meta('post', 'rank_math_description', [
        'single'        => true,
        'type'          => 'string',
        'show_in_rest'  => true,
        'auth_callback' => function() {
            return current_user_can('edit_posts');
        }
    ]);

    register_post_meta('post', 'rank_math_focus_keyword', [
        'single'        => true,
        'type'          => 'string',
        'show_in_rest'  => true,
        'auth_callback' => function() {
            return current_user_can('edit_posts');
        }
    ]);
}
add_action('init', 'allow_rank_math_meta_fields_update');

//end of code snippet
```

## How the Automation Works

The automation performs the following actions:

1. **Data Retrieval**: Extracts keywords and titles from the WordPress website using:
   - `get_titles.js`
   - `get_keywords.js`

2. **Keyword & Topic Generation**:
   - The topic is generated using the titles.
   - The topic and retrieved keywords generate new keywords.
   - The new title is generated using the topic and keywords
   - The meta description is generated using the topic, new keywords, and new title. 

3. **Content Generation**:
   - Blog content is generated using `content.js`, which uses.
   - You can edit any of the AI instructions inside of the files: `title.js`, `topic.js`, `meta.js`, `keywordgen.js`, and `content.js`.

4. **Publishing**:
   - Generated content is automatically posted to the WordPress site via `run.js`.

## Running the Automation

Ensure Node.js is installed on your system.

After updating your `.env` file and adding the PHP snippet to WordPress, run the automation script in your terminal with:

```bash
node run
```

