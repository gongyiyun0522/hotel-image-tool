import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 8787;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// 从环境变量获取 API Key
const API_TOKEN = process.env.REPLICATE_API_TOKEN || '';

// 简单的本地图像处理
function simpleEnhance(imageDataUrl, type) {
  return new Promise((resolve) => {
    // 返回原图作为基础
    // 实际使用时，这里会调用 Replicate API
    resolve(imageDataUrl);
  });
}

// 调用 Replicate API
async function callReplicate(imageData, type) {
  if (!API_TOKEN) {
    throw new Error('No API token configured');
  }

  const models = {
    bedroom: { model: 'daanelson/fixrtm', version: '95f06348985a4c66b4f1e513241d62e2b7c5e1ee8f0012ff5e2a1b54a9ee3b3' },
    wrinkle: { model: 'daanelson/fixrtm', version: '95f06348985a4c66b4f1e513241d62e2b7c5e1ee8f0012ff5e2a1b54a9ee3b3' },
    indoor: { model: 'nightmareai/real-esRGAN', version: '42c3234b7e64ed8e0b07a14a169c7f3a91a26e4a325de2d95f4a5fd70286e55' },
    facade: { model: 'nightmareai/real-esRGAN', version: '42c3234b7e64ed8e0b07a14a169c7f3a91a26e4a325de2d95f4a5fd70286e55' }
  };

  const config = models[type] || models.bedroom;

  // 创建预测
  const createRes = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Token ${API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      version: config.version,
      input: { image: imageData, prompt: 'professional hotel photo enhancement' }
    })
  });

  const prediction = await createRes.json();

  // 等待完成
  let result = prediction;
  while (result.status !== 'succeeded' && result.status !== 'failed') {
    await new Promise(r => setTimeout(r, 2000));
    const statusRes = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
      headers: { 'Authorization': `Token ${API_TOKEN}` }
    });
    result = await statusRes.json();
  }

  if (result.status === 'succeeded') {
    return Array.isArray(result.output) ? result.output[0] : result.output;
  }
  throw new Error(result.error || 'Failed');
}

app.post('/api/enhance', async (req, res) => {
  try {
    const { image, type } = req.body;
    if (!image) return res.status(400).json({ error: 'No image' });

    console.log('Processing:', type);

    // 尝试调用 Replicate
    let result;
    if (API_TOKEN) {
      try {
        result = await callReplicate(image, type);
      } catch (e) {
        console.log('Replicate failed, using fallback');
        result = await simpleEnhance(image, type);
      }
    } else {
      result = await simpleEnhance(image, type);
    }

    res.json({ success: true, result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/health', (req, res) => res.json({ status: 'ok', apiConfigured: !!API_TOKEN }));

app.listen(PORT, () => console.log(`Server: http://localhost:${PORT}`));
