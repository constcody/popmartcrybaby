import { gotScraping } from 'got-scraping';
const spuId = '1372';
const url = `https://prod-global-api.popmart.com/shop/v1/shop/productDetails?spuId=${spuId}&s=92b45907685a192544676935a5ce1b65&t=1728316910`;
const discordWebhookUrl = 'https://discord.com/api/webhooks/1254905672429080698/dt0KixVUoCC3WvkMSNMrwBFc6vv8DX-kR8T9e4TBO3QE5RAXgT0suG92ovzSvXHdcnba';

const headers = {
  accept: 'application/json, text/plain, */*',
  'accept-language': 'en-US,en;q=0.9',
  clientkey: 'nw3b089qrgw9m7b7i',
  country: 'US',
  did: '01cUb7X1-j9O2-556U-9555-6h93CICWi4hf',
  language: 'en',
  origin: 'https://www.popmart.com',
  priority: 'u=1, i',
  referer: 'https://www.popmart.com/',
  'sec-ch-ua':
    '"Google Chrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
  'sec-ch-ua-mobile': '?1',
  'sec-ch-ua-platform': '"Android"',
  'sec-fetch-dest': 'empty',
  'sec-fetch-mode': 'cors',
  'sec-fetch-site': 'same-site',
  'td-session-key': 'kWPU31719257419YW6TMXP36Z9',
  'user-agent':
    'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Mobile Safari/537.36',
  'x-client-country': 'US',
  'x-client-namespace': 'america',
  'x-device-os-type': 'web',
  'x-project-id': 'naus',
  'x-sign': 'b86eaec1ad8c417d500f5cf41ab259ce,1719257678',
};

async function checkStock() {
  try {
    const response = await gotScraping({
      url,
      headers,
      responseType: 'json',
    });

    const data = response.body.data;
    const wholeSet = data.sku.find((sku) => sku.title === 'Whole set');
    const singleBox = data.sku.find((sku) => sku.title === 'Single box');

    let inStock = false;
    let message = '';

    if (
      wholeSet &&
      (wholeSet.stock.onlineStock > 0 || wholeSet.stock.onlineLockStock > 0)
    ) {
      inStock = true;
      message += `Whole set:\n- Available: ${wholeSet.stock.onlineStock}\n- Locked: ${wholeSet.stock.onlineLockStock}\n\n`;
    } else {
      message += `Whole set:\n- Available: ${wholeSet.stock.onlineStock}\n- Locked: ${wholeSet.stock.onlineLockStock}\n\n`;

      console.log(
        `Whole set is not in stock! Stock: ${wholeSet.stock.onlineStock}, Lock Stock: ${wholeSet.stock.onlineLockStock}`
      );
    }

    if (
      singleBox &&
      (singleBox.stock.onlineStock > 0 || singleBox.stock.onlineLockStock > 0)
    ) {
      inStock = true;
      message += `Single box:\n- Available: ${singleBox.stock.onlineStock}\n- Locked: ${singleBox.stock.onlineLockStock}\n`;
    } else {
      console.log(
        `Single box is not in stock! Stock: ${singleBox.stock.onlineStock}, Lock Stock: ${singleBox.stock.onlineLockStock}`
      );
    }

    if (inStock) {
      await sendDiscordMessage(message, data.imageUrl);
    }
  } catch (error) {
    console.error('Error checking stock:', error);
  }

  setTimeout(checkStock, 5000);
}

async function sendDiscordMessage(message, imageUrl) {
  try {
    await gotScraping.post(discordWebhookUrl, {
      json: {
        embeds: [
          {
            title: 'Product In Stock!',
            description: message,
            color: 5814783,
            fields: [
              {
                name: 'Product URL',
                value: `https://www.popmart.com/us/products/${spuId}/THE-MONSTERS---Have-a-Seat-Vinyl-Plush-Blind-Box`,
              },
            ],
            image: {
              url: imageUrl,
            },
            timestamp: new Date().toISOString(),
          },
        ],
      },
    });
    console.log('Discord message sent successfully');
  } catch (error) {
    console.error('Error sending Discord message:', error);
  }
}

// Start the initial check
checkStock();
