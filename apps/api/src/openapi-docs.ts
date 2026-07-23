const swaggerUiVersion = '5.32.11';
const swaggerUiAssetsUrl = `https://cdn.jsdelivr.net/npm/swagger-ui-dist@${swaggerUiVersion}`;

export const openApiDocsHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex" />
    <title>Bite API documentation</title>
    <link rel="stylesheet" href="${swaggerUiAssetsUrl}/swagger-ui.css" />
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="${swaggerUiAssetsUrl}/swagger-ui-bundle.js"></script>
    <script src="${swaggerUiAssetsUrl}/swagger-ui-standalone-preset.js"></script>
    <script>
      window.onload = function () {
        window.ui = SwaggerUIBundle({
          url: '/openapi.json',
          dom_id: '#swagger-ui',
          deepLinking: true,
          displayRequestDuration: true,
          presets: [
            SwaggerUIBundle.presets.apis,
            SwaggerUIStandalonePreset
          ],
          layout: 'StandaloneLayout'
        });
      };
    </script>
  </body>
</html>`;
